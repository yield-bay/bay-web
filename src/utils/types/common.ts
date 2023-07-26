import BN from "bn.js";
import { Address } from "viem";
import { Network } from "ethers";
import { ChainId } from "./enums";

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

export type UnderlyingAssets = {
  symbol: string;
  address: Address;
  decimals: number;
};

export interface FarmType {
  id: number;
  chef: Address;
  chain: string;
  protocol: string;
  router: Address;
  farmType: string;
  farmImpl: string;
  asset: {
    symbol: string;
    address: Address;
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
  address: Address;
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
  chef: Address;
  id: number;
  lpSymbol: string;
  farmType: string;
  lpAddress: Address;
}

export interface Chain {
  id: ChainId;
  name: Network;
}

export type MangataPool = {
  firstTokenAmount: BN;
  firstTokenAmountFloat: BN;
  firstTokenId: string;
  firstTokenRatio: BN;
  isPromoted: boolean;
  liquidityTokenId: string;
  secondTokenAmount: BN;
  secondTokenAmountFloat: BN;
  secondTokenId: string;
  secondTokenRatio: BN;
};
