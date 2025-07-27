// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IL1GatewayRouter.sol";

//deployed on ethereum!
contract EthereumRouter {
	error tokenNotMapped();
	event BridgeStarted(uint256 indexed orderId);
	event BridgeFinished(uint256 indexed orderId);

	function verifyOrder() private pure returns (bool){
		//TODO
		return true;
	}

		//dst token address the address recipient ? To revise
	function bridgeStart(uint256 amount, address srcTokenAddress, uint256 orderId) external payable{
		address l1GatewayRouterAddress = 0xF8B1378579659D8F7EE5f3C929c2f3E332E41Fd6;
		
		//receive tokens
		IERC20(srcTokenAddress).transferFrom(msg.sender, address(this), amount);

		//approve token transfer 
		IERC20(srcTokenAddress).approve(l1GatewayRouterAddress, amount);
		
		//get L2 token address
		address dstTokenAddress = IL1GatewayRouter(l1GatewayRouterAddress).getL2ERC20Address(srcTokenAddress);
    	if (dstTokenAddress == address(0))
			revert tokenNotMapped();

		//send ERC20
		IL1GatewayRouter(l1GatewayRouterAddress).depositERC20 {value: msg.value } (
			srcTokenAddress,
			dstTokenAddress,
			amount,
			200_000,            
			"0x"// Optional calldata
		);

		//send event notfication
		emit BridgeStarted(orderId);
	}

}

