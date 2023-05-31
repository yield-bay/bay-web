import { FarmType } from "@utils/types";

export default function useSpecificPosition(
  positions: any,
  farm: FarmType
): [any, boolean] {
  if (!farm || !positions) return [null, false];

  // Checking if position exists by providing key
  const currentPosition =
    positions[
      `${farm.chain}-${farm.protocol}-${farm.chef}-${farm.id}-${farm.asset.symbol}`
    ];

  // Depending if position exists, return null or position
  if (!currentPosition) return [null, false];
  return [currentPosition, true];
}
