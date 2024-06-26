// tests/Faucet.test.js
const {expect, assert} = require("chai");
const {ethers} = require("hardhat");
const {groth16} = require("snarkjs");


describe("Faucet", function () {
    this.timeout(5000);
    //mantle-test verifier address : 0xd80c02cDd2826747D2Cf69938C3D5Eea7eECc796

    it("claimFaucet", async function () {
        //部署合约/准备用户
        const provider = ethers.provider;
        const [user] = await ethers.getSigners();
        // deploy token
        const HongbaoCoin = await ethers.getContractFactory("TetherToken");
        const hongbaoCoin = await HongbaoCoin.deploy(1000000 * 1000000000000000000 , 'Hongbao Coin', 'Hong', 6);
        const HongbaoCoinAddress = await hongbaoCoin.getAddress();
        // deploy faucet
        const Faucet = await ethers.getContractFactory("Faucet");
        const faucet = await Faucet.deploy(await hongbaoCoin.getAddress());
        const faucetAddress = await faucet.getAddress();



        //转帐给水龙头
        await hongbaoCoin.transfer(faucetAddress, 100000000000000);
        //记录开始余额
        const initialBalance = await provider.getBalance(user.address);
        const initialBalanceToken = await hongbaoCoin.balanceOf(faucetAddress);
        const initialBalanceUser = await hongbaoCoin.balanceOf(user.address);
        //前端只需要调用这个接口，其他不用管
        const createTx = await faucet.connect(user).requestTokens();
        const afterTxBalance = await provider.getBalance(user.address);
        const afterTxBalanceToken = await hongbaoCoin.balanceOf(faucetAddress);
        const afterTxBalanceUser = await hongbaoCoin.balanceOf(user.address);

        console.log("initialBalance amount ", initialBalance);
        console.log("afterTxBalance amount ", afterTxBalance);
        console.log("initialBalanceToken amount ", initialBalanceToken);
        console.log("afterTxBalanceToken amount ", afterTxBalanceToken);
        console.log("initialBalanceUser amount ", initialBalanceUser);
        console.log("afterTxBalanceUser amount ", afterTxBalanceUser);
    });

});