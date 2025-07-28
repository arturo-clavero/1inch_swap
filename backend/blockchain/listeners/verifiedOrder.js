const Redis = require('ioredis');
const redis = new Redis();

//create listener for contract Event
const abi = require('../abi/VerifyOrder.json');
const ContractListener = require('./ContractListener');
const rpcWs = process.env.RPC_WS;
const contractAddress = process.env.VERIFY_ORDER_CONTRACT_ADDRESS;
const eventName = 'TestEvent'; 

function storeVerifiedOrder(sender, value) {
  console.log(`Received event from ${sender}, value: ${value.toString()}`);
  redis.lpush('orders', Number(value));
}

module.exports =  function listenVerifiedOrder() {
	const listener = new ContractListener(
	  rpcWs,
	  contractAddress,
	  abi,
	  eventName,
	  storeVerifiedOrder
	);
	listener.start();
}