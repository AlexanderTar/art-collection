import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

import dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./src",
  },
  networks: {
    hardhat: {},
    base: {
      url: process.env.BASE_MAINNET_RPC as string,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY as string],
    },
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY as string,
    },
  },
  ignition: {
    strategyConfig: {
      create2: {
        salt: "0xd7da8c60fb43deda6b808b1aa5f3b5154115f824dd45f66d92d7be7f927ca987",
      },
    },
  },
};

export default config;
