import { FarmType, PortfolioPositionType } from "@utils/types";
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
  { id: 5, name: "Concentrated liquidity" },
]);

export const farmsAtom = atom<FarmType[]>([]);
export const positionsAtom = atom<{ [key: string]: any }>({}); // `${chain}-${protocol}-${chef}-${id}-${asset.symbol}`
export const lpTokenPricesAtom = atom<{ [key: string]: number }>({}); // `${chain}-${protocol}-${symbol}-${address}`
export const tokenPricesAtom = atom<{ [key: string]: number }>({}); // `${chain}-${protocol}-${symbol}-${address}`

export const showSupportedFarmsAtom = atom<boolean>(false);
export const filteredChainAtom = atom<number>(0);
export const selectedFarmAtom = atom<FarmType | null>(null);
export const selectedPositionAtom = atom<PortfolioPositionType | null>(null);

export const slippageAtom = atom<number>(0.05);
