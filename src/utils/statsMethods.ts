import { FarmType } from "./types";
import { formatFirstLetter } from "./farmListMethods";

export function protocolCount(farms: FarmType[]): number {
  return new Set(farms.map((farm: any) => farm?.protocol)).size;
}

/**
 *
 * @param farms - List of Farms
 * @returns An array containing all the protocols
 */
export function protocolList(farms: FarmType[]): string[] {
  return Array.from(
    new Set(farms.map((farm) => formatFirstLetter(farm?.protocol)))
  );
}

/**
 *
 * @param farms - List of Farms
 * @returns Total TVL of all listed Farms
 */
export function tvlCount(farms: FarmType[]): number {
  return farms.reduce((acc, currFarm) => acc + currFarm.tvl, 0);
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
