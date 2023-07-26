import { createClient, defaultExchanges, gql } from "@urql/core";
import { API_URL } from "./constants";
import { FarmType, TokenPriceType } from "@utils/types/common";
import {
  AddLiquidityEvent,
  Amount,
  ClaimRewardsEvent,
  FarmPruned,
  RemoveLiquidityEvent,
  StakeEvent,
  UnstakeEvent,
  WalletConnectEvent,
} from "@utils/types/tracking-events";

const client = createClient({
  url: API_URL,
  exchanges: defaultExchanges,
});

/**
 * @returns list of farms
 */
export const fetchListicleFarms = async (): Promise<{
  farms: FarmType[];
}> => {
  const farmObj = await client
    .query(
      gql`
        query Farms {
          farms {
            id
            chef
            chain
            protocol
            router
            farmType
            farmImpl
            asset {
              symbol
              address
              price
              logos
              underlyingAssets {
                symbol
                address
                decimals
              }
            }
            tvl
            rewards {
              amount
              asset
              valueUSD
              freq
            }
            apr {
              reward
              base
            }
            allocPoint
            lastUpdatedAtUTC
            safetyScore
          }
        }
      `
    )
    .toPromise();
  const farms = farmObj?.data?.farms;
  return {
    farms,
  };
};

export const fetchLpTokenPrices = async (): Promise<{
  lpTokenPrices: TokenPriceType[];
}> => {
  const lptokenPricesObj = await client
    .query(
      gql`
        query LpTokenPrices($protocols: [Protocol!]!) {
          lpTokenPrices(protocols: $protocols) {
            chain
            protocol
            symbol
            address
            price
            underlyingAssets {
              symbol
              address
              decimals
            }
          }
        }
      `,
      {
        protocols: [
          { chain: "moonbeam", protocol: "stellaswap" },
          { chain: "moonbeam", protocol: "curve" },
          { chain: "moonbeam", protocol: "zenlink" },
          { chain: "moonriver", protocol: "solarbeam" },
          { chain: "moonriver", protocol: "zenlink" },
          { chain: "astar", protocol: "zenlink" },
          { chain: "moonbeam", protocol: "beamswap" },
          { chain: "moonbeam", protocol: "solarflare" },
          { chain: "moonriver", protocol: "sushiswap" },
          { chain: "astar", protocol: "arthswap" },
          { chain: "astar", protocol: "Sirius" },
        ],
      }
    )
    .toPromise();
  const lpTokenPrices = lptokenPricesObj?.data?.lpTokenPrices;
  return {
    lpTokenPrices,
  };
};

export const fetchTokenPrices = async (): Promise<{
  tokenPrices: TokenPriceType[];
}> => {
  const tokenPricesObj = await client
    .query(
      gql`
        query TokenPrices($protocols: [Protocol!]!) {
          tokenPrices(protocols: $protocols) {
            chain
            protocol
            symbol
            address
            price
            underlyingAssets {
              symbol
              address
              decimals
            }
          }
        }
      `,
      {
        protocols: [
          { chain: "moonbeam", protocol: "stellaswap" },
          { chain: "moonbeam", protocol: "curve" },
          { chain: "moonriver", protocol: "solarbeam" },
          { chain: "moonbeam", protocol: "zenlink" },
          { chain: "moonriver", protocol: "zenlink" },
          { chain: "astar", protocol: "zenlink" },
          { chain: "moonbeam", protocol: "beamswap" },
          { chain: "moonbeam", protocol: "solarflare" },
          { chain: "moonriver", protocol: "sushiswap" },
          { chain: "astar", protocol: "arthswap" },
          { chain: "astar", protocol: "Sirius" },
        ],
      }
    )
    .toPromise();
  const tokenPrices = tokenPricesObj?.data?.tokenPrices;
  return {
    tokenPrices,
  };
};

