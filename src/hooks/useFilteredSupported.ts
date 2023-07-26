import { supportedPools } from "@components/Common/Layout/evmUtils";
import { checkIfPoolSupported } from "@utils/farmListMethods";
import { FarmType } from "@utils/types/common";

/**
 *
 * @param farms - Farms
 * @param enabled - Supported Farms toggle state
 * @returns Supported Farms
 */
export default function useFilteredSupported(
  farms: FarmType[],
  enabled: boolean
): FarmType[] {
  if (!farms) return [];
  else if (!enabled) return farms;
  const filtered = farms.filter((farm) => checkIfPoolSupported(farm));
  return filtered;
}
