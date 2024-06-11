// tests/luckyRedPacket.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LuckyRedPacket", function () {
    it("Should create and claim a red packet", async function () {
        const provider = ethers.provider;
        const [owner, user1, user2] = await ethers.getSigners();
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
        const initialBalanceUser1 = await provider.getBalance(user1.address);
        const initialBalanceUser2 = await provider.getBalance(user2.address);

        //创建测试！！
        const totalAmount = ethers.parseEther("1");
        const createTx = await luckyRedPacket.connect(user1).createRedPacket(keyHash, hashedPackets, { value: totalAmount });
        // 等待交易确认
        await createTx.wait();
        // 获取事件日志
        const createEventFilter = luckyRedPacket.filters.RedPacketCreated(null, null);
        const createEvents = await luckyRedPacket.queryFilter(createEventFilter);
        const creatEventArgs = createEvents[0].args;
        console.log("creatEventArgs ", creatEventArgs)



        // 领取红包 测试！！！
        const hashedKey = hashedOnceKeys[0];
        const claimTx = await luckyRedPacket.connect(user2).claimRedPacket(keyHash, hashedKey);
        // 等待交易确认
        await claimTx.wait();
        // 获取事件日志
        const claimEventFilter = luckyRedPacket.filters.RedPacketClaimed(null, null);
        const claimEvents = await luckyRedPacket.queryFilter(claimEventFilter);
        // 检查事件日志
        expect(claimEvents.length).to.equal(1);
        const claimEventArgs = claimEvents[0].args;
        console.log("claimEventArgs ", claimEventArgs)


        // 获取用户1和用户2的余额变化
        const finalBalanceUser1 = await provider.getBalance(user1.address);
        const finalBalanceUser2 = await provider.getBalance(user2.address);

        // 打印用户1和用户2的余额变化
        console.log("User 1 initial balance:", initialBalanceUser1.toString());
        console.log("User 1 final balance:", finalBalanceUser1.toString());
        console.log("User 2 initial balance:", initialBalanceUser2.toString());
        console.log("User 2 final balance:", finalBalanceUser2.toString());

        // 检查领取后的状态
        const cnt = await luckyRedPacket.getCurrentCnt(keyHash);
        expect(cnt).to.equal(1);
    });
});
