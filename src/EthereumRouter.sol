// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

//deployed on ethereum!
contract EthereumRouter {
	error invalidOrder();
	event BridgeStarted(uint256 indexed orderId);
	event routeFinished(uint256 indexed orderId);


	function routeStart(uint256 amount, uint256 orderId) external {
		if (!verifyOrder())
			revert invalidOrder();
		swap("ETH", "USDC", amount);
		bridge();
		emit BridgeStarted(orderId);
	}

	function routeFinish(uint256 amount, uint256 orderId) external {
		swap("USDC", "ETH", amount);
		emit routeFinished(orderId);
	}
	
	function swap(string memory from, string memory to, uint256 amount) private {
		//TODO
		//use 1 inch
	}
	function bridge() private {
		//TODO
		//use scroll bridge (ethereum to scroll)
	}

	function verifyOrder() private pure returns (bool){
		//TODO
		return true;
	}
}

