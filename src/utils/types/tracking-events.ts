export interface WalletConnectEvent {
  userAddress: string;
  walletType: string;
  walletProvider: string;
  timestamp: string;
}

export type Amount = {
  amount: number;
  asset: string;
  valueUSD: number;
};

export type FarmPruned = {
  id: number;
  chef: string;
  chain: string;
  protocol: string;
  assetSymbol: string;
};

export interface AddLiquidityEvent {
  userAddress: string;
  walletType: string;
  walletProvider: string;
  timestamp: string;
  farm: FarmPruned;
  underlyingAmounts: Amount[];
  lpAmount: Amount;
}

export interface RemoveLiquidityEvent {
  userAddress: string;
  walletType: string;
  walletProvider: string;
  timestamp: string;
  farm: FarmPruned;
  underlyingAmounts: Amount[];
  lpAmount: Amount;
}

export interface StakeEvent {
  userAddress: string;
  walletType: string;
  walletProvider: string;
  timestamp: string;
  farm: FarmPruned;
  lpAmount: Amount;
}

export interface UnstakeEvent {
  userAddress: string;
  walletType: string;
  walletProvider: string;
  timestamp: string;
  farm: FarmPruned;
  lpAmount: Amount;
}

export interface ClaimRewardsEvent {
  userAddress: string;
  walletType: string;
  walletProvider: string;
  timestamp: string;
  farm: FarmPruned;
  rewards: Amount[];
}
