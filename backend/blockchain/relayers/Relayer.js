const Redis = require('ioredis');

const waiting = -1;

class Relayer {
  constructor(id) {
    this.id = id;
    this.redis = new Redis();
    this.relayerActions = [
      this.assignOrder.bind(this),
      this.swap.bind(this),
      this.bridge.bind(this),
      this.swap.bind(this),
    ];
	this.waitForOrders();

  }
  waitForOrders(){
	this.relayerStep = -1;
	this.order = null;
  }

  async assignOrder() {
    console.log(`[Relayer ${this.id}] Waiting to claim an order...`);
    const result = await this.redis.brpop('orders', 0);
    this.order = result[1];
    console.log(`[Relayer ${this.id}] Assigned order:`, this.order);
    await this.nextAction();
  }

  async swap() {
    console.log(`[Relayer ${this.id}] swap`);
    await this.simulateAsyncWork();
    await this.nextAction();
  }

  async bridge() {
    console.log(`[Relayer ${this.id}] bridge`);
    await this.simulateAsyncWork();
    await this.nextAction();
  }

  async simulateAsyncWork() {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }

  async nextAction() {
    this.relayerStep++;
    console.log(`[Relayer ${this.id}] next action`, this.relayerStep);
    if (this.relayerStep >= this.relayerActions.length) {
      console.log(`[Relayer ${this.id}] order`, this.order, 'finalized');
      this.waitForOrders();
      await this.assignOrder();
      return;
    }
    await this.relayerActions[this.relayerStep]();
  }
}

module.exports = Relayer;
