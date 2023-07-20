import { atom } from "jotai";
import Account from "@utils/xcm/common/account";
import { MangataPool } from "@utils/types";

// Positions loading
export const evmPosLoadingAtom = atom<boolean>(false);
export const subPosLoadingAtom = atom<boolean>(false);

// Modal States
export const addLiqModalOpenAtom = atom<boolean>(false);
export const removeLiqModalOpenAtom = atom<boolean>(false);
export const stakingModalOpenAtom = atom<boolean>(false);
export const unstakingModalOpenAtom = atom<boolean>(false);
export const claimModalOpenAtom = atom<boolean>(false);
export const slippageModalOpenAtom = atom<boolean>(false);

export const mangataHelperAtom = atom<any | null>(null);
export const mangataAddressAtom = atom<string>("");
export const mangataPoolsAtom = atom<MangataPool[] | null>(null);
export const accountInitAtom = atom<Account | null>(null);
export const isInitialisedAtom = atom<boolean>(false);
