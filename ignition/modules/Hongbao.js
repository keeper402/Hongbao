const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { keccak256, toUtf8Bytes } = require("ethers");

module.exports = buildModule("HongbaoModule", (m) => {
    // const keccak = keccak256(toUtf8Bytes("hello"));
    // deploy Groth16Verifier.js first, then change this groth16VerifierAddress value
    const groth16VerifierAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const res = m.contract("Hongbao", [groth16VerifierAddress], {
        value: 0n,
    });

    return { res };
});