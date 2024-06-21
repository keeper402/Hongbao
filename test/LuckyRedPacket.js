// tests/luckyRedPacket.test.js
const {expect} = require("chai");
const {ethers} = require("hardhat");
const {groth16} = require("snarkjs");


describe("Hongbao", function () {
    this.timeout(5000);
    it("Should create and claim a hongbao", async function () {
        //部署合约/准备用户
        const provider = ethers.provider;
        const [creator, user1, user2,
            user3, user4, user5] = await ethers.getSigners();
        const Groth16Verifier = await ethers.getContractFactory("Groth16Verifier");
        const verifier = await Groth16Verifier.deploy();
        const Hongbao = await ethers.getContractFactory("Hongbao");
        const address = await verifier.getAddress();
        const hongbao = await Hongbao.deploy(address);
        //准备密码相关内容
        const rawKey = "test";
        const number = 5;
        const keccakKey = ethers.keccak256(ethers.toUtf8Bytes(rawKey));
        const keccakKeyBigInt = ethers.getBigInt(keccakKey);
        const [proof, outHash] = await prove('0', keccakKeyBigInt);
        //记录开始余额
        const initialBalanceCreator = await provider.getBalance(creator.address);
        const initialBalanceUser1 = await provider.getBalance(user1.address);
        const bonusType = 1; // random

        //创建测试！！
        const totalAmount = ethers.parseEther("1");
        const createTx = await hongbao.connect(creator).createHongbao(outHash, number, totalAmount, bonusType, {value: totalAmount});
        console.log("remaining amount ", await hongbao.getRemainingAmount(outHash));
        // 等待交易确认
        await createTx.wait();
        // 获取事件日志
        const createEventFilter = hongbao.filters.HongbaoCreated(null, null);
        const createEvents = await hongbao.queryFilter(createEventFilter);
        const creatEventArgs = createEvents[0].args;
        console.log("creatEventArgs ", creatEventArgs)



        // 领取红包 测试！！！
        const accountB1 = ethers.getBigInt(user1.address);
        const secretB1 = keccakKeyBigInt - accountB1;
        const [prooF1, outHash1] = await prove(accountB1, secretB1);
        const proofs1 = [prooF1.pi_a[0], prooF1.pi_a[1], prooF1.pi_b[0][1], prooF1.pi_b[0][0], prooF1.pi_b[1][1], prooF1.pi_b[1][0], prooF1.pi_c[0], prooF1.pi_c[1]];
        console.log("claimtx, keccak(pass): %s, address: %s, secret: %s", keccakKeyBigInt, accountB1, secretB1)
        // proof1=["0x13fdaae6a07d4f136b36ad5bfa94c0b96aa9edc8149b47ae0c3ff9448f25cfe5", "0x256ed295bf358749e29b0115195df97391b413fad84be9abd636cf9d196fd97e","0x2686f203c8ce6a557612500bfc397954af30e0b374e2c7c99c8affbc689ff6fd", "0x1df8e5baf564560917d0ce3a803a89ea28d5d4c5fbfdfedd4223117deae0f11c","0x14b0a6b2a76ec1b25266ce586672cdceddef9c0d13f96d89cc5a559cc9dd019c", "0x28d6206fdc1c9d732d6beebb43cb3537bef7f5f326ac418dadf352503fb2f1d9","0x239a6acf622f53341d426f3a7134d02bdc15209c0fac38c3c69d3effc1c39982", "0x2e0f9d274df95dda912108e83958b05e693932ef06d81adb23081988c64e3be6","0x12cbe1a7393f05747c03f72dc6ee02cfbd7d40b7cee30f71b6a81928cfc900de","0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8"];
        try {
            const claimTx = await hongbao.connect(user1).claimHongbao(outHash1, proofs1);
            // 等待交易确认
            await claimTx.wait();
            console.log('Result:', claimTx.getDe);
        } catch (error) {
            console.error('Error:', error);
        }
        console.log("claimfin")

        // //再次创建测试,这个 预期会报错
        // console.log("recreate test at mid of claiming! ");
        // await hongbao.connect(creator).createHongbao(outHash, number, totalAmount, bonusType, {value: totalAmount});

        // 获取用户1和用户2的余额变化
        const finalBalanceCreator = await provider.getBalance(creator.address);
        const finalBalanceUser1 = await provider.getBalance(user1.address);

        // 打印用户1和用户2的余额变化
        console.log("Creator initial balance:", initialBalanceCreator.toString());
        console.log("Creator final balance:", finalBalanceCreator.toString());
        console.log("User 2 initial balance:", initialBalanceUser1.toString());
        console.log("User 2 final balance:", finalBalanceUser1.toString());

        const users = [user1, user2, user3, user4, user5];
        for (let i = 2; i <= number; i++) {
            const accountN = ethers.getBigInt(users[i - 1].address);
            const secretN = keccakKeyBigInt - accountN;
            const [prooFn, outHashn] = await prove(accountN, secretN);
            const proofn = [prooFn.pi_a[0], prooFn.pi_a[1], prooFn.pi_b[0][1], prooFn.pi_b[0][0], prooFn.pi_b[1][1], prooFn.pi_b[1][0], prooFn.pi_c[0], prooFn.pi_c[1]];
            await hongbao.connect(users[i - 1]).claimHongbao(outHashn, proofn);
        }

        // 获取事件日志
        const claimEventFilter = hongbao.filters.HongbaoClaimed(null, null);
        const claimEvents = await hongbao.queryFilter(claimEventFilter);
        for (let i = 0; i < number; i++) {
            const claimEventArgs = claimEvents[i].args;
            console.log("claimEventArgs ", i, claimEventArgs)
        }

        let lastAmoutForThisHongbao = await hongbao.getRemainingAmount(outHash);
        console.log("remaining amount ", lastAmoutForThisHongbao);
        // 检查领取后的状态

        // //再次创建测试
        console.log("recreate test! ");
        await hongbao.connect(creator).createHongbao(outHash, number, totalAmount, bonusType, {value: totalAmount});
        console.log("remaining amount ", await hongbao.getRemainingAmount(outHash));
    });


});

class Proof {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
}

// async function prove(addrBigNumber, secretBugNumber) {
//     const { proof, publicSignals  } = await groth16.fullProve(
//         {
//             addr: addrBigNumber.toString(),
//             secret: secretBugNumber.toString(),
//         },
//         "./frontend/hongbao-blockchain/circuits/passhash.wasm",
//         "./frontend/hongbao-blockchain/circuits/passhash_0001.zkey",
//     );
//     const outHash = ethers.getBigInt(publicSignals[0]);
//     return [proof,  outHash];
// }

async function prove(addrBigNumber, secretBugNumber) {
    const {proof, publicSignals} = await groth16.fullProve(
        {
            addr: addrBigNumber.toString(),
            secret: secretBugNumber.toString(),
        },
        "frontend/hongbao-blockchain/public/circuits/passhash.wasm",
        "frontend/hongbao-blockchain/public/circuits/passhash_0001.zkey",
    );
    const outHash = ethers.getBigInt(publicSignals[0]);
    return [proof, outHash];
}