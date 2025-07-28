// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FakeEventEmitter {
    event TestEvent(address indexed sender, string message, uint256 value);

    function triggerTestEvent(string memory message, uint256 value) public {
        emit TestEvent(msg.sender, message, value);
    }
}
