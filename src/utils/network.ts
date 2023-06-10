import { RPC_URL } from "./constants";
import { ChainId, Network } from "./types";

const moonbeamRpcUrl = RPC_URL.moonbeam;
const moonriverRpcUrl = RPC_URL.moonriver;
const astarRpcUrl = RPC_URL.astar;

export const getChainId = (network: string): ChainId | undefined => {
  const chains = getSupportedChains();
  const chainId = chains.find(
    (chain) => chain.name.toLowerCase() == network.toLowerCase()
  )?.id;
  return chainId;
};

export const getChainIdForNetwork = (network: Network): ChainId => {
  let chainId = ChainId.MOONBEAM;
  switch (network) {
    case "moonbeam":
      chainId = ChainId.MOONBEAM;
      break;
    case "moonriver":
      chainId = ChainId.MOONRIVER;
      break;
    case "astar":
      chainId = ChainId.ASTAR;
      break;
    default:
      break;
  }
  return chainId;
};

export const getRpcUrlForNetwork = (network: string) => {
  let rpcUrl = moonbeamRpcUrl;
  switch (network) {
    case "moonbeam":
      rpcUrl = moonbeamRpcUrl;
      break;
    case "moonriver":
      rpcUrl = moonriverRpcUrl;
      break;
    case "astar":
      rpcUrl = astarRpcUrl;
      break;
    default:
      break;
  }
  return rpcUrl;
};

export const astar = {
  id: ChainId.ASTAR,
  name: "Astar",
  network: "astar",
  nativeCurrency: {
    name: "Astar",
    symbol: "ASTR",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [
        "https://astar.public.blastapi.io",
        "https://astar.api.onfinality.io/public",
      ],
    },
    public: {
      http: [
        "https://astar.public.blastapi.io",
        "https://astar.api.onfinality.io/public",
      ],
    },
  },
  blockExplorers: {
    etherscan: {
      name: "Astarscan",
      url: "https://blockscout.com/astar",
    },
    default: {
      name: "Astarscan",
      url: "https://blockscout.com/astar",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 761794,
    },
  },
};

export const getSupportedChains = () => {
  return [
    {
      id: ChainId.MOONBEAM,
      name: "Moonbeam",
    },
    {
      id: ChainId.MOONRIVER,
      name: "Moonriver",
    },
    {
      id: ChainId.ASTAR,
      name: "Astar",
    },
  ];
};
