require("@nomicfoundation/hardhat-toolbox");
// require("dotenv").config()
require("@chainlink/env-enc").config(); 
require("./tasks")
require("hardhat-deploy")
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy-ethers");

const PRIVATE_KEY =process.env.PRIVATE_KEY
const PRIVATE_KEY2 =process.env.PRIVATE_KEY2
const ETHERSCAN_API_KEY=process.env.ETHERSCAN_API_KEY

const QUICKNODE_SEPOLIA_URL=process.env.QUICKNODE_SEPOLIA_URL
const SEPOLIA_URL =process.env.SEPOLIA_URL //infura


/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork:"hardhat",
  mocha:{
    timeout:300000
  },
  networks:{
    sepolia:{
        url: SEPOLIA_URL,
        accounts: [PRIVATE_KEY,PRIVATE_KEY2],
        chainId:11155111
    }
  },
  etherscan:{
    apiKey: ETHERSCAN_API_KEY
  },

  namedAccounts:{
    firstAccount:{
        default:0
    },
    secondAccount:{
        default:1
    }
  },
  gasReporter:{
    enabled:true
  }
}