import { atom } from "jotai";

// Positions loading
export const evmPosLoadingAtom = atom<boolean>(false);
export const subPosLoadingAtom = atom<boolean>(false);

// Modal States
export const addLiqModalOpenAtom = atom<boolean>(false);
export const removeLiqModalOpenAtom = atom<boolean>(false);
export const stakingModalOpenAtom = atom<boolean>(false);
