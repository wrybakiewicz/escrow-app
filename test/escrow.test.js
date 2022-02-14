const {expect, assert} = require("chai");
const {ethers} = require("hardhat");
const {time} = require('@openzeppelin/test-helpers');

describe("Escrow", function () {
    it("Should deposit funds to escrow to address", async function () {
        const [owner, address1, address2] = await ethers.getSigners();
        const Escrow = await ethers.getContractFactory("Escrow");
        const lockTime = 1000
        const escrow = await Escrow.deploy(lockTime).then(escrow => escrow.connect(address1));
        await escrow.deployed();
        const amount = ethers.utils.parseEther("1");
        const blockTime = await time.advanceBlock();

        const options = {value: amount};
        await escrow.deposit(address2.address, options);

        const deposit = await escrow.depositorsToCollectors(address1.address, address2.address);
        expect(deposit.amount).to.equal(amount);
        const blockTimeInSeconds = Math.ceil(blockTime.id / 1000);
        const expectedLock = blockTimeInSeconds + lockTime;
        assert.isTrue(deposit.lockEnd.gte(expectedLock - 100));
        assert.isTrue(deposit.lockEnd.lte(expectedLock + 100));
    });

    it("Should deposit funds to escrow from two different addresses to address", async function () {
        const [owner, address1, address2, address3] = await ethers.getSigners();
        const Escrow = await ethers.getContractFactory("Escrow");
        const lockTime = 1000;
        const escrow = await Escrow.deploy(lockTime).then(escrow => escrow.connect(address1));
        await escrow.deployed();
        const amount1 = ethers.utils.parseEther("1");
        const amount2 = ethers.utils.parseEther("2");
        const blockTime = await time.advanceBlock();

        const options1 = {value: amount1};
        await escrow.deposit(address2.address, options1);
        const options2 = {value: amount2};
        await escrow.connect(address3).deposit(address2.address, options2);

        const deposit1 = await escrow.depositorsToCollectors(address1.address, address2.address);
        expect(deposit1.amount).to.equal(amount1);
        const blockTimeInSeconds1 = Math.ceil(blockTime.id / 1000);
        const expectedLock1 = blockTimeInSeconds1 + lockTime;
        assert.isTrue(deposit1.lockEnd.gte(expectedLock1 - 100));
        assert.isTrue(deposit1.lockEnd.lte(expectedLock1 + 100));
        const deposit2 = await escrow.depositorsToCollectors(address3.address, address2.address);
        expect(deposit2.amount).to.equal(amount2);
        const blockTimeInSeconds2 = Math.ceil(blockTime.id / 1000);
        const expectedLock2 = blockTimeInSeconds2 + lockTime;
        assert.isTrue(deposit2.lockEnd.gte(expectedLock2 - 100));
        assert.isTrue(deposit2.lockEnd.lte(expectedLock2 + 100));
    });

    it("Should deposit funds to escrow from one address to two different addresses", async function () {
        const [owner, address1, address2, address3] = await ethers.getSigners();
        const Escrow = await ethers.getContractFactory("Escrow");
        const lockTime = 1000;
        const escrow = await Escrow.deploy(lockTime).then(escrow => escrow.connect(address1));
        await escrow.deployed();
        const amount1 = ethers.utils.parseEther("1");
        const amount2 = ethers.utils.parseEther("2");
        const blockTime = await time.advanceBlock();

        const options1 = {value: amount1};
        await escrow.deposit(address2.address, options1);
        const options2 = {value: amount2};
        await escrow.deposit(address3.address, options2);

        const deposit1 = await escrow.depositorsToCollectors(address1.address, address2.address);
        expect(deposit1.amount).to.equal(amount1);
        const blockTimeInSeconds1 = Math.ceil(blockTime.id / 1000);
        const expectedLock1 = blockTimeInSeconds1 + lockTime;
        assert.isTrue(deposit1.lockEnd.gte(expectedLock1 - 100));
        assert.isTrue(deposit1.lockEnd.lte(expectedLock1 + 100));
        const deposit2 = await escrow.depositorsToCollectors(address1.address, address3.address);
        expect(deposit2.amount).to.equal(amount2);
        const blockTimeInSeconds2 = Math.ceil(blockTime.id / 1000);
        const expectedLock2 = blockTimeInSeconds2 + lockTime;
        assert.isTrue(deposit2.lockEnd.gte(expectedLock2 - 100));
        assert.isTrue(deposit2.lockEnd.lte(expectedLock2 + 100));
    });

    it("Should deposit funds to escrow from one address to one address to times", async function () {
        const [owner, address1, address2] = await ethers.getSigners();
        const Escrow = await ethers.getContractFactory("Escrow");
        const lockTime = 1000;
        const escrow = await Escrow.deploy(lockTime).then(escrow => escrow.connect(address1));
        await escrow.deployed();
        const amount1 = ethers.utils.parseEther("1");
        const amount2 = ethers.utils.parseEther("2");
        const blockTime = await time.advanceBlock();

        const options1 = {value: amount1};
        await escrow.deposit(address2.address, options1);
        const options2 = {value: amount2};
        await escrow.deposit(address2.address, options2);

        const deposit1 = await escrow.depositorsToCollectors(address1.address, address2.address);
        expect(deposit1.amount).to.equal(amount1.add(amount2));
        const blockTimeInSeconds1 = Math.ceil(blockTime.id / 1000);
        const expectedLock1 = blockTimeInSeconds1 + lockTime;
        assert.isTrue(deposit1.lockEnd.gte(expectedLock1 - 100));
        assert.isTrue(deposit1.lockEnd.lte(expectedLock1 + 100));
    });

    it("Should deposit funds to escrow from one address to the same address", async function () {
        const [owner, address1] = await ethers.getSigners();
        const Escrow = await ethers.getContractFactory("Escrow");
        const lockTime = 1000;
        const escrow = await Escrow.deploy(lockTime).then(escrow => escrow.connect(address1));
        await escrow.deployed();
        const amount = ethers.utils.parseEther("1");
        const blockTime = await time.advanceBlock();

        const options1 = {value: amount};
        const depositTx1 = await escrow.deposit(address1.address, options1);

        const deposit = await escrow.depositorsToCollectors(address1.address, address1.address);
        expect(deposit.amount).to.equal(amount);
        const blockTimeInSeconds = Math.ceil(blockTime.id / 1000);
        const expectedLock = blockTimeInSeconds + lockTime;
        assert.isTrue(deposit.lockEnd.gte(expectedLock - 100));
        assert.isTrue(deposit.lockEnd.lte(expectedLock + 100));
    });

    it("Should deposit funds to escrow and receive deposit from another address", async function () {
        const [owner, address1, address2] = await ethers.getSigners();
        const account1InitialBalance = await address1.getBalance();
        const account2InitialBalance = await address2.getBalance();
        const Escrow = await ethers.getContractFactory("Escrow");
        const lockTime = 100;
        const escrow = await Escrow.deploy(lockTime);
        await escrow.deployed();
        const amount = ethers.utils.parseEther("1");

        const options1 = {value: amount};
        const depositTx1 = await escrow.connect(address1).deposit(address2.address, options1);
        const depositTx1Result = await depositTx1.wait();
        const receiveDepositTx = await escrow.connect(address2).receiveDeposit(address1.address);
        const receiveDepositTxResult = await receiveDepositTx.wait();

        const deposit = await escrow.depositorsToCollectors(address1.address, address2.address);
        expect(deposit.amount).to.equal(0);
        const account1Balance = await address1.getBalance();
        const depositGasFee = depositTx1Result.effectiveGasPrice.mul(depositTx1Result.cumulativeGasUsed);
        expect(account1Balance).to.equal(account1InitialBalance.sub(amount).sub(depositGasFee));
        const account2Balance = await address2.getBalance();
        const receiveDepositGasFee = receiveDepositTxResult.effectiveGasPrice.mul(receiveDepositTxResult.cumulativeGasUsed);
        expect(account2Balance).to.equal(account2InitialBalance.add(amount).sub(receiveDepositGasFee));
    });

    it("Should fail to receive deposit from address that didn't do deposit", async function () {
        const [owner, address1, address2] = await ethers.getSigners();
        const Escrow = await ethers.getContractFactory("Escrow");
        const lockTime = 100;
        const escrow = await Escrow.deploy(lockTime);
        await escrow.deployed();

        await expect(escrow.connect(address2).receiveDeposit(address1.address)).to.be.revertedWith("No deposit found");
    });

    it("Should deposit funds to escrow and receive deposit from another address two times", async function () {
        const [owner, address1, address2] = await ethers.getSigners();
        const Escrow = await ethers.getContractFactory("Escrow");
        const lockTime = 100;
        const escrow = await Escrow.deploy(lockTime);
        await escrow.deployed();
        const amount = ethers.utils.parseEther("1");

        const options1 = {value: amount};
        await escrow.connect(address1).deposit(address2.address, options1);
        await escrow.connect(address2).receiveDeposit(address1.address);

        await expect(escrow.connect(address2).receiveDeposit(address1.address)).to.be.revertedWith("No deposit found");
    });
});
