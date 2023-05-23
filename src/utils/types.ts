export interface FarmType {
  id: number;
  chef: string;
  chain: string;
  protocol: string;
  farmType: string;
  farmImpl: string;
  asset: {
    symbol: string;
    address: string;
    price: number;
    logos: string[];
  };
  tvl: number;
  rewards: {
    amount: number;
    asset: string;
    valueUSD: number;
    freq: string;
  }[];
  apr: {
    reward: number;
    base: number;
  };
  allocPoint: number;
  lastUpdatedAtUTC: string;
  safetyScore: number;
}

export interface LeaderboardType {
  address: string;
  users_brought: number;
  created_at: string;
  last_user_brought_at: string;
}

export interface TokenPriceType {
  address: string;
  chain: string;
  price: number;
  protocol: string;
  symbol: string;
}
