import isEmpty from 'lodash/isEmpty.js';
import merge from 'lodash/merge.js';
import EventEmitter from 'events';

export default class Game extends EventEmitter {
	id = null;
	key = null;
	bookieKey = null;
	details = {};
	matcher = null;
	detailUpdates = [];
	outcomeLiveUpdates = {};
	outcomePreUpdates = {};
	scoreUpdates = {};
	comparisonTime = 0;
	isUpToDate = false;
	TIK_STEP = 3;

	constructor({ id, collector, frontend }) {
		super();
		this.id = id;
		this.collector = collector;
		this.frontend = frontend;
		this.collector.webSocket.send({
			type: `game:${id}/subscribe`,
		});
		this.startCreatingNewTiks();
	}

	// Details
	// ----------------------------------------------------------------------

	cleanUpDeeply(value) {
		if (Array.isArray(value)) {
			for (let index = 0; index < value.length; ) {
				if (value[index] === '\x00') {
					value.splice(index, 1);
				} else {
					this.cleanUpDeeply(value[index]);
					++index;
				}
			}
		} else if (typeof value === 'object') {
			for (let key in value) {
				if (value[key] === '\x00') {
					delete value[key];
				} else {
					this.cleanUpDeeply(value[key]);
				}
			}
		}
	}

	gotDetails(details, action) {
		if (details === '\x00'){
			return this.destroy();
		}

		if (action === 'deleted') {
			return this.destroy();
		}

		if (!details) {
			return;
		}

		if (action === 'detailUpdate') {
			if (!isEmpty(details)) {
				this.detailUpdates.push({time: new Date(), changes: details, type: action});

				if (this.details) {
					merge(this.details, details.changes);
					this.cleanUpDeeply(this.details.changes);
				} else {
					this.details = details.changes;
				}

				if (details.changes?.outcomes?.result) {
					this.addDetailUpdatesOutcomesAndScores({ 
						outcomes: details.changes.outcomes.result,
						time: Math.floor(new Date(details.time).getTime() / 1000 / this.TIK_STEP ) * this.TIK_STEP ,
					});
				}

				if (details.changes?.scores?.result) {
					this.addDetailUpdatesOutcomesAndScores({ 
						scores: details.changes.scores.result,
						time: Math.floor(new Date(details.time).getTime() / 1000 / this.TIK_STEP ) * this.TIK_STEP ,
					});
				}
			}
		}
		
	}

	addDetailUpdatesOutcomesAndScores({ outcomes = null, scores = null, time }) {
		const paths = {}

		function traverseObject(currentPath, object) {
			for (const key in object) {
				const newPath = currentPath ? `${currentPath};${key}` : key;

				if (typeof object[key] === 'object' && key !== 'odds') {
					traverseObject(newPath, object[key]);
				} else {

					if (outcomes) {
						if (newPath.includes('odds') && object[key] !== '\x00') paths[newPath.slice(0, newPath.length - 5)] = object[key];
					} else if (scores) {
						paths[newPath] = object[key] === '\x00' ? null : object[key];
					}
					
				}
			}
		}

		traverseObject('', outcomes || scores || {});

		if (outcomes){
			for (let path in paths) {
				let outcome = null;
				if (this.details.isLive) {
					outcome = this.outcomeLiveUpdates[path] || {path: path, updates: []};
				} else {
					outcome = this.outcomePreUpdates[path] || {path: path, updates: []};
				}

				if (outcome.updates.length > 0) {
					let lastUpdate = outcome.updates.at(-1);
					for (let tikIndex=lastUpdate.tikIndex+this.TIK_STEP;tikIndex<time;tikIndex+=this.TIK_STEP) {
						outcome.updates.push({tikIndex: tikIndex, value: lastUpdate.value});
					}
				}
				if (time - (outcome.updates.at(-1)?.tikIndex || 0) < this.TIK_STEP) {
					outcome.updates[outcome.updates.length-1] = {tikIndex: time, value: paths[path]};
				} else {
					outcome.updates.push({tikIndex: time, value: paths[path]});
				}

				if (this.details.isLive) {
					this.outcomeLiveUpdates[path] = outcome;
				} else {
					this.outcomePreUpdates[path] = outcome;
				}
			}
		}

		if (scores){
			for (let path in paths) {
				let score = this.scoreUpdates[path] || {path: path, updates: []};

				if (score.updates.length > 0) {
					let lastUpdate = score.updates.at(-1);
					for (let tikIndex = lastUpdate.tikIndex+this.TIK_STEP;tikIndex < time;tikIndex += this.TIK_STEP) {
						score.updates.push({tikIndex: tikIndex, value: lastUpdate.value});
					}
				}

				if (time - (score.updates.at(-1)?.tikIndex || 0) < this.TIK_STEP) {
					score.updates[score.updates.length-1] = {tikIndex: time, value: paths[path]};
				} else {
					score.updates.push({tikIndex: time, value: paths[path]});
				}
				this.scoreUpdates[path] = score;
			}
		}
	}

	async startCreatingNewTiks() {
		while (!this.isDestroyed) {
			let maxTikIndex = Math.floor(new Date().getTime() / 1000 / this.TIK_STEP) * this.TIK_STEP;
			
			let dataType = this.frontend.typePlotToGameUpdates[this.frontend.activeTab];
			let path = this.frontend.data[this.frontend.activeTab].selectedPath;

			if (dataType && path) {
				let gameLastUpdate = this[dataType][path].updates.at(-1);

				for (let tikIndex=gameLastUpdate.tikIndex+this.TIK_STEP;tikIndex<=maxTikIndex;tikIndex+=this.TIK_STEP) {
					this[dataType][path].updates.push({
						tikIndex: tikIndex,
						value: gameLastUpdate.value,
					});
				}
			}

			await new Promise((resolve) => setTimeout(resolve, 3000));
		}
		
	}

	destroy() {
		this.isDestroyed = true;
		this.emit('destroy');
		process.exit();
	}
}
