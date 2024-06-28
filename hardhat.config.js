require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({path: '/developer/node/.env'})

const MANTLE_TESTNET_URL = process.env.MANTLE_TESTNET_URL;
const SEPOLIA_TESTNET_URL = process.env.SEPOLIA_TESTNET_URL;
const LINEA_SEPOLIA_TESTNET_URL = process.env.LINEA_SEPOLIA_TESTNET_URL;
const PRIVATE_KEY = `0x${process.env.PRIVATE_KEY}`;

console.log("MANTLE_TESTNET_URL: %s", MANTLE_TESTNET_URL);

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        compilers: [    //可指定多个sol版本
            {version: '0.4.26'},
            {version: '0.8.17'}
        ]
    },
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
            url: SEPOLIA_TESTNET_URL,
            accounts: [PRIVATE_KEY]
        },
        linea_sepolia: {
            url: LINEA_SEPOLIA_TESTNET_URL,
            accounts: [PRIVATE_KEY]
        }
    }
};
