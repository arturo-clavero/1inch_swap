async function startBridge(self) {
	console.log(`[Relayer ${self.id}] start bridge`);

	const contract = require('../../contracts/contractData')["router"];
	await self.waitForEvent(contract, "Bridged", contract.bridge)
	
	console.log(`[Relayer ${self.id}] finish bridge`);
	
	await self.nextAction();
}

module.exports = {startBridge};