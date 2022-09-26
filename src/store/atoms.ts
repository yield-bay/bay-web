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

export const isNotificationAtom = atom<boolean>(false);
export const idQueryAtom = atom<string | string[] | undefined>("");
export const farmQueryAtom = atom<string | string[] | undefined>("");

export const sortedFarmsAtom = atom<any[]>([]);
export const filterFarmTypeAtom = atom<number>(1);
export const farmTypesAtom = atom<FarmTypesType[]>([
  { id: 1, name: "All Types" },
  { id: 2, name: "Standard Swap" },
  { id: 3, name: "Stable Swap" },
  { id: 4, name: "Single Staking" },
]);

export const showScrollBtnAtom = atom<boolean>(false);