export const createWalletConnectEvent = async (
  userAddress: string,
  walletType: string,
  walletProvider: string,
  timestamp: string
): Promise<{
  walletConnectEvent: WalletConnectEvent;
}> => {
  const walletConnectObj = await client
    .mutation(
      gql`
        mutation CreateWalletConnectEvent(
          $userAddress: String!
          $walletType: String!
          $walletProvider: String!
          $timestamp: String!
        ) {
          createWalletConnectEvent(
            userAddress: $userAddress
            walletType: $walletType
            walletProvider: $walletProvider
            timestamp: $timestamp
          ) {
            userAddress
            walletType
            walletProvider
            timestamp
          }
        }
      `,
      {
        // variables
        userAddress,
        walletType,
        walletProvider,
        timestamp,
      }
    )
    .toPromise();
  const walletConnectEvent = walletConnectObj?.data?.createWalletConnectEvent;
  return { walletConnectEvent };
};

export const createAddLiquidityEvent = async (
  userAddress: string,
  walletType: string,
  walletProvider: string,
  timestamp: string,
  farm: FarmPruned,
  underlyingAmounts: Amount[],
  lpAmount: Amount
): Promise<{ addLiquidityEvent: AddLiquidityEvent }> => {
  const addLiquidityObj = await client
    .mutation(
      gql`
        mutation CreateAddLiquidityEvent(
          $userAddress: String!
          $walletType: String!
          $walletProvider: String!
          $timestamp: String!
          $farm: FarmPruned!
          $underlyingAmounts: [Amount!]!
          $lpAmount: Amount!
        ) {
          createAddLiquidityEvent(
            userAddress: $userAddress
            walletType: $walletType
            walletProvider: $walletProvider
            timestamp: $timestamp
            farm: $farm
            underlyingAmounts: $underlyingAmounts
            lpAmount: $lpAmount
          ) {
            userAddress
            walletType
            walletProvider
            timestamp
            farm {
              id
              chef
              chain
              protocol
              assetSymbol
            }
            underlyingAmounts {
              amount
              asset
              valueUSD
            }
            lpAmount {
              amount
              asset
              valueUSD
            }
          }
        }
      `,
      {
        // variables
        userAddress,
        walletType,
        walletProvider,
        timestamp,
        farm,
        underlyingAmounts,
        lpAmount,
      }
    )
    .toPromise();
  const addLiquidityEvent = addLiquidityObj?.data?.createAddLiquidityEvent;
  return { addLiquidityEvent };
};

export const createRemoveLiquidityEvent = async (
  userAddress: string,
  walletType: string,
  walletProvider: string,
  timestamp: string,
  farm: FarmPruned,
  underlyingAmounts: Amount[],
  lpAmount: Amount
): Promise<{ removeLiquidityEvent: RemoveLiquidityEvent }> => {
  const removeLiquidityObj = await client
    .mutation(
      gql`
        mutation CreateRemoveLiquidityEvent(
          $userAddress: String!
          $walletType: String!
          $walletProvider: String!
          $timestamp: String!
          $farm: FarmPruned!
          $underlyingAmounts: [Amount!]!
          $lpAmount: Amount!
        ) {
          createRemoveLiquidityEvent(
            userAddress: $userAddress
            walletType: $walletType
            walletProvider: $walletProvider
            timestamp: $timestamp
            farm: $farm
            underlyingAmounts: $underlyingAmounts
            lpAmount: $lpAmount
          ) {
            userAddress
            walletType
            walletProvider
            timestamp
            farm {
              id
              chef
              chain
              protocol
              assetSymbol
            }
            underlyingAmounts {
              amount
              asset
              valueUSD
            }
            lpAmount {
              amount
              asset
              valueUSD
            }
          }
        }
      `,
      {
        // variables
        userAddress,
        walletType,
        walletProvider,
        timestamp,
        farm,
        underlyingAmounts,
        lpAmount,
      }
    )
    .toPromise();
  const removeLiquidityEvent =
    removeLiquidityObj?.data?.createRemoveLiquidityEvent;
  return { removeLiquidityEvent };
};

