const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { keccak256, toUtf8Bytes } = require("ethers");

module.exports = buildModule("HongbaoModule", (m) => {
    const res = m.contract("Groth16Verifier");
    return { res };
});