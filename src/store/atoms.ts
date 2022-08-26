import { atom } from "jotai";

interface SortStatusType {
  key: string;
  order: number | undefined;
}

export const sortStatusAtom = atom<SortStatusType>({
  key: "tvl",
  order: 1,
});

export const sortedFarmsAtom = atom<any[]>([]);

export const isNotificationAtom = atom<boolean>(false);
