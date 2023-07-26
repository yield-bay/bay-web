import { PortfolioPositionType } from "./types/common";

export function calcTotalUnclaimedRewards(
  userPositions: PortfolioPositionType[]
) {
  return userPositions.reduce((accumulator: number, position) => {
    console.log("upreduce", accumulator, position.unclaimedRewards);
    return (
      accumulator +
      position.unclaimedRewards.reduce((sum: number, reward) => {
        if (!isNaN(reward.amountUSD)) {
          return sum + reward.amountUSD;
        }
        return sum;
      }, 0)
    );
  }, 0);
}

export function calcNetWorth(userPositions: PortfolioPositionType[]) {
  return userPositions.reduce(
    (acc, currPosition) =>
      acc + currPosition.unstaked.amountUSD + currPosition.staked.amountUSD,
    0
  );
}

export function joinArrayElements(
  arr: string[],
  startIndex: number,
  endIndex: number
) {
  // Perform input validation
  if (!Array.isArray(arr)) {
    throw new Error("Input is not an array");
  }
  if (startIndex < 0 || startIndex >= arr.length) {
    throw new Error("Invalid starting index");
  }
  if (endIndex < 0 || endIndex >= arr.length) {
    throw new Error("Invalid ending index");
  }
  if (startIndex > endIndex) {
    throw new Error(
      "Starting index should be less than or equal to ending index"
    );
  }

  // Use Array.slice() to extract the desired elements
  const extractedElements = arr.slice(startIndex, endIndex + 1);

  // Use Array.join() to join the extracted elements into a single string
  const joinedString = extractedElements.join("-");

  return joinedString;
}
