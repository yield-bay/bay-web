import { formatTokenSymbols } from "./farmListMethods";

export function arrayofItemsForFilteration(farms: any) {
  // array of all protocols, chains and tokens
  const protocols = farms.map((farm: any) => {
    return farm?.protocol;
  });

  const chains = farms.map((farm: any) => {
    return farm?.chain;
  });

  const tokens: string[] = [];
  farms.forEach((farm: any) => {
    tokens.push(...formatTokenSymbols(farm?.asset.symbol));
  });

  // this array consists of all required labels to provide in options to select
  // removing duplicats, using Set, before adding all in a single array
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
