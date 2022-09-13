import toDollarUnits from "./toDollarUnits";
import { formatFirstLetter } from "./farmListMethods";

export function protocolCount(farms: any): number {
  return new Set(farms.map((farm: any) => farm?.protocol)).size;
}

export function protocolList(farms: any): string[] {
  return Array.from(
    new Set(
      farms.map((farm: any) => formatFirstLetter(farm?.protocol)) as string
    )
  );
}

export function tvlCount(farms: any): number {
  let totalTVL = 0;
  farms.forEach((farm: any) => {
    totalTVL += farm?.tvl;
  });
  return totalTVL;
}
