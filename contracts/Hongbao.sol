// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./verifier.sol";

contract Hongbao is Groth16Verifier {

    enum ReceiveType {
        AVG,
        RAND
    }
//    // 证明结构体
//    struct Proof {
//        uint256[2] a;
//        uint256[2][2] b;
//        uint256[2] c;
//    }

    // 红包结构体
    struct HongbaoInfo {
        uint timestamp;
        address sender;// 发送人
        uint256 passwordHash; //snarkjs计算的hash
        uint total; // 总份数
        uint remaining; // 剩余份数
        uint256 totalAmount; // 红包总金额
        uint256 remainingAmount; // 剩余金额
        ReceiveType receiveType;//领取类型
    }

    mapping(bytes => bool) internal claimedMap; // 记录已经领取的红包的地址

    //口令 -> 红包
    mapping(uint256 => HongbaoInfo) internal hongbaoMap;

    //口令 -> 红包
    mapping(uint256 => HongbaoInfo[]) internal fullyClaimedHongbaoMap;

    // 创建红包事件
    event HongbaoCreated(uint256 indexed passwordHash, uint total, uint amount, address indexed creator, ReceiveType receiveType);

    // 领取红包事件
    event HongbaoClaimed(uint256 indexed passwordHash, address indexed claimer, uint256 claimAmount, uint remaining, uint256 remainingAmount);

    // 创建红包
    function createHongbao(uint256 passwordHash, uint total, uint amount, ReceiveType receiveType) public payable {
        //amount设计考虑未来引入其他链
        require(msg.value == amount, "Invalid value");
        require(msg.value > 0, "Red packet amount must be greater than 0");
        require(total > 0, "total must be greater than 0");
        HongbaoInfo storage h = hongbaoMap[passwordHash];
        require(h.remaining == 0, "Please use another password");
        //重复的时候，进行红包归档
        if (h.total > 0) {
            // old packet store
            HongbaoInfo memory temp = h;  // 保存要转移的结构体到临时变量
            delete hongbaoMap[passwordHash]; // 从原映射中删除元素并重置为默认值
            fullyClaimedHongbaoMap[passwordHash].push(temp);  // 将保存的结构体添加到另一个映射中
        }

        h.sender = msg.sender;
        h.passwordHash = passwordHash;
        h.total = total;
        h.remaining = total;
        h.totalAmount = msg.value;
        h.remainingAmount = msg.value;
        h.receiveType = receiveType;
        h.timestamp = block.timestamp;
        console.log("packet created, totalAmount %s, packet number %s", h.totalAmount, total);

        emit HongbaoCreated(passwordHash, total, amount, msg.sender, receiveType);
    }

    // 查询当前的剩余的值
    function getRemainingAmount(uint256 keyHash) public view returns (uint) {
        return hongbaoMap[keyHash].remainingAmount;
    }

    // 领取红包
    function claimHongbao(uint256 passwordHash, uint256[] memory proof) public {
        HongbaoInfo storage hongbao = hongbaoMap[passwordHash];
        require(hongbao.remaining > 0, "hongbao fully claimed");
        bytes memory claimKey = abi.encodePacked(passwordHash, hongbao.timestamp, msg.sender);
        require(!!claimedMap[claimKey], "you already claimed hongbao");

        //零知识证明 验证领取者知道口令
        uint256[2] memory a = [proof[0], proof[1]];
        uint256[2][2] memory b = [[proof[2], proof[3]], [proof[4], proof[5]]];
        uint256[2] memory c = [proof[6], proof[7]];
        uint256[2] memory input = [passwordHash, uint256(uint160(msg.sender))];
        bool verify = verifyProof(a, b, c, input);
        require(verify, "zero knowledge verify fail");

        uint256 claimAmount;
        if (hongbao.remaining <= 1) {
            claimAmount = hongbao.remainingAmount;
        } else {
            claimAmount = getClaimAmount(hongbao);
        }
        // 领取红包
        payable(msg.sender).transfer(claimAmount);
        hongbao.remaining--;
        hongbao.remainingAmount-= claimAmount;

        claimedMap[claimKey] = true;
        emit HongbaoClaimed(passwordHash, msg.sender, claimAmount, hongbao.remaining, hongbao.remainingAmount);

    }

    function getClaimAmount(HongbaoInfo memory hongbao) private returns (uint256){
        if (hongbao.receiveType == ReceiveType.AVG) {
            return hongbao.totalAmount / hongbao.total;
        }
        //取一个范围在 1~hongbao.remainingAmount（包含） 之间的随机数
        if (hongbao.receiveType == ReceiveType.RAND) {
            uint256 randomFactor = uint256(keccak256(abi.encodePacked(block.timestamp, hongbao.remainingAmount, msg.sender)))
                % hongbao.remainingAmount;
            return randomFactor + 1+0;
        }
        revert("invalid hongbao receiveType");
    }
}
