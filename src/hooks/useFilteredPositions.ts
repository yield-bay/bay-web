import { formatTokenSymbols } from "@utils/farmListMethods";
import { PortfolioPositionType } from "@utils/types";

/**
 *
 * @param positions - Farms list
 * @param search - Search term
 * @returns Filtered farms list according to search term
 */
export default function useFilteredPositions(
  positions: PortfolioPositionType[],
  search: string
): [PortfolioPositionType[], boolean] {
  if (!positions) return [[], true];
  if (search === "") return [positions, false];
  const searchTerm = search.trim().toUpperCase();
  const filtered = positions.filter((position: any) => {
    let matchTerm = "";
    const tokenNames = formatTokenSymbols(position?.lpSymbol);

    tokenNames.forEach((tokenName) => {
      matchTerm += tokenName + "_";
    });

    matchTerm = matchTerm
      .concat(position?.protocol, "_", position?.chain)
      .toUpperCase();

    if (matchTerm.indexOf(searchTerm) >= 0) return true;
    return false;
  });
  const noResult = filtered.length === 0;
  return [filtered, noResult];
}
