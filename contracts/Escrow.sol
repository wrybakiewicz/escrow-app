// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Escrow {

    struct Deposit {
        uint amount;
        uint lockEnd;
    }

    mapping(address => mapping(address => Deposit)) private depositorsToCollectorsMap;
    uint public lockTime;

    constructor(uint _lockTime) {
        lockTime = _lockTime;
    }

    function deposit(address to) external payable {
        Deposit memory existingDeposit = depositorsToCollectorsMap[msg.sender][to];
        Deposit memory newDeposit = Deposit(existingDeposit.amount + msg.value, block.timestamp + lockTime);
        depositorsToCollectorsMap[msg.sender][to] = newDeposit;
    }

    function depositorsToCollectors(address depositor, address collector) public view returns (Deposit memory) {
        return depositorsToCollectorsMap[depositor][collector];
    }
    //TODO: user B can withdraw funds
    //TODO: after time lock funds can be claimed by user A
}
