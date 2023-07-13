const WebSocket = require('ws');
const cleanUpDeeply = require('./clean-up-deeply');
const merge = require('lodash/merge');
const { Pool } = require('pg');
require('dotenv').config();


// Создаем пул соединений к базе данных
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  host: 'localhost',
  database: process.env.POSTGRES_DB,
  port: 3200,
});

// ---------------------------------------------------------------------- //

let globalGameList = null;
let globalGames = {};
let gameList = null;
let games = {};
const SQL_QUERY=`INSERT INTO history (
	id,
	globalGameId, 
	bookieKey,
	sportKey,
	isLive,
	startTime,
	team1Id,
	team2Id,
	team1Name,
	team2Name,
	score1,
	score2,
	first_,
	draw_,
	firstOrDraw,
	second_,
	drawOrSecond,
	firstOrSecond,
	now_
	) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 
		$12, $13, $14, $15, $16, $17, $18, $19)`

// ---------------------------------------------------------------------- //

const socket = new WebSocket('wss://api.livesport.tools/v2?clientKey=mn8W5KhnuwBHdgSJNdUkZbXRC8EFPAfm');

socket.send = ((send) => {
	return function ({ requestId = null, requestType, data = null }) {
		let message = JSON.stringify([requestId, requestType, data]);
		console.info(`>> ${message}`);
		return send.call(this, message);
	};
})(socket.send);

socket.on('open', () => {
	socket.nextRequestId = 1;
	console.info(`WebSocket: open.`);

	socket.send({
		requestId: socket.nextRequestId++,
		requestType: 'authorize',
		data: {
			secretKey: 'Y%7tRIA8hlgH8#nk60x&4W$CPJh^%x99',
		},
	});
});

socket.on('message', (message) => {
	message = message.toString();
	// console.info(`<<`, JSON.parse(message));
	let requestId, error, responseType, data;

	try {
		[requestId, error, responseType, data] = JSON.parse(message);
	} catch (error) {
		console.error(error);
		return;
	}

	if (error) {
		console.error(error);
		return;
	}

	let responseTypeMatch = null;

	if (responseType === 'authorized') {
		// Subscribing to GameList

		socket.send({
			requestId: socket.nextRequestId++,
			requestType: 'gameList/subscribe',
			data: {},
		});

		return;
	}

	// GameList
	// ----------------------------------------------------------------------

	if (responseType === 'gameList/subscribed') {
		// console.info(`Subscribed to GameList.`);
		return;
	}

	if (responseTypeMatch = responseType.match(/^gameList\/(created|updated|deleted)$/)) {
		if (data === '\x00') {
			gameList = null;
		} else {
			if (gameList) {
				merge(gameList, data);
				cleanUpDeeply(gameList);
			} else {
				gameList = data;
			}
		}

		syncGameSubscriptions();
		return;
	}

	if (responseTypeMatch = responseType.match(/^game:([0-9]+)\/(created|updated|deleted)/)) {
		let gameId = Number(responseTypeMatch[1]);

		if (data === '\x00') {
			delete games[gameId];
		} else {
			let game = games[gameId] || null;

			if (game) {
				merge(game, data);
				cleanUpDeeply(game);
			} else {
				game = games[gameId] = data;
			}

			// console.log(game);
			var dataForDB = [
				game?.id,
				game?.globalGameId,
				game?.bookie?.key,
				game?.sport?.key,
				game?.isLive,
				new Date(game.startTime).getTime(),
				game?.team1?.id,
				game?.team2?.id,
				game?.team1?.name,
				game?.team2?.name,
				game?.scores?.result?.mainTime?.[0],
				game?.scores?.result?.mainTime?.[1],
				game?.outcomes?.result?.mainTime?.wins?.first?.odds,
				game?.outcomes?.result?.mainTime?.wins?.draw?.odds,
				game?.outcomes?.result?.mainTime?.wins?.second?.odds,
				game?.outcomes?.result?.mainTime?.wins?.firstOrDraw?.odds,
				game?.outcomes?.result?.mainTime?.wins?.drawOrSecond?.odds,
				game?.outcomes?.result?.mainTime?.wins?.firstOrSecond?.odds,
				new Date().getTime()
			];

			console.log(dataForDB);
			sqlRequest(SQL_QUERY,  dataForDB);
		}
	}

	// GlobalGameList
	// ----------------------------------------------------------------------

	if (responseType === 'globalGameList/subscribed') {
		console.info(`Successfuly subscribed to GlobalGameList.`);
		return;
	}

	if (responseTypeMatch = responseType.match(/^globalGameList\/(created|updated|deleted)$/)) {
		if (data === '\x00') {
			globalGameList = null;
		} else {
			if (globalGameList) {
				merge(globalGameList, data);
				cleanUpDeeply(globalGameList);
			} else {
				globalGameList = data;
			}
		}

		syncGlobalGameSubscriptions();
		return;
	}

	if (responseTypeMatch = responseType.match(/^globalGame:([0-9]+)\/(created|updated|deleted)/)) {
		let globalGameId = Number(responseTypeMatch[1]);

		if (data === '\x00') {
			delete globalGames[globalGameId];
		} else {
			let globalGame = globalGames[globalGameId] || null;

			if (globalGame) {
				merge(globalGame, data);
				cleanUpDeeply(globalGame);
			} else {
				globalGame = globalGames[globalGameId] = data;
			}
		}
	}
});

socket.on('error', (error) => {
	console.error(error);
});

socket.on('close', () => {
	console.info('WebSocket: closed.');
	process.exit(0);
});

// ---------------------------------------------------------------------- //

function syncGlobalGameSubscriptions() {
	for (let globalGameId of Object.keys(globalGameList || {}).map(Number)) {
		if (globalGames[globalGameId] === undefined) {
			globalGames[globalGameId] = null;

			socket.send({
				requestId: socket.nextRequestId++,
				requestType: `globalGame:${globalGameId}/subscribe`,
			});
		}
	}
}

function syncGameSubscriptions() {
	for (let gameId of Object.keys(gameList || {}).map(Number)) {
		if (games[gameId] === undefined) {
			games[gameId] = null;

			socket.send({
				requestId: socket.nextRequestId++,
				requestType: `game:${gameId}/subscribe`,
			});
		}
	}
}


async function sqlRequest(
	sqlQuery=SQL_QUERY, values=[]){
	const client = await pool.connect();

  try {

    // Выполнение запроса
    const result = await client.query(sqlQuery, values);
    console.log('Record added successfully!');
  } catch (error) {
    console.error('Error adding record:', error);
  } finally {
    // Всегда освобождаем соединение
    client.release();
  }
}