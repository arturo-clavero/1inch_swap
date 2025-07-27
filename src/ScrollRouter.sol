// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

//deployed on ethereum!
contract ScrollRouter {
	error invalidOrder();
	event BridgeStarted(uint256 indexed orderId);
	event routeFinished(uint256 indexed orderId);


	function routeStart(uint256 amount, uint256 orderId) external {
		if (!verifyOrder())
			revert invalidOrder();
		swap("SCR", "USDC", amount);
		bridge();
		emit BridgeStarted(orderId);
	}

	function routeFinish(uint256 amount, uint256 orderId) external {
		swap("USDC", "SCR", amount);
		emit routeFinished(orderId);
	}
	
	function swap(string memory from, string memory to, uint256 amount) private {
		//TODO
		//use Uniswap, SushiSwap, or a Scroll-specific DEX
	}
	function bridge() private {
		//TODO
		//use scroll bridge (scroll to ethereum)
	}

	function verifyOrder() private pure returns (bool){
		//TODO
		return true;
	}
}

