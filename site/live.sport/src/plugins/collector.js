import EventEmitter from 'events';
import merge from 'lodash/merge.js';



export default class Collector extends EventEmitter {
	static CLIENT_KEY = 'CKPYF4Bw894hZtDBLTPB2G693uqSQTWm';
	static SECRET_KEY = 'UCM^ZvgfCq?%cw&BPvt9+PwDn_gBn94T';

	matcher = null;
	gameList = null;
	gameListWebSocket = {};
	isConnected = false;
	webSocket = null;

	constructor({ frontend }) {
		super();
		this.frontend = frontend;

		this.start().catch((error) => {
			console.log(error);
		});
	}

	keepConnection() {
		(async () => {
			while (!this.isDestroyed) {
				await new Promise((resolve) => {
					let webSocket = new WebSocket(`ws://94.130.200.118:8300?clientKey=${Collector.CLIENT_KEY}`);

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


					webSocket.onopen = () => {
						this.webSocket = webSocket;
						this.isConnected = true;
						console.log(`Collector connected.`);
						this.emit('connected');

						this.webSocket.send({
							type: 'authorize',
							data: {
								secretKey: Collector.SECRET_KEY,
							},
							relatedId: 1,
						});
					};

					webSocket.onmessage = async (message) => {
						message = message.data;
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
							console.log(error);
							return;
						}

						if (message.error) {
							console.log(`Collector: ${JSON.stringify(message.error)}`);
							return;
						}

						if (message.type === 'alive') {
							return;
						}

						let messageTypeMatch = null;

						if (message.type === 'authorized') {
							this.emit('authorized');
							return;
						}

						if (messageTypeMatch = message.type.match(/^game:([0-9]+)\/(isUpToDate)/)) {
							let gameId = Number(messageTypeMatch[1]);
							this.frontend.games[gameId].isUpToDate = true;
							let gameIds = this.frontend.gameIds;
							if (this.frontend.games[gameIds.game1].isUpToDate && this.frontend.games[gameIds.game2].isUpToDate) {
								this.emit('allGamesIsUpToDate');
							}
						}

						if (messageTypeMatch = message.type.match(/^game:([0-9]+)\/(detailUpdate|deleted)/)) {
							let gameId = Number(messageTypeMatch[1]);
							return this.frontend.games[gameId].gotDetails(message.data, messageTypeMatch[2]);
						}
					};

					webSocket.onerror = (error) => {
						console.log(error);
					};

					webSocket.onclose = (closeCode) => {
						this.webSocket = null;
						this.isConnected = false;
						this.emit('disconnected');

						console.log(
							'closeCode:', closeCode
						);

						return resolve();
					};
				});
				await this.waitForTimeout(1000);
			}
		})();
	}

	async waitForTimeout(time) {
		await new Promise((resolve) => setTimeout(resolve, time));
	}

	async start() {
		console.log(`Collector is starting...`);
		this.keepConnection();
		console.log(`Collector started.`);
	}
}
