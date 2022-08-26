import toDollarFormat from "./toDollarFormat";

export function protocolCount(farms: any): number {
  return new Set(farms.map((farm: any) => farm?.protocol)).size;
}

export function tvlCount(farms: any): string {
  let totalTVL = 0;
  farms.forEach((farm: any) => {
    totalTVL += farm?.tvl;
  });
  return toDollarFormat(totalTVL);
}
