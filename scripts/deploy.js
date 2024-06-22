const {ethers} = require("hardhat");

async function main() {

    const provider = ethers.provider;
    const [deployer] = await ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", await provider.getBalance(deployer.address));

    // depoly verifier
    const Groth16Verifier = await ethers.getContractFactory("Groth16Verifier");
    const verifier = await Groth16Verifier.deploy();
    const verifierAddress = await verifier.getAddress();
    // deploy hongbao
    const Hongbao = await ethers.getContractFactory("Hongbao");
    const hongbao = await Hongbao.deploy(verifierAddress);
    const hongbaoAddress = await hongbao.getAddress();
    // deploy token
    const HongbaoCoin = await ethers.getContractFactory("TetherToken");
    const hongbaoCoin = await HongbaoCoin.deploy(10000000000, 'Hongbao Coin', 'Hong', 6);
    const HongbaoCoinAddress = await hongbaoCoin.getAddress();
    // deploy faucet
    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy(await hongbaoCoin.getAddress());
    const faucetAddress = await faucet.getAddress();


    console.log("verifier address:", verifierAddress);
    console.log("hongbao address:",hongbaoAddress);
    console.log("HongbaoCoin address:",HongbaoCoinAddress);
    console.log("faucet address:",faucetAddress);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });