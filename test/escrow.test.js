const {expect, assert} = require("chai");
const {ethers} = require("hardhat");
const {time} = require('@openzeppelin/test-helpers');

describe("Escrow", function () {
    it("Should deposit funds to escrow to address", async function () {
        const [owner, address1, address2] = await ethers.getSigners();
        const Escrow = await ethers.getContractFactory("Escrow");
        const lockTime = 100
        const escrow = await Escrow.deploy(lockTime).then(escrow => escrow.connect(address1));
        await escrow.deployed();
        const amount = ethers.utils.parseEther("1");
        const blockTime = await time.advanceBlock();

        const options = {value: amount};
        const depositTx = await escrow.deposit(address2.address, options);
        await depositTx.wait();

        const deposit = await escrow.depositorsToCollectors(address1.address, address2.address);
        expect(deposit.amount).to.equal(amount);
        const blockTimeInSeconds = Math.ceil(blockTime.id / 1000);
        const expectedLock = blockTimeInSeconds + lockTime;
        assert.isTrue(deposit.lockEnd.gte(expectedLock - 10));
        assert.isTrue(deposit.lockEnd.lte(expectedLock + 10));
    });

    it("Should deposit funds to escrow from two different addresses to address", async function () {
        const [owner, address1, address2, address3] = await ethers.getSigners();
        const Escrow = await ethers.getContractFactory("Escrow");
        const lockTime = 100;
        const escrow = await Escrow.deploy(lockTime).then(escrow => escrow.connect(address1));
        await escrow.deployed();
        const amount1 = ethers.utils.parseEther("1");
        const amount2 = ethers.utils.parseEther("2");
        const blockTime = await time.advanceBlock();

        const options1 = {value: amount1};
        const depositTx1 = await escrow.deposit(address2.address, options1);
        await depositTx1.wait();
        const options2 = {value: amount2};
        const depositTx2 = await escrow.connect(address3).deposit(address2.address, options2);
        await depositTx2.wait();

        const deposit1 = await escrow.depositorsToCollectors(address1.address, address2.address);
        expect(deposit1.amount).to.equal(amount1);
        const blockTimeInSeconds1 = Math.ceil(blockTime.id / 1000);
        const expectedLock1 = blockTimeInSeconds1 + lockTime;
        assert.isTrue(deposit1.lockEnd.gte(expectedLock1 - 10));
        assert.isTrue(deposit1.lockEnd.lte(expectedLock1 + 10));
        const deposit2 = await escrow.depositorsToCollectors(address3.address, address2.address);
        expect(deposit2.amount).to.equal(amount2);
        const blockTimeInSeconds2 = Math.ceil(blockTime.id / 1000);
        const expectedLock2 = blockTimeInSeconds2 + lockTime;
        assert.isTrue(deposit2.lockEnd.gte(expectedLock2 - 10));
        assert.isTrue(deposit2.lockEnd.lte(expectedLock2 + 10));
    });

    it("Should deposit funds to escrow from one address to two different addresses", async function () {
        const [owner, address1, address2, address3] = await ethers.getSigners();
        const Escrow = await ethers.getContractFactory("Escrow");
        const lockTime = 100;
        const escrow = await Escrow.deploy(lockTime).then(escrow => escrow.connect(address1));
        await escrow.deployed();
        const amount1 = ethers.utils.parseEther("1");
        const amount2 = ethers.utils.parseEther("2");
        const blockTime = await time.advanceBlock();

        const options1 = {value: amount1};
        const depositTx1 = await escrow.deposit(address2.address, options1);
        await depositTx1.wait();
        const options2 = {value: amount2};
        const depositTx2 = await escrow.deposit(address3.address, options2);
        await depositTx2.wait();

        const deposit1 = await escrow.depositorsToCollectors(address1.address, address2.address);
        expect(deposit1.amount).to.equal(amount1);
        const blockTimeInSeconds1 = Math.ceil(blockTime.id / 1000);
        const expectedLock1 = blockTimeInSeconds1 + lockTime;
        assert.isTrue(deposit1.lockEnd.gte(expectedLock1 - 10));
        assert.isTrue(deposit1.lockEnd.lte(expectedLock1 + 10));
        const deposit2 = await escrow.depositorsToCollectors(address1.address, address3.address);
        expect(deposit2.amount).to.equal(amount2);
        const blockTimeInSeconds2 = Math.ceil(blockTime.id / 1000);
        const expectedLock2 = blockTimeInSeconds2 + lockTime;
        assert.isTrue(deposit2.lockEnd.gte(expectedLock2 - 10));
        assert.isTrue(deposit2.lockEnd.lte(expectedLock2 + 10));
    });

    it("Should deposit funds to escrow from one address to one address to times", async function () {
        const [owner, address1, address2] = await ethers.getSigners();
        const Escrow = await ethers.getContractFactory("Escrow");
        const lockTime = 100;
        const escrow = await Escrow.deploy(lockTime).then(escrow => escrow.connect(address1));
        await escrow.deployed();
        const amount1 = ethers.utils.parseEther("1");
        const amount2 = ethers.utils.parseEther("2");
        const blockTime = await time.advanceBlock();

        const options1 = {value: amount1};
        const depositTx1 = await escrow.deposit(address2.address, options1);
        await depositTx1.wait();
        const options2 = {value: amount2};
        const depositTx2 = await escrow.deposit(address2.address, options2);
        await depositTx2.wait();

        const deposit1 = await escrow.depositorsToCollectors(address1.address, address2.address);
        expect(deposit1.amount).to.equal(amount1.add(amount2));
        const blockTimeInSeconds1 = Math.ceil(blockTime.id / 1000);
        const expectedLock1 = blockTimeInSeconds1 + lockTime;
        assert.isTrue(deposit1.lockEnd.gte(expectedLock1 - 10));
        assert.isTrue(deposit1.lockEnd.lte(expectedLock1 + 10));
    });

    it("Should deposit funds to escrow from one address to the same address", async function () {
        const [owner, address1] = await ethers.getSigners();
        const Escrow = await ethers.getContractFactory("Escrow");
        const lockTime = 100;
        const escrow = await Escrow.deploy(lockTime).then(escrow => escrow.connect(address1));
        await escrow.deployed();
        const amount = ethers.utils.parseEther("1");
        const blockTime = await time.advanceBlock();

        const options1 = {value: amount};
        const depositTx1 = await escrow.deposit(address1.address, options1);
        await depositTx1.wait();

        const deposit = await escrow.depositorsToCollectors(address1.address, address1.address);
        expect(deposit.amount).to.equal(amount);
        const blockTimeInSeconds = Math.ceil(blockTime.id / 1000);
        const expectedLock = blockTimeInSeconds + lockTime;
        assert.isTrue(deposit.lockEnd.gte(expectedLock - 10));
        assert.isTrue(deposit.lockEnd.lte(expectedLock + 10));
    });
});
