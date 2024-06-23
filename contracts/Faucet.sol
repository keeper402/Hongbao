// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// ERC20代币的水龙头合约
contract Faucet {
    using SafeERC20 for IERC20;

    uint256 public amountAllowed = 10000; // 每次领 10000单位代币
    address public tokenContract;   // token合约地址
    // 间隔时间
    uint256 public constant intervals = 120 minutes;
    // 记录申请的地址
    mapping(address => bool) public isRequested;
    mapping(address => uint256) public requestTime;

    // SendToken事件
    event SendToken(address indexed Receiver, uint256 indexed Amount);

    // 部署时设定ERC20代币合约
    constructor(address _tokenContract) {
        tokenContract = _tokenContract; // set token contract
    }

    // 用户领取代币函数
    function requestTokens() external {
        // 先检查上一次申请是否在两小时内
        if (
            isRequested[msg.sender] &&
            block.timestamp - requestTime[msg.sender] > intervals
        ) {
            isRequested[msg.sender] = false;
            requestTime[msg.sender] = 0;
        }
        require(
            !isRequested[msg.sender],
            "you have requested in last two hours"
        );
        IERC20 token = IERC20(tokenContract); // 创建IERC20合约对象
        require(token.balanceOf(address(this)) >= amountAllowed, "Faucet Empty!"); // 水龙头空了

        token.safeTransfer(msg.sender, amountAllowed); // 发送token

        isRequested[msg.sender] = true;
        requestTime[msg.sender] = block.timestamp;

        emit SendToken(msg.sender, amountAllowed); // 释放SendToken事件
    }
}