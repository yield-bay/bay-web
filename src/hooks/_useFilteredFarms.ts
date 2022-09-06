import { formatTokenSymbols } from "@utils/farmListMethods";

type searchTermType = {
  value: string;
  label: string;
};

type searchObjectType = {
  protocols: searchTermType[];
  chains: searchTermType[];
  tokens: searchTermType[];
};

// array of all protocols, chains and tokens seperated
const objectOfAllOptions = (farms: any) => {
  let protocols: string[] = [];
  let chains: string[] = [];
  let tokens: string[] = [];

  farms.forEach((farm: any) => {
    protocols.push(farm?.protocol);

    chains.push(farm?.chain);

    let tempTokens = [];
    tempTokens.push(...formatTokenSymbols(farm?.asset.symbol));
    tempTokens.forEach((tempToken) => {
      tokens.push(tempToken);
    });
  });

  return {
    protocols: Array.from(new Set(protocols)) as string[],
    chains: Array.from(new Set(chains)) as string[],
    tokens: Array.from(new Set(tokens)) as string[],
  };
};

// matchTerm template: tokenName1_tokenName2_protocol_chain
const createMatchTerm = (farm: any) => {
  let matchTerm = "";
  const tokenNames = formatTokenSymbols(farm?.asset.symbol);
  tokenNames.forEach((tokenName) => {
    matchTerm += tokenName + "_";
  });
  return matchTerm.concat(farm?.protocol, "_", farm?.chain).toUpperCase();
};

// Function that returns intersection between two arrays
const intersect = (a: any, b: any) => {
  let setB = new Set(b);
  let intersection = new Set(
    [...Array.from(new Set(a))].filter((x) => setB.has(x))
  );
  return Array.from(intersection);
};

// useFilteredFarms HOOK
export default function useFilteredFarms(
  farms: any[],
  searchArray: { value: string; label: string }[]
): [any[], boolean] {
  if (!farms) return [[], true];
  if (searchArray.length == 0) return [farms, false];

  const allOptions = objectOfAllOptions(farms);

  let searchObject: searchObjectType = {
    protocols: [],
    chains: [],
    tokens: [],
  };
  let filteredFarms: any[] = [];

  // this loop sorts searchTerm items into protocol, chain, token category in an object
  searchArray.forEach((term) => {
    if (allOptions.protocols.indexOf(term.label) >= 0)
      searchObject.protocols.push(term);
    else if (allOptions.chains.indexOf(term.label) >= 0)
      searchObject.chains.push(term);
    else if (allOptions.tokens.indexOf(term.label) >= 0)
      searchObject.tokens.push(term);
  });
  // console.log("search Object", searchObject);

  let filteredByProtocol: any = [];
  let filteredByChain: any = [];
  let filteredByToken: any = [];

  // iterating for protocols
  searchObject.protocols.forEach((protocol) => {
    const filtered = farms.filter((farm: any) => {
      const matchTerm = createMatchTerm(farm);
      if (matchTerm.indexOf(protocol.value.toUpperCase()) >= 0) return true;
      return false;
    });
    filteredByProtocol = filtered;
  });

  searchObject.chains.forEach((chain) => {
    const filtered = farms.filter((farm: any) => {
      const matchTerm = createMatchTerm(farm);
      if (matchTerm.indexOf(chain.value.toUpperCase()) >= 0) return true;
      return false;
    });
    filteredByChain = filtered;
  });

  searchObject.tokens.forEach((token) => {
    const filtered = farms.filter((farm: any) => {
      const matchTerm = createMatchTerm(farm);
      if (matchTerm.indexOf(token.value.toUpperCase()) >= 0) return true;
      return false;
    });
    filteredByToken = filtered;
  });

  // filtering by all terms, so no inlusion or exclusion happening, it's showing all in union
  // searchArray.forEach((searchTerm) => {
  //   const filtered = farms.filter((farm: any) => {
  //     const matchTerm = createMatchTerm(farm);
  //     if (matchTerm.indexOf(searchTerm.value.toUpperCase()) >= 0) return true;
  //     return false;
  //   });
  //   filteredFarms = Array.from(new Set([...filteredFarms, ...filtered]));
  //   console.log("filteredFarms", filteredFarms);
  // });

  const noResult = filteredFarms.length === 0;
  return [filteredFarms, noResult];
}
