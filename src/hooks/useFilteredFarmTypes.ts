import { FarmType } from "@utils/types";

/**
 *
 * @param farms - List of farms
 * @param id - Id assigned to farm types, ie. 1 = all, 2 = standard, 3 = stable, 4 = single
 * @returns - Filtered list of farms according to option select
 */
export default function useFilteredFarmTypes(
  farms: FarmType[],
  id: number
): FarmType[] {
  if (!farms) return [];
  else if (id == 1) return farms;
  else if (id == 2) {
    const filtered = farms.filter((farm) => farm?.farmType == "StandardAmm");
    return filtered;
  } else if (id == 3) {
    const filtered = farms.filter((farm) => farm?.farmType == "StableAmm");
    return filtered;
  } else if (id == 4) {
    const filtered = farms.filter((farm) => farm?.farmType == "SingleStaking");
    return filtered;
  } else if (id == 5) {
    const filtered = farms.filter(
      (farm) => farm?.farmType == "ConcentratedLiquidity"
    );
    return filtered;
  }
  return farms;
}
