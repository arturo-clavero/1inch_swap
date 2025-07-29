const Redis = require('ioredis');
const redis = new Redis();

//create listener for contract Event
const ContractListener = require('./contracts/ContractListener');
const contracts = require('./contracts/contractData');

function storeVerifiedOrder(sender, msg, value) {
	console.log(`Received event from ${sender},<${msg}> value: ${value.toString()}`);
	redis.lpush('orders', Number(value));
}

module.exports =  function listenVerifiedOrder() {
	const listener = new ContractListener(
	contracts["router"],
	"OrderVerified",
	storeVerifiedOrder
	);
	listener.start();
}