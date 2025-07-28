const Redis = require('ioredis');

//import actions
const { assignOrder } = require('./actions/assignOrder');
const { swap } = require('./actions/swap');
const { bridge } = require('./actions/bridge');

class Relayer {
	constructor(id) {
		this.id = id;
		this.redis = new Redis();
		this.relayerActions = [
			assignOrder,
			swap,
			bridge,
			swap,
		];
		this.waitForOrders();

	}
	waitForOrders(){
		this.relayerStep = -1;
		this.order = null;
	}

	async simulateAsyncWork() { //for testing
		return new Promise((resolve) => setTimeout(resolve, 500));
	}

	async nextAction() {
		this.relayerStep++;
		console.log(`[Relayer ${this.id}] next action`, this.relayerStep);
		if (this.relayerStep >= this.relayerActions.length) {
		console.log(`[Relayer ${this.id}] order`, this.order, 'finalized');
		this.waitForOrders();
		await this.nextAction();
		return;
		}
		await this.relayerActions[this.relayerStep](this);
	}
}

module.exports = Relayer;
