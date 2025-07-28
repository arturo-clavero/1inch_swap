async function bridge(self) {
	console.log(`[Relayer ${self.id}] bridge`);
	await self.simulateAsyncWork();
	await self.nextAction();
}

module.exports = {bridge};