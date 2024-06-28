const {ethers} = require("hardhat");

async function main() {

    const provider = ethers.provider;
    const [deployer] = await ethers.getSigners();

    console.log(
        "Deploying contracts with the account:",
        deployer.address
    );

    console.log("Account balance:", await provider.getBalance(deployer.address));

    const addr = '0x401863EfAe428ffdD683834726F63C04D0aa7921';
    if (addr == null) {
        console.error("addr invalid");
        return;
    }
    // deploy faucet
    const Faucet = await ethers.getContractFactory("Faucet");
    const faucet = await Faucet.deploy(addr);
    const faucetAddress = await faucet.getAddress();

    console.log("faucet address:",faucetAddress);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });