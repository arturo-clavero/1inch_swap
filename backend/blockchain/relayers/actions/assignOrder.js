async function assignOrder(self) {
	console.log(`[Relayer ${self.id}] Waiting to claim an order...`);

	const result = await self.redis.brpop('orders', 0);
	self.order = result[1];
	
	console.log(`[Relayer ${self.id}] Assigned order:`, self.order);
	await self.nextAction();
}

module.exports = {assignOrder};