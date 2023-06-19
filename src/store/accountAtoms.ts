import type { WalletAccount } from "@talismn/connect-wallets";
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// Accounts of the selected wallet
export const dotWalletAccountsAtom = atom<WalletAccount[] | null>(null);
dotWalletAccountsAtom.debugLabel = "walletAccounts";

// Address of the selected Account
const accountAddressAtom = atomWithStorage<string | null>(
  "jotai:account_address",
  null
);
accountAddressAtom.debugLabel = "accountsAddress";

// selected polkadot account
export const dotAccountAtom = atom(
  (get) => {
    const accountAddress = get(accountAddressAtom);
    if (accountAddress == null) return null;
    return (
      // using accountAddress to find Account
      get(dotWalletAccountsAtom)?.find(
        (account) => account.address === accountAddress
      ) ?? null
    );
  },
  (get, set, accountUpdate: WalletAccount | null) => {
    set(
      accountAddressAtom,
      accountUpdate !== null ? accountUpdate.address : null
    );
  }
);
dotAccountAtom.debugLabel = "polkadotAccount";

export const isConnectedDotAtom = atom((get) => {
  return !!get(dotAccountAtom);
});
