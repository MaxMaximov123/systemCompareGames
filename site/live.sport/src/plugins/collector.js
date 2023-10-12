import Websocket from 'ws';
import EventEmitter from 'events';
import merge from 'lodash/merge.js';



export default class Collector extends EventEmitter {
	static CLIENT_KEY = 'CKPYF4Bw894hZtDBLTPB2G693uqSQTWm';
	static SECRET_KEY = 'UCM^ZvgfCq?%cw&BPvt9+PwDn_gBn94T';

	gameList = null;
	gameListWebSocket = {};
	isConnected = false;
	webSocket = null;

	constructor(game1Id, game2Id, games) {
		super();
		this.game1Id = game1Id;
		this.game2Id = game2Id;
		this.games = games;

		this.start();
	}

	async waitForTimeout(time) {
		await new Promise((resolve) => setTimeout(resolve, time));
	}

	keepConnection() {
		(async () => {
			while (!this.isDestroyed) {
				await new Promise((resolve) => {
					let webSocket = new Websocket(`ws://'94.130.200.118:8300?clientKey=${Collector.CLIENT_KEY}`);

					webSocket.send = ((send) => {
						return ({ type, data = null, id = null, relatedId = null, error = null }) => {
							if (!type) {
								throw new Error(`Parameter "message.type" is required.`);
							}

							let params = [
								type,
								data,
								id,
								relatedId,
								error,
							];

							params = params.reduceRight((params, param) => {
								if (param !== null || params.length > 0) {
									params.unshift(param);
								}

								return params;
							}, []);

							let message = JSON.stringify(params);

							return send.call(webSocket, message);
						};
					})(webSocket.send);


					webSocket.on('open', () => {
						this.webSocket = webSocket;
						this.isConnected = true;
						this.emit('connected');

						this.webSocket.send({
							type: 'authorize',
							data: {
								secretKey: Collector.SECRET_KEY,
							},
							relatedId: 1,
						});
					});

					webSocket.on('message', async (message) => {
						message = message.toString();
						let originalMessage = message;

						try {
							message = ((type = null, data = null, id = null, relatedId = null, error = null) => {
								return {
									type,
									data,
									id,
									relatedId,
									error,
								}
							})(...JSON.parse(message));
						} catch (error) {
							return;
						}

						if (message.error) {
							return;
						}

						if (message.type === 'alive') {
							return;
						}

						let messageTypeMatch = null;

						if (message.type === 'authorized') {
							// Subscribing to GameList

							this.webSocket.send({
								type: `game:${game1Id}/subscribe`,
							});
							this.webSocket.send({
								type: `game:${game2Id}/subscribe`,
							});
							return;
						}

						// GameList
						// ----------------------------------------------------------------------

						if (messageTypeMatch = message.type.match(/^game:([0-9]+)\/(detailUpdate|deleted)/)) {
							let gameId = Number(messageTypeMatch[1]);
							return this.games[gameId].gotDetails(message.data, messageTypeMatch[2]);
						}
					});

					webSocket.on('error', (error) => {
					});

					webSocket.on('close', (closeCode) => {
						this.webSocket = null;
						this.isConnected = false;
						this.emit('disconnected');

						return resolve();
					});
				});
				await this.waitForTimeout(1000);
			}
		})();
	}

	async start() {
		this.keepConnection();
	}
}
