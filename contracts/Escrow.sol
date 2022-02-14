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

    function receiveDeposit(address from) external payable {
        Deposit memory existingDeposit = depositorsToCollectorsMap[from][msg.sender];
        require(existingDeposit.amount > 0, "No deposit found");
        depositorsToCollectorsMap[from][msg.sender].amount = 0;
        bool sent = payable(msg.sender).send(existingDeposit.amount);
        require(sent, "Failed to send deposit amount");
    }

    function depositorsToCollectors(address depositor, address collector) public view returns (Deposit memory) {
        return depositorsToCollectorsMap[depositor][collector];
    }

    function withdrawDeposit(address to) external payable {
        Deposit memory existingDeposit = depositorsToCollectorsMap[msg.sender][to];
        require(existingDeposit.amount > 0, "No deposit found");
        require(block.timestamp >= existingDeposit.lockEnd, "Wait for lock end");
        depositorsToCollectorsMap[msg.sender][to].amount = 0;
        bool sent = payable(msg.sender).send(existingDeposit.amount);
        require(sent, "Failed to withdraw deposit amount");
    }
}
