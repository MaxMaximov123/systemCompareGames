const WebSocket = require('ws');
const cleanUpDeeply = require('./clean-up-deeply');
const merge = require('lodash/merge');
require('dotenv').config();



//_______________________ инициализация и функции бд _______________________________//

const knex = require('knex');
const config = require('./knexfile');

const db = knex(config.development);


const addGame = async (data) => {
	try {
	  await db('games').insert(data);
	  console.log('game added');
	} catch (error) {
		// console.error(error);
	}
  };

const addScore = async (data) => {
	try {
		await db('scores').insert(data);
		console.log('score added');
	} catch (error) {
		// console.error(error);
	}
};

const addOucome = async (data) => {
	try {
		await db('outcomes').insert(data);
		console.log('outcome added');
	} catch (error) {
		// console.error(error);
	}
};

const updateGame = async (gameId, data) => {
	try {
		await db('games').where('id', gameId).update(data);
		console.log('update game');
	} catch (error) {
		console.error(error);
	}
};
//_________________________________________________________________//




// ---------------------------------------------------------------------- //

let globalGameList = null;
let globalGames = {};
let gameList = null;
let games = {};
let insrtsOutcomes = [];
let insrtsScores = [];
let updatesStartTime = [];
// ---------------------------------------------------------------------- //

const socket = new WebSocket('wss://api.livesport.tools/v2?clientKey=mn8W5KhnuwBHdgSJNdUkZbXRC8EFPAfm');

setInterval(async () => {
	if (insrtsOutcomes.length){
		try {await db('outcomes').insert(insrtsOutcomes);} catch(e){}
		insrtsOutcomes.length = 0;
		console.log('outcomes added');
	}
	if (insrtsScores.length){
		try {await db('scores').insert(insrtsScores);} catch(e){}
		insrtsScores.length = 0;
		console.log('scores added');
	}
	if (updatesStartTime.length){
		try {await db('startTimeUpdates').insert(updatesStartTime);} catch(e){}
		updatesStartTime.length = 0;
		console.log('updatesStartTime added');
	}
}, 1000);

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

socket.on('message', async (message) => {
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
				if (data.startTime){
					updatesStartTime.push({
						gameId: game.id,
						startTime: new Date(game.startTime),
						time: new Date()
					});
					// try {
					// 	await db('startTimeUpdates').insert({
					// 		gameId: game.id,
					// 		startTime: new Date(game.startTime),
					// 		time: new Date()
					// 	});
					// 	console.log('update startTime');
					// } catch (error) {console.error(error)}
				}
				if (data?.team1?.name || data?.team2?.name){
					try {
						await db('teamsNamesUpdates').insert({
							gameId: game.id,
							team1Name: game.team1?.name,
							team2Name: game.team2?.name,
							time: new Date()
						});
						console.log('update names');
					} catch (error) {console.error(error)}
				}
				if (data.globalGameId || data.startTime || data.liveFrom || data.liveTill || data.unavailableAt){
					await updateGame(gameId, {
						globalGameId: game.globalGameId,
						unavailableAt: game.unavailableAt,
						startTime: new Date(game.startTime).getTime(),
						liveFrom: new Date(game.liveFrom).getTime(),
						liveTill: new Date(game.liveTill).getTime(),
						lastUpdate: new Date().getTime(),
					});
				}
			} else {
				game = games[gameId] = data;
				await addGame({
					id: game?.id,
					globalGameId: game?.globalGameId,
					isLive: game?.isLive,
					team1Id: game?.team1?.id,
					team2Id: game?.team2?.id,
					team1Name: game?.team1?.name,
					team2Name: game?.team2?.name,
					sportKey: game?.sport?.key,
					bookieKey: game?.bookie?.key,
					unavailableAt: game?.unavailableAt,
					startTime: new Date(game?.startTime).getTime(),
					liveFrom: new Date(game?.liveFrom).getTime(),
					liveTill: new Date(game?.liveTill).getTime(),
					lastUpdate: new Date().getTime(),
				});
				updatesStartTime.push({
					gameId: game.id,
					startTime: new Date(game.startTime),
					time: new Date()
				});
				// try {
				// 	await db('startTimeUpdates').insert({
				// 		gameId: game.id,
				// 		startTime: new Date(game.startTime),
				// 		time: new Date()
				// 	});
				// 	console.log('update startTime');
				// } catch (error) {console.error(error)}
				try {
					const lastNamesUpdate = await db('teamsNamesUpdates')
					.select('team1Name', 'team2Name')
					.where('gameId', game.id).orderBy('id', 'desc').limit(1);
					if (lastNamesUpdate.length > 0){
						if (lastNamesUpdate[0].team1Name !== game.team1?.name || lastNamesUpdate[0].team2Name !== game.team2?.name){
							await db('teamsNamesUpdates').insert({
								gameId: game.id,
								team1Name: game.team1?.name,
								team2Name: game.team2?.name,
								time: new Date(),
							});
							console.log('update names');
						}
					}
					
				} catch (error) {console.error(error)}
			}
			
			if (data.outcomes?.result){
				const paths = getAllPathsOutcomes(data.outcomes.result);
				for (let path in paths){
					insrtsOutcomes.push({
						id: gameId,
						path: path,
						odds: paths[path],
						now: new Date().getTime(),
						isLive: game?.isLive,
					});
				}
			}

			if (data.scores?.result){
				const paths = getAllPathsOutcomes(data.scores.result, false);
				for (let path in paths){
					insrtsScores.push({
						id: gameId,
						path: path,
						score: Math.floor(paths[path]),
						now: new Date().getTime()
					});
				}
			}
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


function getAllPathsOutcomes(outcomes, type=true){
	const results = {}

	function traverseObject(currentPath, object) {
		for (const key in object) {
			const newPath = currentPath ? `${currentPath};${key}` : key;
			if (typeof object[key] === 'object' && key !== 'odds') {
				traverseObject(newPath, object[key]);
			} else {
				if (type){
					if (newPath.includes('odds') && object[key] !== '\x00') results[newPath.slice(0, newPath.length - 5)] = object[key];
				} else {
					results[newPath] = object[key] === '\x00' ? null : object[key];
				}
				
			}
		}
	}

	traverseObject('', outcomes);
	return results;

}