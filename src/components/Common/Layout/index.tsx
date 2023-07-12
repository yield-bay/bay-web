import { FC, ReactNode, useEffect, useState } from "react";
import clsx from "clsx";
import Footer from "@components/Common/Footer";
import Header from "@components/Common/Header";
import { satoshiFont } from "@utils/localFont";
import { useAtom } from "jotai";
import { positionsAtom } from "@store/atoms";
import { useQuery } from "@tanstack/react-query";
import { FarmType, TokenPriceType } from "@utils/types";
import {
  createWalletConnectEvent,
  fetchListicleFarms,
  fetchLpTokenPrices,
  fetchTokenPrices,
} from "@utils/api";
import { useAccount } from "wagmi";
import { dotAccountAtom, isConnectedDotAtom } from "@store/accountAtoms";
import { Mangata } from "@mangata-finance/sdk";
import { ethers } from "ethers";
import { fetchTokenPricesMangata } from "@utils/fetch-prices";
import {
  chains,
  lpAbi,
  curveChefAbi,
  zenlinkChefAbi,
  solarbeamChefAbi,
  stellaswapChefAbi,
  stellaswapV1ChefAbi,
} from "./evmUtils";
import { evmPosLoadingAtom, subPosLoadingAtom } from "@store/commonAtoms";
import getTimestamp from "@utils/getTimestamp";
import AddLiquidityModal from "@components/Library/AddLiquidityModal";
import RemoveLiquidityModal from "@components/Library/RemoveLiquidityModal";
import StakingModal from "@components/Library/StakingModal";
import UnstakingModal from "@components/Library/UnstakingModal";
import { useConnection } from "@hooks/useConnection";
import { useRouter } from "next/router";
import ClaimRewardsModal from "@components/Library/ClaimRewardsModal";

interface Props {
  children: ReactNode;
}

