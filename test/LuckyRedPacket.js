// tests/luckyRedPacket.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LuckyRedPacket", function () {
    it("Should create and claim a red packet", async function () {
        const provider = ethers.provider;
        const [creator, user1, user2,
            user3, user4, user5] = await ethers.getSigners();
        const LuckyRedPacket = await ethers.getContractFactory("LuckyRedPacket");
        const luckyRedPacket = await LuckyRedPacket.deploy();

        const rawKey = "test";
        const number = 5;
        const keyHash = ethers.keccak256(ethers.toUtf8Bytes(rawKey));
        // 创建红包
        const hashedPackets = [];
        const hashedOnceKeys = [];
        for (let i = 1; i <= number; i++) {
            const hash = ethers.keccak256(ethers.toUtf8Bytes(rawKey + i));
            const hash2 = ethers.keccak256(hash);
            hashedOnceKeys.push(hash);
            hashedPackets.push(hash2);
        }

        // 获取用户1和用户2的初始余额
        const initialBalanceCreator = await provider.getBalance(creator.address);
        const initialBalanceUser1 = await provider.getBalance(user1.address);

        //创建测试！！
        const totalAmount = ethers.parseEther("1");
        const createTx = await luckyRedPacket.connect(creator).createRedPacket(keyHash, hashedPackets, { value: totalAmount });
        console.log("remaining amount ", await luckyRedPacket.getRemainingAmount(keyHash));
        // 等待交易确认
        await createTx.wait();
        // 获取事件日志
        const createEventFilter = luckyRedPacket.filters.RedPacketCreated(null, null);
        const createEvents = await luckyRedPacket.queryFilter(createEventFilter);
        const creatEventArgs = createEvents[0].args;
        console.log("creatEventArgs ", creatEventArgs)

        //再次创建测试
        // await luckyRedPacket.connect(user1).createRedPacket(keyHash, hashedPackets, { value: totalAmount });




        // 领取红包 测试！！！
        const hashedKey = hashedOnceKeys[0];
        const claimTx = await luckyRedPacket.connect(user1).claimRedPacket(keyHash, hashedKey);
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
            const hashedKey = hashedOnceKeys[i - 1];
            await luckyRedPacket.connect(users[i - 1]).claimRedPacket(keyHash, hashedKey);
        }

        // 获取事件日志
        const claimEventFilter = luckyRedPacket.filters.RedPacketClaimed(null, null);
        const claimEvents = await luckyRedPacket.queryFilter(claimEventFilter);
        for (let i = 0; i < number; i++) {
            const claimEventArgs = claimEvents[i].args;
            console.log("claimEventArgs ", i, claimEventArgs)
        }

        console.log("remaining amount ", await luckyRedPacket.getRemainingAmount(keyHash));
        // 检查领取后的状态
        const cnt = await luckyRedPacket.getCurrentCnt(keyHash);

        //再次创建测试
        await luckyRedPacket.connect(user1).createRedPacket(keyHash, hashedPackets, { value: totalAmount });
        console.log("remaining amount ", await luckyRedPacket.getRemainingAmount(keyHash));
        console.log("remaining cnt ", await luckyRedPacket.getCurrentCnt(keyHash));
        expect(cnt).to.equal(5);
    });
});
