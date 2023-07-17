import { RPC_URL } from "@utils/constants";
import { ChainId, Network } from "@utils/types";
import { Address } from "viem";

// Astar Network Configuration
export const astar = {
  id: ChainId.ASTAR,
  name: "Astar",
  network: Network.ASTAR,
  nativeCurrency: {
    decimals: 18,
    name: "MOVR",
    symbol: "MOVR",
  },
  rpcUrls: {
    public: {
      http: [RPC_URL.astar],
      webSocket: ["wss://moonriver.public.blastapi.io"],
    },
    default: {
      http: [RPC_URL.astar],
      webSocket: ["wss://moonriver.public.blastapi.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Moonscan",
      url: "https://moonriver.moonscan.io",
    },
    etherscan: {
      name: "Moonscan",
      url: "https://moonriver.moonscan.io",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11" as Address,
      blockCreated: 1597904,
    },
  },
  testnet: false,
};

export const hardhat = {
  id: ChainId.HARDHAT,
  name: "Hardhat",
  network: Network.HARDHAT,
  nativeCurrency: {
    decimals: 18,
    name: "GLMR",
    symbol: "GLMR",
  },
  rpcUrls: {
    public: {
      http: [RPC_URL.hardhat],
      webSocket: ["wss://moonbeam.public.blastapi.io"],
    },
    default: {
      http: [RPC_URL.astar],
      webSocket: ["wss://moonbeam.public.blastapi.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Moonscan",
      url: "https://moonscan.io/",
    },
    etherscan: {
      name: "Moonscan",
      url: "https://moonscan.io/",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11" as Address,
      blockCreated: 1597904,
    },
  },
  testnet: false,
};
