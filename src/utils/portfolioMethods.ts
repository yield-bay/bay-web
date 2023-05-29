export function calcTotalUnclaimedRewards(userPositions: any) {
  let total = 0;
  for (let i = 0; i < userPositions.length; i++) {
    let position = userPositions[i];
    for (let j = 0; j < position.unclaimedRewards.length; j++) {
      total += position.unclaimedRewards[j].amountUSD;
    }
  }
  return total.toFixed(2);
}

export function calcNetWorth(userPositions: any) {
  let total = 0;
  for (let i = 0; i < userPositions.length; i++) {
    total +=
      userPositions[i].unstaked.amountUSD + userPositions[i].staked.amountUSD;
  }
  return total.toFixed(2);
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
