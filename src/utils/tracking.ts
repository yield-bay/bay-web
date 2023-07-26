import { createAddLiquidityEvent, createWalletConnectEvent } from "./api";
import getTimestamp from "./getTimestamp";
import { AddLiquidityEvent } from "./types/tracking-events";

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
    console.log(`connectWalletEvent: ${walletType}`, walletConnectEvent);
  } catch (error) {
    console.log(`Error: CreateWalletEvent ${walletType}`, error);
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
    console.log("addLiquidityEvent:", addLiquidityEvent);
  } catch (error) {
    console.log("Error: CreateAddLiquidityEvent ${walletType}", error);
  }
}
