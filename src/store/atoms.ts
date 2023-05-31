import { FarmType } from "@utils/types";
import { atom } from "jotai";

// Interfaces
interface SortStatusType {
  key: string;
  order: number;
}

interface FarmTypesType {
  id: number;
  name: string;
}

// Atoms

export const sortStatusAtom = atom<SortStatusType>({
  key: "tvl",
  order: 1, // DESC
});

export const idQueryAtom = atom<string | string[] | undefined>("");
export const addrQueryAtom = atom<string | string[] | undefined>("");
export const hashAtom = atom<string | undefined>("");
export const sortedFarmsAtom = atom<FarmType[]>([]);
export const filterFarmTypeAtom = atom<number>(1);
export const farmTypesAtom = atom<FarmTypesType[]>([
  { id: 1, name: "All Types" },
  { id: 2, name: "Standard Swap" },
  { id: 3, name: "Stable Swap" },
  { id: 4, name: "Single Staking" },
]);

export const positionsAtom = atom<{ [key: string]: any }>({});

export const showSupportedFarmsAtom = atom<boolean>(false);
export const filteredChainAtom = atom<number>(0);
