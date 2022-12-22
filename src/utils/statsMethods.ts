import { FarmType } from "./types";
import { formatFirstLetter } from "./farmListMethods";

export function protocolCount(farms: FarmType[]): number {
  return new Set(farms.map((farm: any) => farm?.protocol)).size;
}

export function protocolList(farms: FarmType[]): string[] {
  return Array.from(
    new Set(farms.map((farm) => formatFirstLetter(farm?.protocol)))
  );
}

export function tvlCount(farms: FarmType[]): number {
  let totalTVL = 0;
  farms.forEach((farm: any) => {
    totalTVL += farm?.tvl;
  });
  return totalTVL;
}
