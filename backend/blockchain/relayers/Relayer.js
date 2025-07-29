const Redis = require('ioredis');

//import actions
const { assignOrder } = require('./actions/assignOrder');
const { lock } = require('./actions/lock');
const { swap } = require('./actions/swap');
const { startBridge } = require('./actions/startBridge');
const { unlock } = require('./actions/unlock');

const ContractListener = require('../contracts/ContractListener');

class Relayer {
	constructor(id) {
		this.id = id;
		this.redis = new Redis();
		this.relayerActions = [
			assignOrder,
			lock,
			swap,
			startBridge,
			swap,
			unlock,
		];
		this.waitForOrders();

	}
	waitForOrders(){
		this.relayerStep = -1;
		this.order = null;
	}

	async simulateAsyncWork() { //for testing
		return new Promise((resolve) => setTimeout(resolve, 500));
	}

	async nextAction() {
		this.relayerStep++;
		console.log(`[Relayer ${this.id}] next action`, this.relayerStep);
		if (this.relayerStep >= this.relayerActions.length) {
		console.log(`[Relayer ${this.id}] order`, this.order, 'finalized\n\n');
		this.waitForOrders();
		await this.nextAction();
		return;
		}
		await this.relayerActions[this.relayerStep](this);
	}

	async waitForEvent(
		contract, 
		eventName, 
		launchEventAction = ()=>{}, 
		eventConditions = (args)=>{
			if (Number(args[2]) == this.order) return true;
			return false;
		},
	) 
	{
		const ContractListener = require('../contracts/ContractListener');
		const listener = new ContractListener(
			contract,
			eventName,
		);
		await listener.wait(
			launchEventAction,
			eventConditions
		);
	}
	
}

module.exports = Relayer;

/*
	//NOTES:
	//here are some example actions, 
	//please write them in separate file in './actions' export as modules and import here

	
	//Example action 1:

		async function action(self){
			
			//your logic...
			
			await self.nextAction();
		}


	//Example action 2:
	
		async function actionListener(self){
			//create contract listener
			const abi = require('../abi/your-contract.json');
			const ContractListener = require('../listener/ContractListener');
			const rpcWs = process.env.RPC_WS;
			const contractAddress = process.env.YOUR_CONTRACT_ADDRESS;
			const eventName = 'your-event-name'; 

			const contract = new ContractListener(
				rpcWs,
				contractAddress,
				abi,
				eventName
			);
			
			//call wait for event
			await self.waitForEvent(contract);
			
			//your logic ...

			await self.nextAction();
		}
*/