import { atom } from "jotai";

// Interfaces
interface SortStatusType {
  key: string;
  order: number | undefined;
}

// Atoms

export const sortStatusAtom = atom<SortStatusType>({
  key: "tvl",
  order: 1,
});

export const sortedFarmsAtom = atom<any[]>([]);
export const isNotificationAtom = atom<boolean>(false);
export const filterFarmTypeAtom = atom<number>(1);
export const idQueryAtom = atom<string | string[] | undefined>("");
export const farmQueryAtom = atom<string | string[] | undefined>("");
