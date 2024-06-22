require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({path: '/developer/node/.env'})

const MANTLE_TESTNET_URL = process.env.MANTLE_TESTNET_URL;
const PRIVATE_KEY = `0x${process.env.PRIVATE_KEY}`;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: '0.8.17',
    defaultNetwork: 'hardhat',
    networks: {
        mantle_test: {
            url: MANTLE_TESTNET_URL,
            accounts: [PRIVATE_KEY]
        },
        hardhat: {
            allowUnlimitedContractSize: true,
            chainId: 31337
        },
        sepolia: {
            url: 'https://sepolia.infura.io/v3/82e723fbdb254e2e9a4bfbadf7dc378f',
            accounts: [PRIVATE_KEY]
        }
    }
};
