// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Hongbao {

    enum ReceiveType {
        AVG,
        RAND
    }

    // 红包结构体
    struct HongbaoInfo {
        address sender;// 发送人
        uint256 passwordHash; //snarkjs计算的hash
        mapping(address => bool) openedAddr; // 记录已经领取的红包的地址
        uint total; // 总份数
        uint remaining; // 剩余份数
        uint256 totalAmount; // 红包总金额
        uint256 remainingAmount; // 剩余金额
    }

    //口令 -> 红包
    mapping(uint256 => HongbaoInfo) internal hongbaoMap;

    // 创建红包事件
    event HongbaoCreated(bytes32 indexed keyHash,  uint total, uint amount, ReceiveType receiveType, address indexed creator);

    // 领取红包事件
    event RedPacketClaimed(bytes32 indexed keyHash, bytes32 doubleHashedKey, address indexed claimer, uint256 amount);

    // 创建红包
    function createHongbao(uint256 passwordHash, uint total, uint amount, ReceiveType receiveType) public payable {
        //amount设计考虑未来引入其他链
        require(msg.value == amount, "Invalid value");
        require(msg.value > 0, "Red packet amount must be greater than 0");

        HongbaoInfo storage h = hongbaoMap[passwordHash];
        h.sender = msg.sender;
        h.passwordHash = passwordHash;
        h.total = total;
        h.remaining = total;
        h.totalAmount = msg.value;
        h.remainingAmount = msg.value;
        console.log("packet created, totalAmount %s, packet number %s", h.totalAmount, total);

        emit HongbaoCreated(passwordHash, total, amount, msg.sender, receiveType);
    }

    // 查询当前的剩余的值
    function getRemainingAmount(uint256 keyHash) public view returns (uint) {
        return hongbaoMap[keyHash].remainingAmount;
    }

    // 领取红包
    function claimHongbao(uint256 passwordHash, Proof proof) public {
        //todo 零知识证明 领取红包
    }
}
