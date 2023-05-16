import type { Wallet } from "@talismn/connect-wallets";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const walletNameAtom = atomWithStorage<string | null>(
  "jotai:wallet_name", // key
  null // intial value
);

export const dotWalletsAtom = atom<Wallet[]>([]);

// Connected Wallet
export const dotWalletAtom = atom(
  (get) => {
    const walletName = get(walletNameAtom);
    if (walletName == null) return null;
    return (
      get(dotWalletsAtom)?.find(
        (wallet) => wallet.extensionName === walletName
      ) ?? null
    );
  },
  (get, set, update: Wallet | null) => {
    set(walletNameAtom, update !== null ? update.extensionName : null);
  }
);
