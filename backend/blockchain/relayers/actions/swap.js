async function swap(self) {
	console.log(`[Relayer ${self.id}] swap`);

	await self.simulateAsyncWork();
	
	await self.nextAction();
}

module.exports = {swap};