// React and Next Imports
import { useEffect, useState } from "react";
import { useRouter, NextRouter } from "next/router";
import { NextPage } from "next";
import { Mangata } from "@mangata-finance/sdk";
import { ethers } from "ethers";

// Library Imports
import { useAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";

// Misc Imports
import { fetchTokenPricesMangata } from "@utils/fetch-prices";
import AllProtocolsModal from "@components/Library/AllProtocolsModal";
import MobileFarmList from "./MobileFarmList";
import ScrollToTopBtn from "@components/Library/ScrollToTopBtn";
import useFilteredFarmTypes from "@hooks/useFilteredFarmTypes";
import useScreenSize from "@hooks/useScreenSize";
import { trackPageView } from "@utils/analytics";
import {
  fetchListicleFarms,
  fetchLpTokenPrices,
  fetchTokenPrices,
} from "@utils/api";
import { protocolList } from "@utils/statsMethods";
import { filterFarmTypeAtom } from "@store/atoms";
import ListicleTable from "./ListicleTable";
import useFilteredFarms from "@hooks/useFilteredFarms";
import MetaTags from "@components/metaTags/MetaTags";
import Hero from "./Hero";
import { FarmType, TokenPriceType } from "@utils/types";
import { dotAccountAtom } from "@store/accountAtoms";
import { useAccount } from "wagmi";
import { formatTokenSymbols, getLpTokenSymbol } from "@utils/farmListMethods";

const Home: NextPage = () => {
  const router = useRouter();
  // const { isConnected, address } = useAccount();
  const { isConnected } = useAccount();
  const address = "0xf3616d8cc52c67e7f0991a0a3c6db9f5025fa60c"; // Nightwing's Address

  // Store
  const [filterFarmType] = useAtom(filterFarmTypeAtom);
  // const [account] = useAtom(dotAccountAtom);
  // Proxy Account
  const account = {
    address: "5D2d7gtBrGXw8BmcwenaiDWWEnvwVRm5MUx7FMcR8C88QgGw",
  };

  // States
  const [searchTerm, setSearchTerm] = useState("");
  const [prefModalOpen, setPrefModalOpen] = useState(false);
  const [protocolModalOpen, setProtocolModalOpen] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const [positions, setPositions] = useState<any>({});
  const [lpTokenPricesMap, setLpTokenPricesMap] = useState<{
    [key: string]: number;
  }>({});
  const [tokenPricesMap, setTokenPricesMap] = useState<{
    [key: string]: number;
  }>({});

  useEffect(() => {
    console.log("-- positions updated --\n", positions);
  }, [positions]);

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
      console.log("lp token prices", lpTokenPrices);
      lpTokenPrices?.forEach((lptp: TokenPriceType) => {
        const tokenSymbol = getLpTokenSymbol(lptp.symbol);
        tempLpTokenPrices[
          `${lptp.chain}-${lptp.protocol}-${lptp.symbol}-${lptp.address}`
        ] = lptp.price;
        // `${lptp.chain}-${lptp.protocol}-${lptp.symbol}-${lptp.address}`p
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
      console.log("token prices", tokenPrices);
      // Mapped token prices in a variable
      const tokenPricesMap: any = {};
      tokenPrices?.forEach((tp: any) => {
        tokenPricesMap[
          `${tp.chain}-${tp.protocol}-${tp.symbol}-${tp.address}`
        ] = tp.price;
      });
      console.log("tokenPricesMap", tokenPricesMap);
      setTokenPricesMap(tokenPricesMap);
    }
  }, [isTPricesLoading]);

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
  const farms: FarmType[] = isLoading ? new Array<FarmType>() : farmsList;

  // Mangata SDK Setup
  useEffect(() => {
    const mangataSetup = async () => {
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
      const mangataApi = await mangata.getApi();

      const unsubscribe = await mangataApi.rpc.chain.subscribeNewHeads(
        async (header: any) => {
          console.log(`Chain is at block: #${header.number}`);

          let assetsInfo = await mangata.getAssetsInfo();
          // console.log("assetsInfo", assetsInfo);
          let mangataAsset: any = {};
          const balances = await mangata.getBalances();
          for (const key in balances) {
            if (Object.hasOwnProperty.call(balances, key)) {
              const element = balances[key];
              if (assetsInfo[key] !== undefined) {
                // console.log(
                //   "----------\nkey:",
                //   key,
                //   "symbol",
                //   assetsInfo[key]["symbol"],
                //   "balhex:",
                //   element
                // );
                const e =
                  BigInt(element).toString(10) /
                  10 ** assetsInfo[key]["decimals"];
                // console.log("bal:", e, "\n----------");
                mangataAsset[key] = e;
              }
            }
          }

          filteredFarms.forEach(
            async (ff: {
              chain: string;
              protocol: string;
              chef: string;
              id: any;
              asset: { symbol: string };
              tvl: number;
            }) => {
              console.log("filtered farm:\n", {
                chain: ff.chain,
                protocol: ff.protocol,
                chef: ff.chef,
                id: ff.id,
                asset: ff.asset.symbol,
                tvl: ff.tvl,
              });

              // users balancd
              const bal: any = await mangata.getTokenBalance(
                ff.id, // token id
                account?.address as string // user's address
              );
              const freeBal = BigInt(bal.free).toString(10);
              10 ** assetsInfo[`${ff.id}`]["decimals"];
              const reservedBal =
                BigInt(bal.reserved).toString(10) /
                10 ** assetsInfo[`${ff.id}`]["decimals"];

              // console.log(
              //   "balance",
              //   bal,
              //   "free bal",
              //   freeBal,
              //   (freeBal * ff.tvl) / mangataAsset[ff.id],
              //   "reserved",
              //   reservedBal,
              //   (reservedBal * ff.tvl) / mangataAsset[ff.id]
              // );

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

              const name = `${ff.chain}-${ff.protocol}-${ff.chef}-${ff.id}-${ff.asset.symbol}`;

              const tempPositions = { ...positions };
              tempPositions[name] = {
                unstaked: {
                  amount: freeBal,
                  amountUSD: (freeBal * ff.tvl) / mangataAsset[ff.id],
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
                      (tokenPrices.get("mgx")! *
                        Number(rewardsAmount.toString())) /
                      10 ** 18,
                  },
                ],
              };
              console.log(`positions now ---\n`, tempPositions);
              setPositions((prevState: any) => ({
                ...prevState,
                ...tempPositions,
              }));
              // setPositions(tempPositions);
            }
          );
          console.log("--- After filter farms ---\n");
        }
      );
    };
    if (account !== null && farms.length > 0) {
      // Run setup when wallet connected
      mangataSetup();
    }
  }, [account, farms]);

  // Polkadot EVM Chains Setup

  // Chains -- Moonriver, Moonbeam, Astar

  useEffect(() => {
    const asycFn = async () => {
      // todo: can be exported from utils
      const chains = [
        {
          name: "moonriver",
          url: process.env.NEXT_PUBLIC_MOONRIVER_URL,
          protocols: [
            {
              name: "zenlink",
              chef: "0xf4Ec122d32F2117674Ce127b72c40506c52A72F8",
            },
            {
              name: "solarbeam",
              chef: "0x0329867a8c457e9F75e25b0685011291CD30904F",
            },
          ],
        },
        {
          name: "moonbeam",
          url: process.env.NEXT_PUBLIC_MOONBEAM_URL,
          protocols: [
            {
              name: "curve",
              chef: "0xC106C836771B0B4f4a0612Bd68163Ca93be1D340",
            },
            {
              name: "curve",
              chef: "0x4efb9942e50aB8bBA4953F71d8Bebd7B2dcdE657",
            },
            {
              name: "zenlink",
              chef: "0xD6708344553cd975189cf45AAe2AB3cd749661f4",
            },
            {
              name: "stellaswap", // v1
              chef: "0xEDFB330F5FA216C9D2039B99C8cE9dA85Ea91c1E",
            },
            {
              name: "stellaswap", // v2
              chef: "0xF3a5454496E26ac57da879bf3285Fa85DEBF0388",
            },
          ],
        },
        {
          name: "astar",
          url: process.env.NEXT_PUBLIC_ASTAR_URL,
          protocols: [
            {
              name: "zenlink",
              chef: "0x460ee9DBc82B2Be84ADE50629dDB09f6A1746545",
            },
          ],
        },
      ];

      // ABIs
      const solarbeamChefAbi = [
        "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTimestamp, uint256 accSolarPerShare, uint16 depositFeeBP, uint256 harvestInterval, uint256 totalLp)",
        // "struct UserInfo { uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil }",
        "function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil)",
        "function pendingTokens(uint256, address) view returns (address[] addresses, string[] symbols, uint256[] decimals, uint256[] amounts)",
      ];
      const stellaswapChefAbi = [
        "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTimestamp, uint256 accStellaPerShare, uint16 depositFeeBP, uint256 harvestInterval, uint256 totalLp)",
        // "struct UserInfo { uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil }",
        "function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil)",
        "function pendingTokens(uint256, address) view returns (address[] addresses, string[] symbols, uint256[] decimals, uint256[] amounts)",
      ];
      const stellaswapV1ChefAbi = [
        "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accStellaPerShare, uint16 depositFeeBP, uint256 harvestInterval, uint256 totalLp)",
        "function userInfo(uint256, address) view returns (uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil)",
        "function pendingStella(uint256, address) view returns (uint256 amount)",
      ];
      const zenlinkChefAbi = [
        "function getPoolInfo(uint256) view returns (address farmingToken, uint256 amount, address[] rewardTokens, uint256[] rewardPerBlock, uint256[] accRewardPerShare, uint256 lastRewardBlock, uint256 startBlock, uint16 depositFeeBP, uint256 claimableInterval)",
        // "struct UserInfo { uint256 amount, uint256 rewardDebt, uint256 rewardLockedUp, uint256 nextHarvestUntil }",
        "function getUserInfo(uint256, address) view returns (uint256 amount, uint256[] pending, uint256[] rewardDebt, uint256 nextClaimableBlock)",
        "function pendingRewards(uint256, address) view returns (uint256[] rewards, uint256 nextClaimableBlock)",
      ];
      const curveChefAbi = [
        "function claimable_reward(address, address) view returns (uint256)",
        "function reward_count() view returns (uint256)",
        "function reward_tokens(uint256) view returns (address)",
        "function balanceOf(address) view returns (uint256)",
        "function lp_token() view returns (address)",
      ];
      const lpAbi = [
        "function balanceOf(address) view returns (uint256)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
      ];

      // console.log("farms", farms, " =>", farms.length);
      chains.forEach((chain) => {
        const provider = ethers.getDefaultProvider(chain.url!);
        chain.protocols.forEach((protocol) => {
          // [...new Set(array)]
          const filteredFarms = farms.filter((f: any) => {
            return (
              f.protocol == protocol.name &&
              f.chain == chain.name &&
              f.chef == protocol.chef
            );
          });
          console.log("filteredFarms", filteredFarms, filteredFarms.length);
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
            provider.on("block", async () => {
              filteredFarms.forEach(
                async (ff: {
                  chain: any;
                  protocol: any;
                  chef: any;
                  id: any;
                  asset: { symbol: any; address: any };
                }) => {
                  const tokenSymbol = getLpTokenSymbol(ff.asset.symbol);
                  console.log("tokenSymbol", tokenSymbol);
                  // console.log(
                  //   "ff",
                  //   ff.chain,
                  //   ff.protocol,
                  //   ff.chef,
                  //   ff.id,
                  //   ff.asset.symbol
                  // );
                  // const [lpToken, , , , , ,] = await chef.poolInfo(ff.id)
                  const poolInfo = await chef.poolInfo(ff.id);
                  const userInfo = await chef.userInfo(ff.id, address); // EVM address
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
                    Object.values(poolInfo)[0],
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

                  // const name = tokenSymbol;
                  const name = `${chain.name}-${protocol.name}-${protocol.chef}-${ff.id}-${ff.asset.symbol}`;

                  // const pendingTokens = await chef.pendingTokens(
                  //   ff.id,
                  //   address
                  // );
                  // const ucrewAddrs: any = Object.values(pendingTokens)[0];
                  // const ucrewSymbols: any = Object.values(pendingTokens)[1];
                  // const ucrewDecimals: any = Object.values(pendingTokens)[2];
                  // const ucrewAmounts: any = Object.values(pendingTokens)[3];
                  let pending: any;
                  let ucrewAddrs: any;
                  let ucrewSymbols: any;
                  let ucrewDecimals: any;
                  let ucrewAmounts: any;
                  if (
                    protocol.chef ==
                    "0xEDFB330F5FA216C9D2039B99C8cE9dA85Ea91c1E"
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
                      ucrewSymbols[i],
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
                        Number(ucrewAmounts[i]) /
                        10 ** Number(ucrewDecimals[i]),
                      amountUSD:
                        Number(ucrewAmounts[i]) /
                        10 ** Number(ucrewDecimals[i]), // * tokenPricesMap[`${chain.name}-${protocol.name}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`]
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
                      lpSymbol: tokenSymbol,
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
                    // setPositions(tempPositions);
                    setPositions((prevState: any) => ({
                      ...prevState,
                      ...tempPositions,
                    }));
                  }
                  console.log(
                    "afterstellaswappositions",
                    positions,
                    "keyy",
                    tokenSymbol
                  );
                }
              );
            });
          } else if (protocol.name == "solarbeam") {
            const chef = new ethers.Contract(
              protocol.chef,
              solarbeamChefAbi,
              provider
            );
            provider.on("block", async () => {
              filteredFarms.forEach(
                async (ff: {
                  chain: any;
                  protocol: any;
                  chef: any;
                  id: any;
                  asset: { symbol: any; address: any };
                }) => {
                  // const tokenNames = formatTokenSymbols(ff.asset.symbol);
                  // const tokenSymbol =
                  //   tokenNames.length == 2
                  //     ? `${tokenNames[0]}-${tokenNames[1]}`
                  //     : tokenNames[0];
                  const tokenSymbol = getLpTokenSymbol(ff.asset.symbol);

                  console.log(
                    "ff",
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
                    Object.values(poolInfo)[0],
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
                  // const name = tokenSymbol;
                  const name = `${chain.name}-${protocol.name}-${protocol.chef}-${ff.id}-${ff.asset.symbol}`;
                  const pendingTokens = await chef.pendingTokens(
                    ff.id,
                    address
                  );
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
                        Number(ucrewAmounts[i]) /
                        10 ** Number(ucrewDecimals[i]),
                      amountUSD:
                        Number(ucrewAmounts[i]) /
                        10 ** Number(ucrewDecimals[i]), // * tokenPricesMap[`${chain.name}-${protocol.name}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`]
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
                      lpSymbol: tokenSymbol,
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
                    // setPositions(tempPositions);
                    setPositions((prevState: any) => ({
                      ...prevState,
                      ...tempPositions,
                    }));
                  }
                  console.log("after solarbeam positions", positions);
                }
              );
            });
          } else if (protocol.name == "zenlink") {
            const chef = new ethers.Contract(
              protocol.chef,
              zenlinkChefAbi,
              provider
            );
            provider.on("block", async () => {
              filteredFarms.forEach(
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
                  // const tokenNames = formatTokenSymbols(ff.asset.symbol);
                  // const tokenSymbol =
                  //   tokenNames.length == 2
                  //     ? `${tokenNames[0]}-${tokenNames[1]}`
                  //     : tokenNames[0];
                  const tokenSymbol = getLpTokenSymbol(ff.asset.symbol);

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
                    Object.values(poolInfo)[0],
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
                  // const name = tokenSymbol;
                  const name = `${chain.name}-${protocol.name}-${protocol.chef}-${ff.id}-${ff.asset.symbol}`;
                  const rewardTokens: any = Object.values(poolInfo)[2];
                  console.log("rewardTokens", rewardTokens);
                  const pendingRewards = await chef.pendingRewards(
                    ff.id,
                    address
                  );
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
                      amountUSD: Number(rewards[i]) / 10 ** Number(dec), // * tokenPricesMap[`${chain.name}-${protocol.name}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`]
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
                      lpSymbol: tokenSymbol,
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
                    // setPositions(tempPositions);
                    setPositions((prevState: any) => ({
                      ...prevState,
                      ...tempPositions,
                    }));
                  }
                  console.log("after zenlink positions", positions);
                }
              );
            });
          } else if (protocol.name == "curve") {
            const chef = new ethers.Contract(
              protocol.chef,
              curveChefAbi,
              provider
            );
            provider.on("block", async () => {
              filteredFarms.forEach(
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
                  // const tokenNames = formatTokenSymbols(ff.asset.symbol);
                  // const tokenSymbol =
                  //   tokenNames.length == 2
                  //     ? `${tokenNames[0]}-${tokenNames[1]}`
                  //     : tokenNames[0];
                  const tokenSymbol = getLpTokenSymbol(ff.asset.symbol);
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
                  // const name = tokenSymbol;
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
                      `reward_token[${i}]: ${reward_token}, claimable_reward: ${claimable_reward}`
                    );
                    const tok = new ethers.Contract(
                      reward_token,
                      lpAbi,
                      provider
                    );
                    const sym = await tok.symbol();
                    const dec = await tok.decimals();
                    console.log(
                      "sym",
                      sym,
                      "\ndec",
                      dec,
                      "\ntokenPrice",
                      tokenPricesMap[
                        `${chain.name}-${protocol.name}-${sym}-${reward_token}`
                      ],
                      "\nlpTokenPrice",
                      lpTokenPricesMap[
                        `${chain.name}-${protocol.name}-${ff.asset.symbol}-${ff.asset.address}`
                      ], // todo: should be reward token symbol
                      "\nsymbol",
                      tokenSymbol,
                      "\nreward token",
                      reward_token
                    );

                    // ucrewscurve positions
                    ucrews.push({
                      token: sym,
                      amount: Number(claimable_reward) / 10 ** Number(dec),
                      amountUSD: Number(claimable_reward) / 10 ** Number(dec), // * tokenPricesMap[`${chain.name}-${protocol.name}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`]
                    });
                  }

                  // console.log("ucrewscurve", ucrews);

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
                      lpSymbol: tokenSymbol,
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
                        // lpTokenPricesMap[
                        //   `${chain.name}-${protocol.name}-${ff.asset.symbol}-${ff.asset.address}`
                        // ],
                      },
                      unclaimedRewards: ucrews,
                    };
                    // setPositions(tempPositions);
                    setPositions((prevState: any) => ({
                      ...prevState,
                      ...tempPositions,
                    }));
                  }
                  console.log("after curve positions", positions);
                }
              );
            });
          }
        });
      });
      console.log("positionsnow", positions);
    };
    if (isConnected && farms.length > 0) {
      console.log("lp token prices inside condition", lpTokenPricesMap);
      asycFn(); // Run setup when wallet connected
    }
  }, [isConnected, farms]);

  // Filtering farms based on FarmType and then search term
  const filteredByFarmTypes = useFilteredFarmTypes(farms, filterFarmType);
  const [filteredFarms, noFilteredFarms] = useFilteredFarms(
    filteredByFarmTypes,
    searchTerm
  );
  const screenSize = useScreenSize();

  useEffect(() => {
    if (farms.length == 0) return;
    setSearchTerm(router.query.q ? (router.query.q as string) : "");
  }, [farms]);

  // state handler for visibility of scroll-to-top button
  useEffect(() => {
    if (typeof window !== undefined) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
          setShowScrollBtn(true);
        } else {
          setShowScrollBtn(false);
        }
      });
    }

    return () => {
      window.removeEventListener("scroll", () => {});
    };
  }, []);

  useEffect(() => {
    trackPageView();
  }, []);

  useEffect(() => {
    if (router.query.id) {
      router.push(
        `${
          typeof window !== "undefined"
            ? `http://${window.location.host}` // for testing locally
            : "https://list.yieldbay.io"
        }/farm/${router.query.id}?addr=${router.query.farm}`
      );
    }
  }, [router]);

  return (
    <div>
      <MetaTags />
      <main>
        {/* THIS IS MAIN CONTAINER -- THIS WILL CONTAIN HERO AND TABLE SECTIONS */}
        <div className="relative flex flex-col flex-1">
          {/* HERO SECTION */}
          <Hero
            setProtocolModalOpen={setProtocolModalOpen}
            farms={farms}
            setPrefModalOpen={setPrefModalOpen}
            filteredFarms={filteredFarms}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          {/* Rendering Farms here */}
          {screenSize === "xs" ? (
            // MOBILE VIEW
            <div className="sm:hidden bg-[#01050D]">
              {/* Shows Shared farm if queries are available  */}
              <MobileFarmList
                farms={filteredFarms}
                noResult={noFilteredFarms}
                isLoading={isLoading}
                prefOpen={prefModalOpen}
                setPrefOpen={setPrefModalOpen}
              />
              {/* {filteredFarms.length < farmsList.length && (
                <GoToHome router={router} />
              )} */}
            </div>
          ) : (
            // DESKTOP VIEW
            <div className="hidden sm:block bg-[#01050D]">
              {/* Shows Shared farm if queries are available  */}
              <ListicleTable
                farms={filteredFarms}
                noResult={noFilteredFarms}
                isLoading={isLoading}
                positions={positions}
              />
              {/* {filteredFarms.length < farms.length && (
                <GoToHome router={router} />
              )} */}
            </div>
          )}
        </div>
        {showScrollBtn && <ScrollToTopBtn />}
        <AllProtocolsModal
          open={protocolModalOpen}
          setOpen={setProtocolModalOpen}
          protocols={protocolList(farms)}
        />
      </main>
    </div>
  );
};

// Showing GoToHome if farms are shared or filtered
const GoToHome = ({ router }: { router: NextRouter }) => (
  <div className="border-t border-[#222A39] w-full pt-8 pb-9">
    <div
      className="py-2 sm:py-4 text-bodyGray font-bold text-sm sm:text-base leading-3 sm:leading-5 text-center cursor-pointer"
      onClick={() => {
        router.reload();
      }}
    >
      Go to home
    </div>
  </div>
);

export default Home;
