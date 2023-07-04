/**
 *
 * @param num Number to convert into Dollar Notation
 * @param decimals Number of decimals to round to
 * @returns Converted amounts in Dollars
 */
export default function toUnits(num: number, decimals: number): string {
  if (num >= 1000000) {
    return (
      Number((num / 1000000).toFixed(decimals)).toLocaleString("en-US") + "M"
    );
  } else if (num >= 1000 && num < 1000000) {
    return Number((num / 1000).toFixed(decimals)).toLocaleString("en-US") + "K";
  }
  return Number(num.toFixed(decimals)).toLocaleString("en-US");
}
