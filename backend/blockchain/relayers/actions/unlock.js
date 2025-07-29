const contracts = require("../../contracts/contractData");

async function unlock(self) {
	console.log(`[Relayer ${self.id}] unlock`);
	
	contracts["router"].unlock();
	
	await self.nextAction();
}

module.exports = {unlock};