const Layout: FC<Props> = ({ children }) => {
  const isOnline = useConnection();
  const router = useRouter();

  useEffect(() => {
    if (!isOnline) {
      router.push("/500");
    }
  }, [isOnline]);

  // States
  const [positions, setPositions] = useAtom(positionsAtom);
  const [lpTokenPricesMap, setLpTokenPricesMap] = useState<{
    [key: string]: number;
  }>({});
  const [tokenPricesMap, setTokenPricesMap] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    console.log("---- Updated Positions ----\n", positions);
  }, [positions]);

  const { isConnected, address, connector } = useAccount();
  const [isConnectedDot] = useAtom(isConnectedDotAtom);

  const [account] = useAtom(dotAccountAtom);

  const [, setIsEvmPosLoading] = useAtom(evmPosLoadingAtom);
  const [, setIsSubPosLoading] = useAtom(subPosLoadingAtom);

  // Accounts for testing
  // const address = "0xf3616d8cc52c67e7f0991a0a3c6db9f5025fa60c"; // Nightwing's Address
  // const account = {
  //   address: "5D2d7gtBrGXw8BmcwenaiDWWEnvwVRm5MUx7FMcR8C88QgGw",
  // };

  // Fetching all farms
  const { isLoading, data: farmsList } = useQuery({
    queryKey: ["farmsList"],
    queryFn: async () => {
      try {
        const { farms } = await fetchListicleFarms();
        return farms;
      } catch (error) {
        console.error(error);
      }
    },
  });
  const farms: FarmType[] = isLoading ? new Array<FarmType>() : farmsList!;

  // Fetching Lp token prices
  const { isLoading: isLpPricesLoading, data: lpTokenPrices } = useQuery({
    queryKey: ["lpTokenPrices"],
    queryFn: async () => {
      try {
        const { lpTokenPrices } = await fetchLpTokenPrices();
        return lpTokenPrices;
      } catch (error) {
        console.error("Error while fetching Lp Token prices", error);
      }
    },
  });
  useEffect(() => {
    if (isLpPricesLoading) {
      console.log("loading lp prices...");
    } else {
      // console.log("LP token prices", lpTokenPrices);
      const tempLpTokenPrices: { [key: string]: number } = {};
      // console.log("lp token prices", lpTokenPrices);
      lpTokenPrices?.forEach((lptp: TokenPriceType) => {
        tempLpTokenPrices[
          `${lptp.chain}-${lptp.protocol}-${lptp.symbol}-${lptp.address}` // key
        ] = lptp.price; // assigning lp token price to the key
      });
      console.log("lpTokenPricesMap", tempLpTokenPrices);
      setLpTokenPricesMap(tempLpTokenPrices);
    }
  }, [isLpPricesLoading]);

  // Fetching token prices
  const { isLoading: isTPricesLoading, data: tokenPrices } = useQuery({
    queryKey: ["tokenPrices"],
    queryFn: async () => {
      try {
        const { tokenPrices } = await fetchTokenPrices();
        return tokenPrices;
      } catch (error) {
        console.error("Error while fetching token prices", error);
      }
    },
  });
  useEffect(() => {
    if (isTPricesLoading) {
      console.log("loading token prices...");
    } else {
      // Setting Token prices data
      // console.log("token prices", tokenPrices);
      // Mapped token prices in a variable
      const tokenPricesMap: any = {};
      tokenPrices?.forEach((tp: any) => {
        tokenPricesMap[
          `${tp.chain}-${tp.protocol}-${tp.symbol}-${tp.address}` // key
        ] = tp.price; // assigning token price to the key
      });
      console.log("tokenPricesMap", tokenPricesMap);
      setTokenPricesMap(tokenPricesMap);
    }
  }, [isTPricesLoading]);

  /**
   * Substrate Chains Setup
   * Chains -- Mangata Kusama
   * Protocols -- Mangata X
   */
  const fetchSubstratePositions = async () => {
    emptySubstratePositions();
    console.log("substrate setup initialised");
    setIsSubPosLoading(true);
    // Filter Mangata X Farms
    const filteredFarms = farms.filter((f: any) => {
      return (
        f.protocol == "Mangata X" &&
        f.chain == "Mangata Kusama" &&
        f.chef == "xyk"
      );
    });

    const mangata = Mangata.getInstance([
      process.env.NEXT_PUBLIC_MANGATA_KUSAMA_URL!,
    ]);
    // const mangataApi = await mangata.getApi();

    // const unsubscribe = await mangataApi.rpc.chain.subscribeNewHeads(
    // async (header: any) => {
    // console.log(`Chain is at block: #${header.number}`);

    let assetsInfo = await mangata.getAssetsInfo();
    console.log("assetsInfo", assetsInfo);
    let mangataAsset: any = {};
    const balances = await mangata.getBalances();
    for (const key in balances) {
      if (Object.hasOwnProperty.call(balances, key)) {
        const element = balances[key];
        if (assetsInfo[key] !== undefined) {
          const e = // todo: try parseBigInt here instead of parseFloat
            parseFloat(BigInt(element.toString()).toString(10)) /
            10 ** assetsInfo[key]["decimals"];
          mangataAsset[key] = e;
          // console.log("mgeee", e);
        }
      }
    }

    const promises = filteredFarms.map(
      async (
        ff: {
          chain: string;
          protocol: string;
          chef: string;
          id: any;
          asset: { symbol: string };
          tvl: number;
        },
        index
      ) => {
        // users balance
        const bal: any = await mangata.getTokenBalance(
          ff.id, // token id
          account?.address as string // user's address
        );
        const freeBal = BigInt(bal.free).toString(10);
        10 ** assetsInfo[`${ff.id}`]["decimals"];
        const reservedBal =
          parseFloat(BigInt(bal.reserved).toString(10)) /
          10 ** assetsInfo[`${ff.id}`]["decimals"];

        const rewardsAmount = await mangata.calculateRewardsAmount(
          account?.address as string,
          ff.id
        );
        const tokenPrices = await fetchTokenPricesMangata();
        // console.log("MGX price", tokenPrices.get("mgx"));

        console.log(
          "Reward Amount ---",
          Number(rewardsAmount.toString()) / 10 ** 18,
          (tokenPrices.get("mgx")! * Number(rewardsAmount.toString())) /
            10 ** 18
        );

        // Position key
        const name = `${ff.chain}-${ff.protocol}-${ff.chef}-${ff.id}-${ff.asset.symbol}`;

        if (parseFloat(freeBal) > 0 || reservedBal > 0) {
          const tempPositions = { ...positions };
          tempPositions[name] = {
            unstaked: {
              amount: parseFloat(freeBal),
              amountUSD: (parseFloat(freeBal) * ff.tvl) / mangataAsset[ff.id],
            },
            staked: {
              amount: reservedBal,
              amountUSD: (reservedBal * ff.tvl) / mangataAsset[ff.id],
            },
            unclaimedRewards: [
              {
                token: "MGX",
                amount: Number(rewardsAmount.toString()) / 10 ** 18,
                amountUSD:
                  (tokenPrices.get("mgx")! * Number(rewardsAmount.toString())) /
                  10 ** 18,
              },
            ],
          };
          console.log(`positions now ---\n`, tempPositions);
          setPositions((prevState: any) => ({
            ...prevState,
            ...tempPositions,
          }));
        }
      }
    );

    // await to check if all promises are resolved
    await Promise.allSettled(promises);
    setIsSubPosLoading(false);
    // }
    // );
  };

  // method to empty substrate positions when wallet disconnected
  const emptySubstratePositions = () => {
    let positionKeysToRemove = new Array<string>();
    farms.forEach((ff) => {
      if (
        ff.protocol == "Mangata X" &&
        ff.chain == "Mangata Kusama" &&
        ff.chef == "xyk"
      ) {
        const name = `${ff.chain}-${ff.protocol}-${ff.chef}-${ff.id}-${ff.asset.symbol}`;
        if (positions[name] !== undefined) {
          positionKeysToRemove.push(name);
        }
      }
    });
    const tempPositions = Object.fromEntries(
      Object.entries(positions).filter(
        ([key]) => !positionKeysToRemove.includes(key)
      )
    );
    setPositions(tempPositions);
  };

  /**
   * EVM Chains Setup
   * Chains -- Moonriver, Moonbeam, Astar
   * Protocols -- Curve, Zenlink, Solarbeam, Stellaswap
   */
  const fetchEvmPositions = async () => {
    emptyEvmPositions();
    // Fetching EVM positions...
    setIsEvmPosLoading(true);
    let allPromises = new Array<Promise<void>>();

    chains.forEach((chain) => {
      const provider = ethers.getDefaultProvider(chain.url!);
      chain.protocols.forEach((protocol) => {
        const filteredFarms = farms.filter((f: FarmType) => {
          return (
            f.protocol == protocol.name &&
            f.chain == chain.name &&
            f.chef == protocol.chef
          );
        });
        console.log(
          "protocol:",
          protocol.name,
          "\nchain:",
          chain.name,
          "\nchef:",
          protocol.chef
        );

        console.log("process start...");
        if (protocol.name == "stellaswap") {
          let chef = new ethers.Contract(
            protocol.chef,
            stellaswapChefAbi,
            provider
          );
          if (protocol.chef == "0xEDFB330F5FA216C9D2039B99C8cE9dA85Ea91c1E") {
            chef = new ethers.Contract(
              protocol.chef,
              stellaswapV1ChefAbi,
              provider
            );
          }
          // provider.on("block", async () => {
          const stella = filteredFarms.map(
            async (ff: {
              chain: string;
              protocol: string;
              chef: string;
              id: number;
              asset: { symbol: string; address: string };
            }) => {
              const poolInfo = await chef.poolInfo(ff.id);
              const userInfo = await chef.userInfo(ff.id, address); // EVM address
              console.log(
                "poolInfo0",
                Object.keys(poolInfo),
                Object.values(poolInfo)[0]
              );
              console.log("poolInfo", poolInfo);
              console.log("userInfo stella", userInfo);
              const stakedLpAmount =
                Number(Object.values(userInfo)[0] as number) / 10 ** 18;
              const rewardDebt = Object.values(userInfo)[1];
              const rewardLockedUp = Object.values(userInfo)[2];
              const nextHarvestUntilTimestamp = Object.values(userInfo)[3];
              const lp = new ethers.Contract(
                Object.values(poolInfo)[0] as string,
                lpAbi,
                provider
              );
              const unstakedLpAmount =
                Number(await lp.balanceOf(address)) / 10 ** 18;
              console.log(
                "stakedLpAmount",
                stakedLpAmount,
                "unstakedLpAmount",
                unstakedLpAmount
              );

              const name = `${chain.name}-${protocol.name}-${protocol.chef}-${ff.id}-${ff.asset.symbol}`;

              let pending: any;
              let ucrewAddrs: any;
              let ucrewSymbols: any;
              let ucrewDecimals: any;
              let ucrewAmounts: any;
              if (
                protocol.chef == "0xEDFB330F5FA216C9D2039B99C8cE9dA85Ea91c1E"
              ) {
                pending = await chef.pendingStella(ff.id, address);
                ucrewAddrs = ["0x0E358838ce72d5e61E0018a2ffaC4bEC5F4c88d2"];
                ucrewSymbols = ["STELLA"];
                ucrewDecimals = [18];
                ucrewAmounts = [pending];
              } else {
                pending = await chef.pendingTokens(ff.id, address);
                ucrewAddrs = Object.values(pending)[0];
                ucrewSymbols = Object.values(pending)[1];
                ucrewDecimals = Object.values(pending)[2];
                ucrewAmounts = Object.values(pending)[3];
              }

              console.log(
                "ucrewAddrs",
                ucrewAddrs,
                "ucrewSymbols",
                ucrewSymbols,
                "ucrewDecimals",
                ucrewDecimals,
                "ucrewAmounts",
                ucrewAmounts
              );

              let ucrews: any = [];
              for (let i = 0; i < ucrewAmounts.length; i++) {
                console.log(
                  "stellaucre",
                  ucrewSymbols[i],
                  ucrewAmounts[i],
                  tokenPricesMap[
                    `${chain.name}-${protocol.name}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
                  ]
                  // tokenPricesMap[
                  //   `${chain.name}-${protocol.name}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
                  // ]
                );
                ucrews.push({
                  token: ucrewSymbols[i],
                  amount:
                    Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i]),
                  amountUSD:
                    (Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i])) *
                    tokenPricesMap[
                      `${chain.name}-${protocol.name}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
                    ],
                });
              }

              console.log("ucrewsstellaswap", ucrews);

              if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
                console.log("before creating temp positions obejct:\n", {
                  unstakedAmount: unstakedLpAmount,
                  stakedLpAmount: stakedLpAmount,
                  lpTokenPricesMap: lpTokenPricesMap,
                  lpTokenPrice:
                    lpTokenPricesMap[
                      `${chain.name}-${protocol.name}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                  lpSymbol: ff.asset.symbol,
                  chain: chain.name,
                  protocol: protocol.name,
                });

                const tempPositions = { ...positions };
                tempPositions[name] = {
                  unstaked: {
                    amount: unstakedLpAmount,
                    amountUSD:
                      unstakedLpAmount *
                      lpTokenPricesMap[
                        `${chain.name}-${protocol.name}-${ff.asset.symbol}-${ff.asset.address}`
                      ],
                  },
                  staked: {
                    amount: stakedLpAmount,
                    amountUSD:
                      stakedLpAmount *
                      lpTokenPricesMap[
                        `${chain.name}-${protocol.name}-${ff.asset.symbol}-${ff.asset.address}`
                      ],
                  },
                  unclaimedRewards: ucrews,
                };
                setPositions((prevState: any) => ({
                  ...prevState,
                  ...tempPositions,
                }));
              }
              console.log(
                "afterstellaswappositions",
                positions,
                "key",
                `${chain.name}-${protocol.name}-${ff.asset.symbol}-${ff.asset.address}`
              );
            }
          );
          allPromises.push(...stella);
          // });
        } else if (protocol.name == "solarbeam") {
          const chef = new ethers.Contract(
            protocol.chef,
            solarbeamChefAbi,
            provider
          );
          // provider.on("block", async () => {
          const solar = filteredFarms.map(
            async (ff: {
              chain: any;
              protocol: any;
              chef: any;
              id: any;
              asset: { symbol: any; address: any };
            }) => {
              console.log(
                "solarbeamff",
                ff.chain,
                ff.protocol,
                ff.chef,
                ff.id,
                ff.asset.symbol
              );

              // const [lpToken, , , , , ,] = await chef.poolInfo(ff.id)
              const poolInfo = await chef.poolInfo(ff.id);
              const userInfo = await chef.userInfo(ff.id, address);
              console.log(
                "solarbeampoolInfo0",
                Object.keys(poolInfo),
                Object.values(poolInfo)[0]
              );
              console.log("solarbeampoolInfo", poolInfo);
              console.log("solarbeamuserInfo", userInfo);
              const stakedLpAmount =
                Number(Object.values(userInfo)[0] as number) / 10 ** 18;
              const rewardDebt = Object.values(userInfo)[1];
              const rewardLockedUp = Object.values(userInfo)[2];
              const nextHarvestUntilTimestamp = Object.values(userInfo)[3];
              const lp = new ethers.Contract(
                Object.values(poolInfo)[0] as string,
                lpAbi,
                provider
              );
              const unstakedLpAmount =
                Number(await lp.balanceOf(address)) / 10 ** 18;
              console.log(
                "solarbeamstakedLpAmount",
                stakedLpAmount,
                "solarbeamunstakedLpAmount",
                unstakedLpAmount
              );
              const name = `${chain.name}-${protocol.name}-${protocol.chef}-${ff.id}-${ff.asset.symbol}`;
              const pendingTokens = await chef.pendingTokens(ff.id, address);
              const ucrewAddrs: any = Object.values(pendingTokens)[0];
              const ucrewSymbols: any = Object.values(pendingTokens)[1];
              const ucrewDecimals: any = Object.values(pendingTokens)[2];
              const ucrewAmounts: any = Object.values(pendingTokens)[3];

              console.log(
                "ucrewAddrs",
                ucrewAddrs,
                "ucrewSymbols",
                ucrewSymbols,
                "ucrewDecimals",
                ucrewDecimals,
                "ucrewAmounts",
                ucrewAmounts
              );

              let ucrews: any = [];
              for (let i = 0; i < ucrewAmounts.length; i++) {
                console.log(
                  "tokenSymbol",
                  ucrewSymbols[i],
                  "\ntokenPrice",
                  tokenPricesMap[
                    `${chain.name}-${protocol.name}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
                  ]
                );
                ucrews.push({
                  token: ucrewSymbols[i],
                  amount:
                    Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i]),
                  amountUSD:
                    (Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i])) *
                    tokenPricesMap[
                      `${chain.name}-${protocol.name}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
                    ],
                });
              }

              console.log("ucrewssolarbeam", ucrews);

              if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
                const tempPositions = { ...positions };

                console.log("before creating temp positions obejct:\n", {
                  unstakedAmount: unstakedLpAmount,
                  stakedLpAmount: stakedLpAmount,
                  lpTokenPricesMap: lpTokenPricesMap,
                  lpTokenPrice:
                    lpTokenPricesMap[
                      `${chain.name}-${protocol.name}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                  lpSymbol: ff.asset.symbol,
                });

                tempPositions[name] = {
                  unstaked: {
                    amount: unstakedLpAmount,
                    amountUSD:
                      unstakedLpAmount *
                      lpTokenPricesMap[
                        `${chain.name}-${protocol.name}-${ff.asset.symbol}-${ff.asset.address}`
                      ],
                  },
                  staked: {
                    amount: stakedLpAmount,
                    amountUSD:
                      stakedLpAmount *
                      lpTokenPricesMap[
                        `${chain.name}-${protocol.name}-${ff.asset.symbol}-${ff.asset.address}`
                      ],
                  },
                  unclaimedRewards: ucrews,
                };
                setPositions((prevState: any) => ({
                  ...prevState,
                  ...tempPositions,
                }));
              }
              console.log("after solarbeam positions", positions);
            }
          );
          allPromises.push(...solar);
          // });
        } else if (protocol.name == "zenlink") {
          const chef = new ethers.Contract(
            protocol.chef,
            zenlinkChefAbi,
            provider
          );
          // provider.on("block", async () => {
          const zen = filteredFarms.map(
            async (ff: {
              chain: string;
              protocol: string;
              chef: string;
              id: any;
              asset: {
                symbol: string;
                address: string;
              };
            }) => {
              console.log(
                "ff",
                ff.chain,
                ff.protocol,
                ff.chef,
                ff.id,
                ff.asset.symbol
              );

              // const [lpToken, , , , , ,] = await chef.poolInfo(ff.id)
              const poolInfo = await chef.getPoolInfo(ff.id);
              const userInfo = await chef.getUserInfo(ff.id, address);
              console.log(
                "poolInfo0",
                Object.keys(poolInfo),
                Object.values(poolInfo)[0]
              );
              console.log("poolInfo", poolInfo);
              console.log("userInfo", userInfo);
              const stakedLpAmount =
                Number(Object.values(userInfo)[0] as number) / 10 ** 18;
              const rewardDebt = Object.values(userInfo)[1];
              const rewardLockedUp = Object.values(userInfo)[2];
              const nextHarvestUntilTimestamp = Object.values(userInfo)[3];
              const lp = new ethers.Contract(
                Object.values(poolInfo)[0] as string,
                lpAbi,
                provider
              );
              const unstakedLpAmount =
                Number(await lp.balanceOf(address)) / 10 ** 18;
              console.log(
                "stakedLpAmount",
                stakedLpAmount,
                "unstakedLpAmount",
                unstakedLpAmount
              );
              const name = `${chain.name}-${protocol.name}-${protocol.chef}-${ff.id}-${ff.asset.symbol}`;
              const rewardTokens: any = Object.values(poolInfo)[2];
              console.log("rewardTokens", rewardTokens);
              const pendingRewards = await chef.pendingRewards(ff.id, address);
              const rewards: any = Object.values(pendingRewards)[0];

              let ucrews: any = [];
              for (let i = 0; i < rewards.length; i++) {
                const tok = new ethers.Contract(
                  rewardTokens[i],
                  lpAbi,
                  provider
                );
                const sym = await tok.symbol();
                const dec = await tok.decimals();
                console.log(
                  "sym:",
                  sym,
                  "\ndec:",
                  dec,
                  "\ntoken price:",
                  tokenPricesMap[
                    `${chain.name}-${protocol.name}-${sym}-${rewardTokens[i]}`
                  ]
                );
                ucrews.push({
                  token: sym,
                  amount: Number(rewards[i]) / 10 ** Number(dec),
                  amountUSD:
                    (Number(rewards[i]) / 10 ** Number(dec)) *
                    tokenPricesMap[
                      `${chain.name}-${protocol.name}-${sym}-${rewardTokens[i]}`
                    ],
                });
              }

              console.log("ucrewszenlink", ucrews);

              let price =
                lpTokenPricesMap[
                  `${chain.name}-${protocol.name}-${ff.asset.symbol}-${ff.asset.address}`
                ] *
                10 ** 18;
              if (ff.asset.symbol == "ZLK") {
                //  tokenPricesMap[`${chain.name}-${protocol.name}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`]
                const ts = Object.keys(tokenPricesMap).map((t) =>
                  t.startsWith("moonbeam-zenlink-ZLK") ||
                  t.startsWith("moonriver-zenlink-ZLK") ||
                  t.startsWith("astar-zenlink-ZLK")
                    ? t
                    : ""
                );
                console.log("ttts", ts);
                const as = ts.filter((a) => a != "");
                console.log("aaas", as);
                if (as.length != 0) {
                  // tokenPricesMap[`${chain.name}-${protocol.name}-ZLK-${}`]
                  price = tokenPricesMap[as[0]];
                  console.log("priceee", price);
                }
              }

              if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
                console.log(
                  "unstaked and staked amount > 0 -- updating positions..."
                );
                console.log("before creating temp positions obejct:\n", {
                  unstakedAmount: unstakedLpAmount,
                  stakedLpAmount: stakedLpAmount,
                  lpTokenPricesMap: lpTokenPricesMap,
                  lpTokenPrice:
                    lpTokenPricesMap[
                      `${chain.name}-${protocol.name}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                  lpSymbol: ff.asset.symbol,
                });

                const tempPositions = { ...positions };
                tempPositions[name] = {
                  unstaked: {
                    amount: unstakedLpAmount,
                    amountUSD: unstakedLpAmount * price,
                  },
                  staked: {
                    amount: stakedLpAmount,
                    amountUSD: stakedLpAmount * price,
                  },
                  unclaimedRewards: ucrews,
                };
                console.log("added position", tempPositions[name]);
                setPositions((prevState: any) => ({
                  ...prevState,
                  ...tempPositions,
                }));
              }
              console.log("after zenlink positions", positions);
            }
          );
          allPromises.push(...zen);
          // });
        } else if (protocol.name == "curve") {
          const chef = new ethers.Contract(
            protocol.chef,
            curveChefAbi,
            provider
          );
          // provider.on("block", async () => {
          const cur = filteredFarms.map(
            async (ff: {
              chain: any;
              protocol: any;
              chef: any;
              id: any;
              asset: {
                symbol: any;
                address: any;
              };
            }) => {
              console.log(
                "ff",
                ff.chain,
                ff.protocol,
                ff.chef,
                ff.id,
                ff.asset.symbol
              );

              const reward_token = await chef.reward_tokens(0);
              console.log("reward_token0", reward_token);
              const claimable_reward = await chef.claimable_reward(
                address,
                reward_token
              );
              const stakedLpAmount =
                Number(await chef.balanceOf(address)) / 10 ** 18;
              const lp_token = await chef.lp_token();
              console.log("lp_token", lp_token);
              const lp = new ethers.Contract(lp_token, lpAbi, provider);
              const unstakedLpAmount =
                Number(await lp.balanceOf(address)) / 10 ** 18;
              console.log(
                "stakedLpAmount",
                stakedLpAmount,
                "unstakedLpAmount",
                unstakedLpAmount
              );
              const name = `${chain.name}-${protocol.name}-${protocol.chef}-${ff.id}-${ff.asset.symbol}`;
              const rewardCount: any = await chef.reward_count();
              let ucrews: any = [];
              for (let i = 0; i < rewardCount; i++) {
                const reward_token: any = await chef.reward_tokens(i);
                const claimable_reward: any = await chef.claimable_reward(
                  address,
                  reward_token
                );
                console.log(
                  `curvereward_token[${i}]: ${reward_token}, claimable_reward: ${claimable_reward}`
                );
                const tok = new ethers.Contract(reward_token, lpAbi, provider);
                const sym = await tok.symbol();
                const dec = await tok.decimals();
                console.log(
                  "sym",
                  sym,
                  "\ndec",
                  dec,
                  "\ntokenPrice",
                  tokenPricesMap[
                    `${chain.name}-stellaswap-${sym}-${reward_token}`
                  ],
                  "\nlpTokenPrice",
                  lpTokenPricesMap[
                    `${chain.name}-${protocol.name}-${ff.asset.symbol}-${ff.asset.address}`
                  ], // todo: should be reward token symbol
                  "\nsymbol",
                  ff.asset.symbol,
                  "\nreward token",
                  reward_token
                );

                // ucrewscurve positions
                ucrews.push({
                  token: sym,
                  amount: Number(claimable_reward) / 10 ** Number(dec),
                  amountUSD:
                    (Number(claimable_reward) / 10 ** Number(dec)) *
                    tokenPricesMap[
                      `${chain.name}-stellaswap-${sym}-${reward_token}`
                    ],
                });
              }

              // console.log("ucrewscurve", ucrews);

              if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
                const tempPositions = { ...positions };

                console.log("before creating temp positions object:\n", {
                  unstakedAmount: unstakedLpAmount,
                  stakedLpAmount: stakedLpAmount,
                  lpTokenPricesMap: lpTokenPricesMap,
                  lpTokenPrice:
                    lpTokenPricesMap[
                      `${chain.name}-${protocol.name}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                  lpSymbol: ff.asset.symbol,
                });

                tempPositions[name] = {
                  unstaked: {
                    amount: unstakedLpAmount,
                    amountUSD:
                      unstakedLpAmount *
                      lpTokenPricesMap[
                        `${chain.name}-${protocol.name}-${ff.asset.symbol}-${ff.asset.address}`
                      ],
                    // lpTokenPricesMap[
                    //   `${chain.name}-${protocol.name}-${ff.asset.symbol}-${ff.asset.address}`
                    // ],
                  },
                  staked: {
                    amount: stakedLpAmount,
                    amountUSD:
                      stakedLpAmount *
                      lpTokenPricesMap[
                        `${chain.name}-${protocol.name}-${ff.asset.symbol}-${ff.asset.address}`
                      ],
                  },
                  unclaimedRewards: ucrews,
                };
                setPositions((prevState: any) => ({
                  ...prevState,
                  ...tempPositions,
                }));
              }
              console.log("after curve positions", positions);
            }
          );
          allPromises.push(...cur);
          // });
        }
      });
    });

    await Promise.allSettled(allPromises);
    setIsEvmPosLoading(false);
    console.log("positionsnow", positions);
  };

  // method to empty evm positions when wallet disconnected
  const emptyEvmPositions = () => {
    let positionKeysToRemove = new Array<string>();
    chains.forEach((chain) => {
      chain.protocols.forEach((protocol) => {
        farms.forEach((f) => {
          if (
            f.protocol == protocol.name &&
            f.chain == chain.name &&
            f.chef == protocol.chef
          ) {
            const name = `${chain.name}-${protocol.name}-${protocol.chef}-${f.id}-${f.asset.symbol}`;
            if (positions[name] !== undefined) {
              positionKeysToRemove.push(name);
            }
          }
        });
      });
    });
    const tempPositions = Object.fromEntries(
      Object.entries(positions).filter(
        ([key]) => !positionKeysToRemove.includes(key)
      )
    );
    setPositions(tempPositions);
  };

  // Side-effect for Substrate Chains
  useEffect(() => {
    async function walletEvent() {
      try {
        const connectWalletEvent = await createWalletConnectEvent(
          account?.address!,
          "DOT",
          account?.wallet?.extensionName!,
          getTimestamp()
        );
        console.log("connectWalletEvent: DOT", connectWalletEvent);
      } catch (error) {
        console.log("Error: CreateWalletEvent DOT", error);
      }
    }

    if (isConnectedDot && farms.length > 0) {
      walletEvent();
      console.log("running mangata setup");
      fetchSubstratePositions();
    } else if (!isConnectedDot && farms.length > 0) {
      console.log("emptying mangata positions");
      emptySubstratePositions();
    }
  }, [isConnectedDot, farms, account]);

  // Side-effect for EVM Chains
  useEffect(() => {
    const lpTokensPricesLength = Object.keys(lpTokenPricesMap).length;
    const tokenPricesLength = Object.keys(tokenPricesMap).length;

    async function walletEvent() {
      try {
        const connectWalletEvent = await createWalletConnectEvent(
          address!,
          "EVM",
          connector?.name!,
          getTimestamp()
        );
        console.log("connectWalletEvent: EVM", connectWalletEvent);
      } catch (error) {
        console.log("Error: CreateWalletEvent EVM", error);
      }
    }

    if (
      isConnected &&
      farms.length > 0 &&
      lpTokensPricesLength > 0 &&
      tokenPricesLength > 0
    ) {
      walletEvent();
      fetchEvmPositions(); // Run setup when wallet connected
    } else if (
      !isConnected &&
      farms.length > 0 &&
      lpTokensPricesLength > 0 &&
      tokenPricesLength > 0
    ) {
      emptyEvmPositions();
    }
  }, [isConnected, farms, address, lpTokenPricesMap, tokenPricesMap]);

  return (
    <div
      className={clsx(
        "relative flex flex-col min-h-screen font-inter bg-main-gradient text-white overflow-hidden",
        satoshiFont.variable
      )}
    >
      <div className="hidden md:block absolute -left-2 top-16 bg-main-flare blur-[22.5px] w-[1853px] h-[295px] transform rotate-[-156deg]" />
      <AddLiquidityModal />
      <RemoveLiquidityModal />
      <StakingModal />
      <UnstakingModal />
      <ClaimRewardsModal />
      <Header />
      {children}
      <Footer />
    </div>
  );
};

export default Layout;
