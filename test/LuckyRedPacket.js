// tests/luckyRedPacket.test.js
const {expect} = require("chai");
const {ethers} = require("hardhat");
const {groth16} = require("snarkjs");


describe("Hongbao", function () {

    it("Should create and claim a hongbao", async function () {
        const provider = ethers.provider;
        const [creator, user1, user2,
            user3, user4, user5] = await ethers.getSigners();
        const Hongbao = await ethers.getContractFactory("Hongbao");
        const hongbao = await Hongbao.deploy();
        const rawKey = "test";
        const number = 5;
        const keccakKey = ethers.keccak256(ethers.toUtf8Bytes(rawKey));
        let {proof, outHash} = await prove(0, keccakKey);

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
        const createEventFilter = hongbao.filters.RedPacketCreated(null, null);
        const createEvents = await hongbao.queryFilter(createEventFilter);
        const creatEventArgs = createEvents[0].args;
        console.log("creatEventArgs ", creatEventArgs)

        //再次创建测试
        // await luckyRedPacket.connect(user1).createRedPacket(keyHash, hashedPackets, { value: totalAmount });


        // 领取红包 测试！！！
        const accountBN = ethers.getBigInt(user1.address);
        const secretBN = outHash - accountBN;
        let {proof1, outHash1} = await prove(accountBN, secretBN);
        const claimTx = await hongbao.connect(user1).claimHongbao(outHash, proofn);
        // 等待交易确认
        await claimTx.wait();


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
            const secretN = passcode - accountBN;
            const accountN = ethers.getBigInt(users[i - 1].address);
            let {proofn, outHashn} = await prove(accountN, secretN);
            await hongbao.connect(users[i - 1]).claimHongbao(outHashn, proofn);
        }

        // 获取事件日志
        const claimEventFilter = hongbao.filters.RedPacketClaimed(null, null);
        const claimEvents = await hongbao.queryFilter(claimEventFilter);
        for (let i = 0; i < number; i++) {
            const claimEventArgs = claimEvents[i].args;
            console.log("claimEventArgs ", i, claimEventArgs)
        }

        console.log("remaining amount ", await hongbao.getRemainingAmount(keyHash));
        // 检查领取后的状态

        // //再次创建测试
        // await hongbao.connect(user1).createRedPacket(keyHash, hashedPackets, {value: totalAmount});
        // console.log("remaining amount ", await hongbao.getRemainingAmount(keyHash));
    });


});


async function prove(addrBigNumber, secretBugNumber) {
    const { proof, outHash } = await groth16.fullProve(
        {
            addr: addrBigNumber.toString(),
            secret: secretBugNumber.toString(),
        },
        "./frontend/hongbao-blockchain/circuits/passhash.wasm",
        "./frontend/hongbao-blockchain/circuits/passhash_0001.zkey",
    );
    return { proof, outHash };
}