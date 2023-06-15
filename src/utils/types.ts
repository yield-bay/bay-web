export type UnderlyingAssets = {
  symbol: string;
  address: string;
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
    address: string;
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
  address: string;
  price: number;
  underlyingAssets: UnderlyingAssets[];
}

export enum Network {
  MOONBEAM = "moonbeam",
  MOONRIVER = "moonriver",
  ASTAR = "astar",
}

export enum ChainId {
  MOONBEAM = 1284,
  MOONRIVER = 1285,
  ASTAR = 592,
}

export interface Chain {
  id: ChainId;
  name: Network;
}
