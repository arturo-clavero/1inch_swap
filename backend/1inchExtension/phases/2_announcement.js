

const ContractListener = require('../contracts/ContractListener');
const contracts = require('../contracts/contractData');
const {storeVerifiedOrder} = require('../order');

function announcement(sender, msg, value){
	console.log("event emited: ", msg);
	const id = Number(value);
	storeVerifiedOrder(id);
}

module.exports =  function listenVerifiedOrder() {
	const listener = new ContractListener(
		contracts["router"],
		"OrderVerified",
		announcement
	);
	listener.start();
}