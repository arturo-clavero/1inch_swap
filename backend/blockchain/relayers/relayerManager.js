const Relayer = require('./Relayer');

async function startRelayers(count = 1) {
	const relayers = [];
	for (let i = 0; i < count; i++) {
		const relayer = new Relayer(i + 1);
		relayers.push(relayer);
	}

	await Promise.all(relayers.map((r) => r.nextAction()));
}

module.exports = { startRelayers };
