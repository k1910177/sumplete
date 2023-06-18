import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "hardhat-circom";
import "hardhat-deploy";
import type { HardhatUserConfig } from "hardhat/config";
import { accounts, rpcUrl, verifyApiKey } from "./utils/network";

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.6.11",
      },
      {
        version: "0.8.9",
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: Number(process.env.OPTIMIZER_RUNS || 200),
      },
    },
  },
  circom: {
    inputBasePath: "./circuits",
    outputBasePath: "./circuits/out",
    ptau: "powersOfTau28_hez_final_15.ptau",
    circuits: [
      {
        name: "sumplete",
        input: "sumplete.input.json",
        protocol: "groth16",
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
      accounts: accounts(),
    },
    localhost: {
      chainId: 31337,
      accounts: accounts(),
      url: rpcUrl("localhost"),
    },
    sepolia: {
      accounts: accounts(),
      url: rpcUrl("sepolia"),
      verify: verifyApiKey("etherscan"),
    },
  },
  typechain: {
    outDir: "types",
    target: "ethers-v5",
  },
};

export default config;
