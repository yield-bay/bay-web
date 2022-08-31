import { formatTokenSymbols } from "./farmListMethods";

export function arrayofItemsForFilteration(farms: any) {
  // array of all protocols
  const protocols = farms.map((farm: any) => {
    return farm?.protocol;
  });

  // array of all chains
  const chains = farms.map((farm: any) => {
    return farm?.chain;
  });

  //  array of all tokens
  const tokens: string[] = [];
  farms.forEach((farm: any) => {
    tokens.push(...formatTokenSymbols(farm?.asset.symbol));
  });

  const penultimate = [
    ...(Array.from(new Set(protocols)) as string[]),
    ...(Array.from(new Set(chains)) as string[]),
    ...(Array.from(new Set(tokens)) as string[]),
  ];

  return penultimate.map((item) => {
    return {
      value: item.toLowerCase(),
      label: item,
    };
  });
}
