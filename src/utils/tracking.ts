import { createWalletConnectEvent } from "./api";
import getTimestamp from "./getTimestamp";

interface WalletEvent {
  address: string;
  walletType: "EVM" | "DOT";
  connector: string;
}

export const walletConnectEvent = async ({
  address,
  walletType,
  connector,
}: WalletEvent) => {
  try {
    const connectWalletEvent = await createWalletConnectEvent(
      address,
      walletType,
      connector,
      getTimestamp()
    );
    console.log(`connectWalletEvent: ${walletType}`, connectWalletEvent);
  } catch (error) {
    console.log(`Error: CreateWalletEvent ${walletType}`, error);
  }
};
