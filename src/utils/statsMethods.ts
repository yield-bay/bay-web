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

/**
 *
 * @param tvl - Total TVL of all listed Farms
 * @returns An array containing TVL & dollar units suffix
 */
export function tvlFormatter(tvl: number): [number, string] {
  if (tvl >= 1000000) {
    return [parseFloat((tvl / 1000000).toFixed(2)), "M"];
  } else if (tvl >= 1000 && tvl < 1000000) {
    return [parseFloat((tvl / 1000).toFixed(2)), "K"];
  }
  return [tvl, ""];
}
