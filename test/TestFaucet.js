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
        const hongbaoCoin = await HongbaoCoin.deploy(ethers.parseEther("1000") , 'Hongbao Coin', 'Hong', 6);
        const HongbaoCoinAddress = await hongbaoCoin.getAddress();
        // deploy faucet
        const Faucet = await ethers.getContractFactory("Faucet");
        const faucet = await Faucet.deploy(await hongbaoCoin.getAddress());
        const faucetAddress = await faucet.getAddress();

        const [creator, user1, user2,
            user3, user4, user5] = await ethers.getSigners();


        //转帐给水龙头
        await hongbaoCoin.connect(creator).approve(faucetAddress, ethers.parseEther("1000"));
        await hongbaoCoin.transfer(faucetAddress, ethers.parseEther("100"));
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

        //
        // const Groth16Verifier = await ethers.getContractFactory("Groth16Verifier");
        // const verifier = await Groth16Verifier.deploy();
        // const Hongbao = await ethers.getContractFactory("HongbaoDev");
        // const address = await verifier.getAddress();
        // const hongbao = await Hongbao.deploy(address);
        // //准备密码相关内容
        // const rawKey = "test";
        // const number = 5;
        // const keccakKey = ethers.keccak256(ethers.toUtf8Bytes(rawKey));
        // const keccakKeyBigInt = ethers.getBigInt(keccakKey);
        // const [proof, outHash] = await prove('0', keccakKeyBigInt);
        // //记录开始余额
        // const initialBalanceCreator = await provider.getBalance(creator.address);
        // const initialBalanceUser1 = await provider.getBalance(user1.address);
        //
        // //创建测试！！
        // const totalAmount = ethers.parseEther("0.01");
        // await hongbao.connect(creator).createHongbaoWithToken(outHash, number, totalAmount, 0, HongbaoCoinAddress, {value: totalAmount});
        // console.log("remaining amount ", await hongbao.getRemainingAmount(outHash));
        //
        // //
        // // // 领取红包 测试！！！
        // const accountB1 = ethers.getBigInt(user1.address);
        // const secretB1 = keccakKeyBigInt - accountB1;
        // const [prooF1, outHash1] = await prove(accountB1, secretB1);
        // const proofs1 = [prooF1.pi_a[0], prooF1.pi_a[1], prooF1.pi_b[0][1], prooF1.pi_b[0][0], prooF1.pi_b[1][1], prooF1.pi_b[1][0], prooF1.pi_c[0], prooF1.pi_c[1]];
        // console.log("claimtx, keccak(pass): %s, address: %s, secret: %s", keccakKeyBigInt, accountB1, secretB1)
        // try {
        //     const claimTx = await hongbao.connect(user1).claimHongbao(outHash1, proofs1);
        //     // 等待交易确认
        //     await claimTx.wait();
        //     console.log('Result:', claimTx);
        // } catch (error) {
        //     console.error('Error:', error);
        // }
        // console.log("claimfin")
        //



    });

});


async function prove(addrBigNumber, secretBugNumber) {
    const {proof, publicSignals} = await groth16.fullProve(
        {
            addr: addrBigNumber.toString(),
            secret: secretBugNumber.toString(),
        },
        "public/circuits/passhash.wasm",
        "public/circuits/passhash_0001.zkey",
    );
    const outHash = ethers.getBigInt(publicSignals[0]);
    return [proof, outHash];
}