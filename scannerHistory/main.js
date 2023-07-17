const WebSocket = require('ws');
const cleanUpDeeply = require('./clean-up-deeply');
const merge = require('lodash/merge');
require('dotenv').config();



//_______________________ инициализация и функции бд _______________________________//

const knex = require('knex');
const config = require('./knexfile');

const db = knex(config.development);


async function initDB(){
	const createGamesTable = async () => {
		try {
			await db.schema.createTable('games', function(table) {
			table.bigint('id').primary().unique();
			table.bigint('globalGameId');
			table.string('team1Id');
			table.string('team2Id');
			table.string('team1Name');
			table.string('team2Name');
			table.string('sportKey');
			table.string('bookieKey');
			table.bigint('startTime');
			});
			console.log('Games table created');
		} catch (error) {}
	};
		
	createGamesTable();

	const createOutcomesTable = async () => {
		try {
			await db.schema.createTable('outcomes', function(table) {
			table.bigint('id');
			table.string('path');
			table.float('odds');
			table.bigint('now');
			});
			console.log('Outcomes table created');
		} catch (error) {}
		};
		
	createOutcomesTable();

	const createScoresTable = async () => {
		try {
			await db.schema.createTable('scores', function(table) {
			table.bigint('id');
			table.string('path');
			table.integer('score');
			table.bigint('now');
			});
			console.log('Outcomes table created');
		} catch (error) {}
		};
		
	createScoresTable();

}

initDB();

const addGame = async (data) => {
	try {
	  await db('games').insert(data);
	  console.log('game added');
	} catch (error) {
		console.error(error);
		console.log(data);
	}
  };

const addScore = async (data) => {
	try {
		await db('scores').insert(data);
		console.log('score added');
	} catch (error) {
		console.error(error);
		console.log(data);
	}
};

const addOucome = async (data) => {
	try {
		await db('outcomes').insert(data);
		console.log('outcome added');
	} catch (error) {
		console.error(error);
		console.log(data);
	}
};
//_________________________________________________________________//




// ---------------------------------------------------------------------- //

let globalGameList = null;
let globalGames = {};
let gameList = null;
let games = {};
// ---------------------------------------------------------------------- //

const socket = new WebSocket('wss://api.livesport.tools/v2?clientKey=mn8W5KhnuwBHdgSJNdUkZbXRC8EFPAfm');

socket.send = ((send) => {
	return function ({ requestId = null, requestType, data = null }) {
		let message = JSON.stringify([requestId, requestType, data]);
		// console.info(`>> ${message}`);
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
				addGame({
					id: game?.id,
					globalGameId: game?.globalGameId,
					team1Id: game?.team1?.id,
					team2Id: game?.team2?.id,
					team1Name: game?.team1?.name,
					team2Name: game?.team2?.name,
					sportKey: game?.sport?.key,
					bookieKey: game?.bookie?.key,
					startTime: new Date(game.startTime).getTime()
				})
			}
			
			if (data.outcomes?.result){
				const paths = getAllPathsOutcomes(data.outcomes.result);
				for (let path in paths){
					addOucome({
						id: gameId,
						path: path,
						odds: typeof paths[path] === 'boolean' ? Number(paths[path]) + 1 : paths[path],
						now: new Date().getTime()
					})
				}
			}

			if (data.scores?.result){
				const paths = getAllPathsOutcomes(data.scores.result);
				for (let path in paths){	
					addScore({
						id: gameId,
						path: path,
						score: paths[path],
						now: new Date().getTime()
					})
				}
			}

			// console.log(game);

			// var dataForDB = [
			// 	game?.id,
			// 	game?.globalGameId,
			// 	game?.bookie?.key,
			// 	game?.sport?.key,
			// 	game?.isLive,
			// 	new Date(game.startTime).getTime(),
			// 	game?.team1?.id,
			// 	game?.team2?.id,
			// 	game?.team1?.name,
			// 	game?.team2?.name,
			// 	game?.scores?.result?.mainTime?.[0],
			// 	game?.scores?.result?.mainTime?.[1],
			// 	game?.outcomes?.result?.mainTime?.wins?.first?.odds,
			// 	game?.outcomes?.result?.mainTime?.wins?.draw?.odds,
			// 	game?.outcomes?.result?.mainTime?.wins?.second?.odds,
			// 	game?.outcomes?.result?.mainTime?.wins?.firstOrDraw?.odds,
			// 	game?.outcomes?.result?.mainTime?.wins?.drawOrSecond?.odds,
			// 	game?.outcomes?.result?.mainTime?.wins?.firstOrSecond?.odds,
			// 	new Date().getTime()
			// ];
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


function getAllPathsOutcomes(outcomes){
	const results = {}

	function traverseObject(currentPath, object) {
		for (const key in object) {
			const newPath = currentPath ? `${currentPath}.${key}` : key;
			if (typeof object[key] === 'object' && object[key] !== null) {
				traverseObject(newPath, object[key]);
			} else {
				results[newPath] = object[key] === '\x00' ? null : object[key];
			}
		}
	}

	traverseObject('', outcomes);
	return results;

}