import { formatTokenSymbols } from "@utils/farmListMethods";

export default function useFilteredFarmTypes(
  farms: any[],
  id: number
): [any[], boolean] {
  if (!farms) return [[], true];
  else if (id == 1) return [farms, false];
  else if (id == 2) {
    const filtered = farms.filter(
      (farm: any) => farm?.farmType == "StandardAmm"
    );
    return [filtered, false];
  } else if (id == 3) {
    const filtered = farms.filter((farm: any) => farm?.farmType == "StableAmm");
    return [filtered, false];
  }
  // else if (id == 4) {
  //   const filtered = farms.filter((farm: any) => farm?.farmType == "SingleAmm");
  //   return [filtered, true];
  // }
  return [farms, false];
}
