export type UnderlyingAssets = {
  symbol: string;
  address: `0x${string}`;
  decimals: number;
};

type Rewards = {
  amount: number;
  asset: string;
  valueUSD: number;
  freq: string;
};

type APR = {
  reward: number;
  base: number;
};

export interface FarmType {
  id: number;
  chef: string;
  chain: string;
  protocol: string;
  router: `0x${string}`;
  farmType: string;
  farmImpl: string;
  asset: {
    symbol: string;
    address: `0x${string}`;
    price: number;
    logos: string[];
    underlyingAssets: UnderlyingAssets[];
  };
  tvl: number;
  rewards: Rewards[];
  apr: APR;
  allocPoint: number;
  lastUpdatedAtUTC: string;
  safetyScore: number;
}
export interface TokenPriceType {
  chain: string;
  protocol: string;
  symbol: string;
  address: `0x${string}`;
  decimals: number;
  price: number;
  underlyingAssets: UnderlyingAssets[];
}

export interface UnclaimedRewardType {
  token: string;
  amount: number;
  amountUSD: number;
}

export interface PositionType {
  unstaked: {
    amount: number;
    amountUSD: number;
  };
  staked: {
    amount: number;
    amountUSD: number;
  };
  unclaimedRewards: UnclaimedRewardType[];
}

export interface PortfolioPositionType {
  unstaked: {
    amount: number;
    amountUSD: number;
  };
  staked: {
    amount: number;
    amountUSD: number;
  };
  unclaimedRewards: UnclaimedRewardType[];
  chain: string;
  protocol: string;
  chef: `0x${string}`;
  id: number;
  lpSymbol: string;
}

export enum Network {
  MOONBEAM = "moonbeam",
  MOONRIVER = "moonriver",
  ASTAR = "astar",
  HARDHAT = "hardhat",
}

export enum ChainId {
  MOONBEAM = 1284,
  MOONRIVER = 1285,
  ASTAR = 592,
  HARDHAT = 31337,
}

export interface Chain {
  id: ChainId;
  name: Network;
}

export interface WalletConnectEventType {
  userAddress: string;
  walletType: string;
  walletProvider: string;
  timestamp: string;
}
