const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { keccak256, toUtf8Bytes } = require("ethers");

module.exports = buildModule("HongbaoModule", (m) => {
    const keccak = keccak256(toUtf8Bytes("hello"));
    const res = m.contract("Hongbao", [keccak], {
        value: 0n,
    });

    return { res };
});