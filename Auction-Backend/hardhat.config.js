require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
};
// Import the required modules using require instead of import syntax
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Define the module.exports directly as a JavaScript object
module.exports = {
  solidity: {
    compilers: [
      { version: "0.8.20" },
      { version: "0.8.9", settings: { optimizer: { enabled: true, runs: 200 } } },
    ],
  },

  networks: {
    mumbai: {
      url: process.env.ALCHEMY_MUMBAI_API_KEY_URL,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY].filter(Boolean), // Filtering out any falsy values like undefined or empty strings
    }
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGONSCAN_API_KEY
    }
  }
};
