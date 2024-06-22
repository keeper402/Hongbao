const {ethers} = require("hardhat");

async function main() {

    const provider = ethers.provider;
    const [deployer] = await ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", await provider.getBalance(deployer.address));

    const Groth16Verifier = await ethers.getContractFactory("Groth16Verifier");
    const verifier = await Groth16Verifier.deploy();
    const Hongbao = await ethers.getContractFactory("Hongbao");
    const verifierAddress = await verifier.getAddress();
    const hongbao = await Hongbao.deploy(verifierAddress);

    console.log("verifier address:", verifierAddress);
    console.log("hongbao address:",await hongbao.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });