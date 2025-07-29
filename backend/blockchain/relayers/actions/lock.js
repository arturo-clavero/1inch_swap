const contracts = require("../../contracts/contractData");

async function lock(self) {
	console.log(`[Relayer ${self.id}] lock`);

	contracts["router"].lock();

	await self.nextAction();
}

module.exports = {lock};