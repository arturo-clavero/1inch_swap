const { setupOrderWatcher } = require('./utils/setupOrderWatcher');

async function waitForOrders(self) {
	console.log("waiting for orders")
	const order = await redis.lindex('orders', -1);
	if (order)
	{
		await self.nextAction();
		return;
	}
	await setupOrderWatcher(self);
}

module.exports = {waitForOrders};