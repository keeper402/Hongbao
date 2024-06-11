// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract LuckyRedPacket {
    // 红包结构体
    struct RedPacket {
        bytes32[] hashedPackets; // 存储n个二次哈希过的值
        mapping(bytes32 => bool) claimed; // 记录已经领取的红包key
        uint cnt; // 当前领取的计数器
        uint256 totalAmount; // 红包总金额
        uint256 remainingAmount; // 剩余金额
    }

    // 存储所有红包
    mapping(bytes32 => RedPacket) public redPackets;

    // 创建红包事件
    event RedPacketCreated(bytes32 indexed keyHash, bytes32[] hashedPackets, address indexed creator, uint256 totalAmount);

    // 领取红包事件
    event RedPacketClaimed(bytes32 indexed keyHash, bytes32 doubleHashedKey, address indexed claimer, uint256 amount);

    // 创建红包
    function createRedPacket(bytes32 keyHash, bytes32[] memory hashedPackets) public payable {
        //允许已经领完的红包的关键词被使用
        require(redPackets[keyHash].remainingAmount == 0, "Red packet already exists");
        require(msg.value > 0, "Red packet amount must be greater than 0");
        //之前使用过的关键词，先把原纪录删了
        if (redPackets[keyHash].cnt > 0){
            delete redPackets[keyHash];
        }
        RedPacket storage packet = redPackets[keyHash];
        for (uint i = 0; i < hashedPackets.length; i++) {
            packet.hashedPackets.push(hashedPackets[i]);
        }

        packet.totalAmount = msg.value;
        packet.remainingAmount = msg.value;

        console.log("packet created, totalAmount %s, packet number %s", packet.totalAmount, packet.hashedPackets.length);

        emit RedPacketCreated(keyHash, hashedPackets, msg.sender, msg.value);
    }

    // 查询当前的 cnt 值
    function getCurrentCnt(bytes32 keyHash) public view returns (uint) {
        return redPackets[keyHash].cnt;
    }

    // 查询当前的剩余的值
    function getRemainingAmount(bytes32 keyHash) public view returns (uint) {
        return redPackets[keyHash].remainingAmount;
    }

    // 领取红包
    function claimRedPacket(bytes32 keyHash, bytes32 hashedKey) public {
        RedPacket storage packet = redPackets[keyHash];

        require(packet.hashedPackets.length > 0, "Red packet not found");

        // 防重入
        require(!packet.claimed[hashedKey], "Network busy or red packet already claimed");

        bytes32 doubleHashedKey = keccak256(abi.encodePacked(hashedKey));

        bool found = false;
        uint256 index = 0;

        for (uint i = 0; i < packet.hashedPackets.length; i++) {
            if (packet.hashedPackets[i] == doubleHashedKey) {
                found = true;
                index = i;
                break;
            }
        }

        require(found, "pass key invalid");
        // 防重入
        packet.claimed[hashedKey] = true;

        // 随机分配金额
//       暂时不用 // 最大不超过剩余的50%
//        uint256 maxAmount = packet.remainingAmount / 2;
        packet.cnt++;
        uint256 amount;
        console.log("remainingAmount %s and cnt %s", packet.remainingAmount, packet.cnt);
        if (packet.hashedPackets.length <= 1) {
            amount = packet.remainingAmount;
        } else {
            uint256 randomFactor = uint256(keccak256(abi.encodePacked(block.timestamp, packet.remainingAmount, msg.sender))) % packet.remainingAmount;
            amount = randomFactor + 1; // 确保金额不为0
        }
        packet.remainingAmount -= amount;

        // 转账
        payable(msg.sender).transfer(amount);

        // 移除已领取的红包哈希
        packet.hashedPackets[index] = packet.hashedPackets[packet.hashedPackets.length - 1];
        packet.hashedPackets.pop();

        emit RedPacketClaimed(keyHash, doubleHashedKey, msg.sender, amount);
    }
}
