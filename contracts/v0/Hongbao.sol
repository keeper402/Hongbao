// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Hongbao {
    address public owner;
    uint256 public totalAmount;
    uint256 public numOfEnvelopes;
    uint256 public remainingAmount;
    uint256 public remainingEnvelopes;
    bytes32 private secretHash;

    mapping(address => bool) public hasClaimed;

    constructor(bytes32 _secretHash) payable {
        owner = msg.sender;
        secretHash = _secretHash;
    }

    function deposit(uint256 _numOfEnvelopes) external payable {
        require(msg.sender == owner, "Only the owner can deposit.");
        require(remainingEnvelopes == 0, "Only one Hongbao can be sent at the same time.");
        require(msg.value > 0, "Deposit amount must be greater than zero.");
        require(_numOfEnvelopes > 0, "Number of envelopes must be greater than zero.");

        totalAmount = msg.value;
        numOfEnvelopes = _numOfEnvelopes;
        remainingAmount = msg.value;
        remainingEnvelopes = _numOfEnvelopes;
    }

    function claim(string memory _password) external {
        require(remainingEnvelopes > 0, "No more envelopes left.");
        require(!hasClaimed[msg.sender], "You have already claimed an envelope.");
        require(keccak256(abi.encodePacked(_password)) == secretHash, "Incorrect password.");

        uint256 amount = getRandomAmount();
        remainingAmount -= amount;
        remainingEnvelopes--;
        hasClaimed[msg.sender] = true;

        payable(msg.sender).transfer(amount);
    }

    function getRandomAmount() private view returns (uint256) {
        if (remainingEnvelopes == 1) {
            return remainingAmount;
        }

        uint256 maxAmount = remainingAmount / remainingEnvelopes * 2;
        return uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, remainingEnvelopes))) % maxAmount + 1;
    }

    function getKeccak256(string memory str) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(str));
    }

    function getRemainingAmount() external view returns (uint256) {
        return remainingAmount;
    }

    function getRemainingEnvelopes() external view returns (uint256) {
        return remainingEnvelopes;
    }
}