export const createStakeEvent = async (
  userAddress: string,
  walletType: string,
  walletProvider: string,
  timestamp: string,
  farm: FarmPruned,
  lpAmount: Amount
): Promise<{ stakeEvent: StakeEvent }> => {
  const stakeEventObj = await client
    .mutation(
      gql`
        mutation CreateStakeEvent(
          $userAddress: String!
          $walletType: String!
          $walletProvider: String!
          $timestamp: String!
          $farm: FarmPruned!
          $lpAmount: Amount!
        ) {
          createStakeEvent(
            userAddress: $userAddress
            walletType: $walletType
            walletProvider: $walletProvider
            timestamp: $timestamp
            farm: $farm
            lpAmount: $lpAmount
          ) {
            userAddress
            walletType
            walletProvider
            timestamp
            farm {
              id
              chef
              chain
              protocol
              assetSymbol
            }
            lpAmount {
              amount
              asset
              valueUSD
            }
          }
        }
      `,
      {
        // variables
        userAddress,
        walletType,
        walletProvider,
        timestamp,
        farm,
        lpAmount,
      }
    )
    .toPromise();
  const stakeEvent = stakeEventObj?.data?.createStakeEvent;
  return { stakeEvent };
};

export const createUnstakeEvent = async (
  userAddress: string,
  walletType: string,
  walletProvider: string,
  timestamp: string,
  farm: FarmPruned,
  lpAmount: Amount
): Promise<{ unstakeEvent: UnstakeEvent }> => {
  const unstakeEventObj = await client
    .mutation(
      gql`
        mutation CreateUnstakeEvent(
          $userAddress: String!
          $walletType: String!
          $walletProvider: String!
          $timestamp: String!
          $farm: FarmPruned!
          $lpAmount: Amount!
        ) {
          createUnstakeEvent(
            userAddress: $userAddress
            walletType: $walletType
            walletProvider: $walletProvider
            timestamp: $timestamp
            farm: $farm
            lpAmount: $lpAmount
          ) {
            userAddress
            walletType
            walletProvider
            timestamp
            farm {
              id
              chef
              chain
              protocol
              assetSymbol
            }
            lpAmount {
              amount
              asset
              valueUSD
            }
          }
        }
      `,
      {
        // variables
        userAddress,
        walletType,
        walletProvider,
        timestamp,
        farm,
        lpAmount,
      }
    )
    .toPromise();
  const unstakeEvent = unstakeEventObj?.data?.createUnstakeEvent;
  return { unstakeEvent };
};

export const createClaimRewardsEvent = async (
  userAddress: string,
  walletType: string,
  walletProvider: string,
  timestamp: string,
  farm: FarmPruned,
  rewards: Amount[]
): Promise<{ claimRewardsEvent: ClaimRewardsEvent }> => {
  const claimRewardsEventObj = await client
    .mutation(
      gql`
        mutation CreateClaimRewardsEvent(
          $userAddress: String!
          $walletType: String!
          $walletProvider: String!
          $timestamp: String!
          $farm: FarmPruned!
          $rewards: [Amount!]!
        ) {
          createClaimRewardsEvent(
            userAddress: $userAddress
            walletType: $walletType
            walletProvider: $walletProvider
            timestamp: $timestamp
            farm: $farm
            rewards: $rewards
          ) {
            userAddress
            walletType
            walletProvider
            timestamp
            farm {
              id
              chef
              chain
              protocol
              assetSymbol
            }
            rewards {
              amount
              asset
              valueUSD
            }
          }
        }
      `,
      {
        // variables
        userAddress,
        walletType,
        walletProvider,
        timestamp,
        farm,
        rewards,
      }
    )
    .toPromise();
  const claimRewardsEvent = claimRewardsEventObj?.data?.createClaimRewardsEvent;
  return { claimRewardsEvent };
};
