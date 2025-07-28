const { WebSocketProvider, Contract } = require('ethers');

class ContractListener {
  constructor(
	rpcWs, 
	contractAddress,
	abi, 
	eventName, 
	eventHandler,
) {
    this.provider = new WebSocketProvider(rpcWs);
    this.contract = new Contract(contractAddress, abi, this.provider);
    this.eventName = eventName;
    this.eventHandler = eventHandler;
  }

  start() {
    this.contract.on(this.eventName, (...args) => {
      this.eventHandler(...args);
    });
    console.log(`Listening for event "${this.eventName}"`);
  }

  stop() {
    this.contract.removeAllListeners(this.eventName);
    console.log(`Stopped listening for event "${this.eventName}"`);
  }
}

module.exports = ContractListener;
