export function useConnection(): boolean {
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.onLine === "boolean"
  ) {
    return navigator.onLine;
  }
  return true;
}
