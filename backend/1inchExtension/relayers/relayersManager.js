const Resolver = require('./Relayers');

async function startRelayers(count = 1) {
	const resolvers = [];
	for (let i = 0; i < count; i++) {
		const resolver = new Resolver(i + 1);
		resolvers.push(resolver);
	}

	await Promise.all(resolvers.map((r) => r.nextAction()));
}

module.exports = { startRelayers };
