import {
  createAddLiquidityEvent,
  createClaimRewardsEvent,
  createRemoveLiquidityEvent,
  createStakeEvent,
  createUnstakeEvent,
  createWalletConnectEvent,
} from "./api";
import getTimestamp from "./getTimestamp";
import {
  AddLiquidityEvent,
  ClaimRewardsEvent,
  RemoveLiquidityEvent,
  StakeEvent,
  UnstakeEvent,
} from "./types/tracking-events";

interface WalletEvent {
  address: string;
  walletType: "EVM" | "DOT";
  connector: string;
}

export async function handleWalletConnectEvent({
  address,
  walletType,
  connector,
}: WalletEvent) {
  try {
    const { walletConnectEvent } = await createWalletConnectEvent(
      address,
      walletType,
      connector,
      getTimestamp()
    );
    // console.log(`connectWalletEvent: ${walletType}`, walletConnectEvent);
  } catch (error) {
    // console.log(`Error: CreateWalletEvent ${walletType}`, error);
  }
}

export async function handleAddLiquidityEvent({
  userAddress,
  walletType,
  walletProvider,
  timestamp,
  farm,
  underlyingAmounts,
  lpAmount,
}: AddLiquidityEvent) {
  try {
    const { addLiquidityEvent } = await createAddLiquidityEvent(
      userAddress,
      walletType,
      walletProvider,
      timestamp,
      farm,
      underlyingAmounts,
      lpAmount
    );
    // console.log("addLiquidityEvent:", addLiquidityEvent);
  } catch (error) {
    // console.log("Error: CreateAddLiquidityEvent ${walletType}", error);
  }
}

export async function handleRemoveLiquidityEvent({
  userAddress,
  walletType,
  walletProvider,
  timestamp,
  farm,
  underlyingAmounts,
  lpAmount,
}: RemoveLiquidityEvent) {
  try {
    const { removeLiquidityEvent } = await createRemoveLiquidityEvent(
      userAddress,
      walletType,
      walletProvider,
      timestamp,
      farm,
      underlyingAmounts,
      lpAmount
    );
    // console.log("removeLiquidityEvent:", removeLiquidityEvent);
  } catch (error) {
    // console.log(`Error: createRemoveLiquidityEvent ${walletType}`, error);
  }
}

export async function handleStakeEvent({
  userAddress,
  walletType,
  walletProvider,
  timestamp,
  farm,
  lpAmount,
}: StakeEvent) {
  try {
    const { stakeEvent } = await createStakeEvent(
      userAddress,
      walletType,
      walletProvider,
      timestamp,
      farm,
      lpAmount
    );
    // console.log("stakeEvent:", stakeEvent);
  } catch (error) {
    // console.log(`Error: createStakeEvent ${walletType}`, error);
  }
}

export async function handleUnstakeEvent({
  userAddress,
  walletType,
  walletProvider,
  timestamp,
  farm,
  lpAmount,
}: UnstakeEvent) {
  try {
    const { unstakeEvent } = await createUnstakeEvent(
      userAddress,
      walletType,
      walletProvider,
      timestamp,
      farm,
      lpAmount
    );
    // console.log("unstakeEvent:", unstakeEvent);
  } catch (error) {
    // console.log(`Error: createUnstakeEvent ${walletType}`, error);
  }
}

export async function handleClaimRewardsEvent({
  userAddress,
  walletType,
  walletProvider,
  timestamp,
  farm,
  rewards,
}: ClaimRewardsEvent) {
  try {
    const { claimRewardsEvent } = await createClaimRewardsEvent(
      userAddress,
      walletType,
      walletProvider,
      timestamp,
      farm,
      rewards
    );
    // console.log("claimRewardsEvent:", claimRewardsEvent);
  } catch (error) {
    // console.log(`Error: createClaimRewardsEvent ${walletType}`, error);
  }
}
