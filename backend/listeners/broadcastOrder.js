const { WebSocketProvider, Contract, utils } = require("ethers");


let newVerifiedOrders = [];


//RELAYER
const waiting = -1;
let relayerStep = waiting;
let order;
const assignOrder = () => {
	order = newVerifiedOrders.shift();
	console.log('assigned order ', order);
	relayerNextAction();
}

const swap = () => {
	console.log("swap");
	relayerNextAction();
}

const bridge = () => {
	console.log("bridge");
	relayerNextAction();
}

const relayerActions = [
	assignOrder,
	swap,
	bridge,
	swap
]

function relayerNextAction(){
	relayerStep++;
	console.log("next action ", relayerStep);
	if (relayerStep >= relayerActions.length)
	{
		console.log("order ", order, "finalized");
		order = null;
		relayerStep = waiting;
		if (newVerifiedOrders.length > 0)
			relayerNextAction();
		return;
	}
	relayerActions[relayerStep]();
}



module.exports = function listenVerifiedOrders() {
	const provider = new WebSocketProvider(process.env.RPC_WS);
    const contractAddress = process.env.VERIFY_ORDER_CONTRACT_ADDRESS;
	const abi = require('../abi/VerifyOrder.json');
    const contract = new Contract(contractAddress, abi, provider);

    contract.on("TestEvent", (sender, value) => {
		console.log(`check: ${sender} → ${value}`);
        newVerifiedOrders.push(Number(value));
		if (relayerStep == waiting)
			relayerNextAction();
    });

    console.log("verified order contract listener started.");
};