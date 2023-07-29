import { FarmType } from "@utils/types/common";
import { ethers } from "ethers";
import {
  chains,
  lpAbi,
  siriusChefAbi,
  arthswapChefAbi,
  sushiChefAbi,
  solarflareChefAbi,
  beamswapChefAbi,
  curveChefAbi,
  zenlinkChefAbi,
  solarbeamChefAbi,
  stellaswapChefAbi,
  stellaswapV1ChefAbi,
} from "@components/Common/Layout/evmUtils";
import { Address } from "viem";

interface EmptyEvmProps {
  farms: FarmType[];
  positions: { [key: string]: any };
  setPositions: (value: { [key: string]: any }) => void;
}

interface FetchPositionsProps {
  farms: FarmType[];
  positions: { [key: string]: any };
  setPositions: (value: { [key: string]: any }) => void;
  setIsEvmPosLoading: (value: boolean) => void;
  address: Address | undefined; // userAddress
  tokenPricesMap: {
    [key: string]: number;
  };
  lpTokenPricesMap: {
    [key: string]: number;
  };
}

export const updateEvmPositions = async ({
  // farms,
  farm,
  positions,
  // setPositions,
  // setIsEvmPosLoading,
  address,
  tokenPricesMap,
  lpTokenPricesMap,
}: any) => {
  // const farm = farms.filter(f => )
  console.log("uepos farm", farm);
  const chain = farm.chain.toLowerCase();
  const protocol = farm.protocol.toLowerCase();
  let rpcUrl = "";
  if (chain == "moonbeam") {
    rpcUrl = process.env.NEXT_PUBLIC_MOONBEAM_URL!;
  } else if (chain == "moonriver") {
    rpcUrl = process.env.NEXT_PUBLIC_MOONRIVER_URL!;
  } else if (chain == "astar") {
    rpcUrl = process.env.NEXT_PUBLIC_ASTAR_URL!;
  }
  const provider = ethers.getDefaultProvider(rpcUrl);

  if (protocol == "stellaswap") {
    const ff = farm;
    let chef = new ethers.Contract(ff.chef, stellaswapChefAbi, provider);
    if (ff.chef == "0xEDFB330F5FA216C9D2039B99C8cE9dA85Ea91c1E") {
      chef = new ethers.Contract(ff.chef, stellaswapV1ChefAbi, provider);
    }
    const poolInfo = await chef.poolInfo(ff.id);
    const userInfo = await chef.userInfo(ff.id, address); // EVM address
    console.log("poolInfo0", Object.keys(poolInfo), Object.values(poolInfo)[0]);
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
    const unstakedLpAmount = Number(await lp.balanceOf(address)) / 10 ** 18;
    console.log(
      "stakedLpAmount",
      stakedLpAmount,
      "unstakedLpAmount",
      unstakedLpAmount
    );

    const name = `${ff.chain}-${ff.protocol}-${ff.chef}-${ff.id}-${ff.asset.symbol}`;

    let pending: any;
    let ucrewAddrs: any;
    let ucrewSymbols: any;
    let ucrewDecimals: any;
    let ucrewAmounts: any;
    if (ff.chef == "0xEDFB330F5FA216C9D2039B99C8cE9dA85Ea91c1E") {
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
          `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
        ]
      );
      ucrews.push({
        token: ucrewSymbols[i],
        amount: Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i]),
        amountUSD:
          (Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i])) *
          tokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
          ],
      });
    }

    console.log("ucrewsstellaswap", ucrews);

    // if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
    console.log("before creating temp positions obejct:\n", {
      unstakedAmount: unstakedLpAmount,
      stakedLpAmount: stakedLpAmount,
      lpTokenPricesMap: lpTokenPricesMap,
      lpTokenPrice:
        lpTokenPricesMap[
          `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
        ],
      lpSymbol: ff.asset.symbol,
      chain: chain,
      protocol: protocol,
    });

    const tempPositions = { ...positions };
    const newPosition = {
      unstaked: {
        amount: unstakedLpAmount,
        amountUSD:
          unstakedLpAmount *
          lpTokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
          ],
      },
      staked: {
        amount: stakedLpAmount,
        amountUSD:
          stakedLpAmount *
          lpTokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
          ],
      },
      unclaimedRewards: ucrews,
      farmType: ff.farmType,
      lpSymbol: ff.asset.symbol,
      lpAddress: ff.asset.address,
    };
    tempPositions[name] = newPosition;
    return { name: name, position: newPosition };
    // setPositions((prevState: any) => ({
    //   ...prevState,
    //   ...tempPositions,
    // }));
    // }
    console.log(
      "afterstellaswappositions",
      positions,
      "key",
      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
    );
  } else if (protocol == "solarbeam") {
    const ff = farm;
    const chef = new ethers.Contract(ff.chef, solarbeamChefAbi, provider);
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
    const unstakedLpAmount = Number(await lp.balanceOf(address)) / 10 ** 18;
    console.log(
      "solarbeamstakedLpAmount",
      stakedLpAmount,
      "solarbeamunstakedLpAmount",
      unstakedLpAmount
    );
    const name = `${ff.chain}-${ff.protocol}-${ff.chef}-${ff.id}-${ff.asset.symbol}`;
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
          `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
        ]
      );
      ucrews.push({
        token: ucrewSymbols[i],
        amount: Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i]),
        amountUSD:
          (Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i])) *
          tokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
          ],
      });
    }

    console.log("ucrewssolarbeam", ucrews);

    // if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
    const tempPositions = { ...positions };

    console.log("before creating temp positions obejct:\n", {
      unstakedAmount: unstakedLpAmount,
      stakedLpAmount: stakedLpAmount,
      lpTokenPricesMap: lpTokenPricesMap,
      lpTokenPrice:
        lpTokenPricesMap[
          `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
        ],
      lpSymbol: ff.asset.symbol,
    });

    const newPosition = {
      unstaked: {
        amount: unstakedLpAmount,
        amountUSD:
          unstakedLpAmount *
          lpTokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
          ],
      },
      staked: {
        amount: stakedLpAmount,
        amountUSD:
          stakedLpAmount *
          lpTokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
          ],
      },
      unclaimedRewards: ucrews,
      farmType: ff.farmType,
      lpSymbol: ff.asset.symbol,
      lpAddress: ff.asset.address,
    };
    tempPositions[name] = newPosition;
    return { name: name, position: newPosition };
    // setPositions((prevState: any) => ({
    //   ...prevState,
    //   ...tempPositions,
    // }));
    // }
    console.log("after solarbeam positions", positions);
  } else if (protocol == "zenlink") {
    const ff = farm;
    const chef = new ethers.Contract(ff.chef, zenlinkChefAbi, provider);
    console.log("ff", ff.chain, ff.protocol, ff.chef, ff.id, ff.asset.symbol);

    // const [lpToken, , , , , ,] = await chef.poolInfo(ff.id)
    const poolInfo = await chef.getPoolInfo(ff.id);
    const userInfo = await chef.getUserInfo(ff.id, address);
    console.log("poolInfo0", Object.keys(poolInfo), Object.values(poolInfo)[0]);
    console.log("zlkpoolInfo", poolInfo);
    console.log(ff.asset.symbol, "zlkuserInfo", userInfo);
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
    const unstakedLpAmount = Number(await lp.balanceOf(address)) / 10 ** 18;
    console.log(
      "stakedLpAmount",
      stakedLpAmount,
      "zlkunstakedLpAmount",
      unstakedLpAmount
    );
    const name = `${ff.chain}-${ff.protocol}-${ff.chef}-${ff.id}-${ff.asset.symbol}`;
    const rewardTokens: any = Object.values(poolInfo)[2];
    console.log("rewardTokens", rewardTokens);
    const pendingRewards = await chef.pendingRewards(ff.id, address);
    const rewards: any = Object.values(pendingRewards)[0];

    let ucrews: any = [];
    for (let i = 0; i < rewards.length; i++) {
      const tok = new ethers.Contract(rewardTokens[i], lpAbi, provider);
      const sym = await tok.symbol();
      const dec = await tok.decimals();
      console.log(
        "sym:",
        sym,
        "\ndec:",
        dec,
        "\ntoken price:",
        tokenPricesMap[`${ff.chain}-${ff.protocol}-${sym}-${rewardTokens[i]}`]
      );
      ucrews.push({
        token: sym,
        amount: Number(rewards[i]) / 10 ** Number(dec),
        amountUSD:
          (Number(rewards[i]) / 10 ** Number(dec)) *
          tokenPricesMap[
            `${ff.chain}-${ff.protocol}-${sym}-${rewardTokens[i]}`
          ],
      });
    }

    console.log("ucrewszenlink", ucrews);

    let price =
      lpTokenPricesMap[
        `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
      ] *
      10 ** 18;
    if (ff.asset.symbol == "ZLK") {
      //  tokenPricesMap[`${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`]
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
        // tokenPricesMap[`${ff.chain}-${ff.protocol}-ZLK-${}`]
        price = tokenPricesMap[as[0]];
        console.log("priceee", price);
      }
    }

    // if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
    console.log("unstaked and staked amount > 0 -- updating positions...");
    console.log("before creating temp positions obejct:\n", {
      unstakedAmount: unstakedLpAmount,
      stakedLpAmount: stakedLpAmount,
      lpTokenPricesMap: lpTokenPricesMap,
      lpTokenPrice:
        lpTokenPricesMap[
          `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
        ],
      lpSymbol: ff.asset.symbol,
    });

    const tempPositions = { ...positions };
    const newPosition = {
      unstaked: {
        amount: unstakedLpAmount,
        amountUSD: unstakedLpAmount * price,
      },
      staked: {
        amount: stakedLpAmount,
        amountUSD: stakedLpAmount * price,
      },
      unclaimedRewards: ucrews,
      farmType: ff.farmType,
      lpSymbol: ff.asset.symbol,
      lpAddress: ff.asset.address,
    };
    tempPositions[name] = newPosition;
    return { name: name, position: newPosition };
    console.log("added position", tempPositions[name]);
    // setPositions((prevState: any) => ({
    //   ...prevState,
    //   ...tempPositions,
    // }));
    // }
    console.log("after zenlink positions", positions);
  } else if (protocol == "curve") {
    const ff = farm;
    const chef = new ethers.Contract(ff.chef, curveChefAbi, provider);
    console.log("ff", ff.chain, ff.protocol, ff.chef, ff.id, ff.asset.symbol);

    const reward_token = await chef.reward_tokens(0);
    console.log("reward_token0", reward_token);
    const claimable_reward = await chef.claimable_reward(address, reward_token);
    const stakedLpAmount = Number(await chef.balanceOf(address)) / 10 ** 18;
    const lp_token = await chef.lp_token();
    console.log("lp_token", lp_token);
    const lp = new ethers.Contract(lp_token, lpAbi, provider);
    const unstakedLpAmount = Number(await lp.balanceOf(address)) / 10 ** 18;
    console.log(
      "stakedLpAmount",
      stakedLpAmount,
      "unstakedLpAmount",
      unstakedLpAmount
    );
    const name = `${ff.chain}-${ff.protocol}-${ff.chef}-${ff.id}-${ff.asset.symbol}`;
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
        tokenPricesMap[`${ff.chain}${ff.protocol}-${sym}-${reward_token}`],
        "\nlpTokenPrice",
        lpTokenPricesMap[
          `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
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
          tokenPricesMap[`${ff.chain}${ff.protocol}-${sym}-${reward_token}`],
      });
    }

    // console.log("ucrewscurve", ucrews);

    // if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
    const tempPositions = { ...positions };

    console.log("before creating temp positions object:\n", {
      unstakedAmount: unstakedLpAmount,
      stakedLpAmount: stakedLpAmount,
      lpTokenPricesMap: lpTokenPricesMap,
      lpTokenPrice:
        lpTokenPricesMap[
          `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
        ],
      lpSymbol: ff.asset.symbol,
    });

    const newPosition = {
      unstaked: {
        amount: unstakedLpAmount,
        amountUSD:
          unstakedLpAmount *
          lpTokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
          ],
        // lpTokenPricesMap[
        //   `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
        // ],
      },
      staked: {
        amount: stakedLpAmount,
        amountUSD:
          stakedLpAmount *
          lpTokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
          ],
      },
      unclaimedRewards: ucrews,
      farmType: ff.farmType,
      lpSymbol: ff.asset.symbol,
      lpAddress: ff.asset.address,
    };
    tempPositions[name] = newPosition;
    return { name: name, position: newPosition };

    // setPositions((prevState: any) => ({
    //   ...prevState,
    //   ...tempPositions,
    // }));
    // }
    console.log("after curve positions", positions);
  } else if (protocol == "beamswap") {
    const ff = farm;
    const chef = new ethers.Contract(ff.chef, beamswapChefAbi, provider);
    console.log(
      "beamswapff",
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
      "beamswapInfo0",
      Object.keys(poolInfo),
      Object.values(poolInfo)[0]
    );
    console.log("beamswappoolInfo", poolInfo);
    console.log("beamswapuserInfo", userInfo);
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
    const unstakedLpAmount = Number(await lp.balanceOf(address)) / 10 ** 18;
    console.log(
      "beamswapstakedLpAmount",
      stakedLpAmount,
      "beamswapunstakedLpAmount",
      unstakedLpAmount
    );
    const name = `${ff.chain}-${ff.protocol}-${ff.chef}-${ff.id}-${ff.asset.symbol}`;
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
          `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
        ]
      );
      ucrews.push({
        token: ucrewSymbols[i],
        amount: Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i]),
        amountUSD:
          (Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i])) *
          tokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
          ],
      });
    }

    console.log("ucrewsbeamswap", ucrews);

    // if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
    const tempPositions = { ...positions };

    console.log("before creating temp positions obejct:\n", {
      unstakedAmount: unstakedLpAmount,
      stakedLpAmount: stakedLpAmount,
      lpTokenPricesMap: lpTokenPricesMap,
      lpTokenPrice:
        lpTokenPricesMap[
          `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
        ],
      lpSymbol: ff.asset.symbol,
    });

    const newPosition = {
      unstaked: {
        amount: unstakedLpAmount,
        amountUSD:
          unstakedLpAmount *
          lpTokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
          ],
      },
      staked: {
        amount: stakedLpAmount,
        amountUSD:
          stakedLpAmount *
          lpTokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
          ],
      },
      unclaimedRewards: ucrews,
      farmType: ff.farmType,
      lpSymbol: ff.asset.symbol,
      lpAddress: ff.asset.address,
    };
    tempPositions[name] = newPosition;
    return { name: name, position: newPosition };
    // setPositions((prevState: any) => ({
    //   ...prevState,
    //   ...tempPositions,
    // }));
    // }
    console.log("after beamswap positions", positions);
  } else if (protocol == "solarflare") {
    const ff = farm;
    const chef = new ethers.Contract(ff.chef, solarflareChefAbi, provider);
    console.log(
      "solarflareff",
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
      "solarflareInfo0",
      Object.keys(poolInfo),
      Object.values(poolInfo)[0]
    );
    console.log("solarflarepoolInfo", poolInfo);
    console.log("solarflareuserInfo", userInfo);
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
    const unstakedLpAmount = Number(await lp.balanceOf(address)) / 10 ** 18;
    console.log(
      "solarflarestakedLpAmount",
      stakedLpAmount,
      "solarflareunstakedLpAmount",
      unstakedLpAmount
    );
    const name = `${ff.chain}-${ff.protocol}-${ff.chef}-${ff.id}-${ff.asset.symbol}`;
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
          `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
        ]
      );
      ucrews.push({
        token: ucrewSymbols[i],
        amount: Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i]),
        amountUSD:
          (Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i])) *
          tokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
          ],
      });
    }

    console.log("ucrewssolarflare", ucrews);

    // if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
    const tempPositions = { ...positions };

    console.log("before creating temp positions obejct:\n", {
      unstakedAmount: unstakedLpAmount,
      stakedLpAmount: stakedLpAmount,
      lpTokenPricesMap: lpTokenPricesMap,
      lpTokenPrice:
        lpTokenPricesMap[
          `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
        ],
      lpSymbol: ff.asset.symbol,
    });

    const newPosition = {
      unstaked: {
        amount: unstakedLpAmount,
        amountUSD:
          unstakedLpAmount *
          lpTokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
          ],
      },
      staked: {
        amount: stakedLpAmount,
        amountUSD:
          stakedLpAmount *
          lpTokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
          ],
      },
      unclaimedRewards: ucrews,
      farmType: ff.farmType,
      lpSymbol: ff.asset.symbol,
      lpAddress: ff.asset.address,
    };
    tempPositions[name] = newPosition;
    return { name: name, position: newPosition };
    // setPositions((prevState: any) => ({
    //   ...prevState,
    //   ...tempPositions,
    // }));
    // }
    console.log("after solarflare positions", positions);
  } else if (protocol == "sushiswap") {
    const ff = farm;
    const chef = new ethers.Contract(ff.chef, sushiChefAbi, provider);
    console.log(
      "sushiswapff",
      ff.chain,
      ff.protocol,
      ff.chef,
      ff.id,
      ff.asset.symbol
    );

    // const [lpToken, , , , , ,] = await chef.poolInfo(ff.id)
    const lpToken = await chef.lpToken(ff.id);
    const poolInfo = await chef.poolInfo(ff.id);
    const userInfo = await chef.userInfo(ff.id, address);
    console.log("sushiswapInfo0", Object.keys(poolInfo), lpToken);
    console.log("sushiswappoolInfo", poolInfo);
    console.log("sushiswapuserInfo", userInfo);
    const stakedLpAmount =
      Number(Object.values(userInfo)[0] as number) / 10 ** 18;
    const rewardDebt = Object.values(userInfo)[1];
    // const rewardLockedUp = Object.values(userInfo)[2];
    // const nextHarvestUntilTimestamp = Object.values(userInfo)[3];
    const lp = new ethers.Contract(lpToken as string, lpAbi, provider);
    const unstakedLpAmount = Number(await lp.balanceOf(address)) / 10 ** 18;
    console.log(
      "sushiswapstakedLpAmount",
      stakedLpAmount,
      "sushiswapunstakedLpAmount",
      unstakedLpAmount
    );

    const name = `${ff.chain}-${ff.protocol}-${ff.chef}-${ff.id}-${ff.asset.symbol}`;

    let pending: any;
    let ucrewAddrs: any;
    let ucrewSymbols: any;
    let ucrewDecimals: any;
    let ucrewAmounts: any;
    pending = await chef.pendingSushi(ff.id, address);
    ucrewAddrs = ["0xf390830DF829cf22c53c8840554B98eafC5dCBc2"];
    ucrewSymbols = ["SUSHI"];
    ucrewDecimals = [18];
    ucrewAmounts = [pending];

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
          `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
        ]
      );
      ucrews.push({
        token: ucrewSymbols[i],
        amount: Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i]),
        amountUSD:
          (Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i])) *
          tokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
          ],
      });
    }

    console.log("ucrewssushiswap", ucrews);

    // if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
    const tempPositions = { ...positions };

    console.log("before creating temp positions obejct:\n", {
      unstakedAmount: unstakedLpAmount,
      stakedLpAmount: stakedLpAmount,
      lpTokenPricesMap: lpTokenPricesMap,
      lpTokenPrice:
        lpTokenPricesMap[
          `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
        ],
      lpSymbol: ff.asset.symbol,
    });

    const newPosition = {
      unstaked: {
        amount: unstakedLpAmount,
        amountUSD:
          unstakedLpAmount *
          lpTokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
          ],
      },
      staked: {
        amount: stakedLpAmount,
        amountUSD:
          stakedLpAmount *
          lpTokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
          ],
      },
      unclaimedRewards: ucrews,
      farmType: ff.farmType,
      lpSymbol: ff.asset.symbol,
      lpAddress: ff.asset.address,
    };
    tempPositions[name] = newPosition;
    return { name: name, position: newPosition };
    // setPositions((prevState: any) => ({
    //   ...prevState,
    //   ...tempPositions,
    // }));
    // }
    console.log("after sushiswap positions", positions);
  } else if (protocol == "arthswap") {
    const ff = farm;
    const chef = new ethers.Contract(ff.chef, arthswapChefAbi, provider);
    console.log(
      "arthswapff",
      ff.chain,
      ff.protocol,
      ff.chef,
      ff.id,
      ff.asset.symbol
    );

    // const lpa = new ethers.Contract(
    //   ff.asset.address,
    //   lpAbi,
    //   provider
    // );
    // console.log("artlpa", await lpa.balanceOf(address));
    // const [lpToken, , , , , ,] = await chef.poolInfo(ff.id)
    // const lpToken = await chef.lpTokens(ff.id);
    const poolInfo = await chef.poolInfos(ff.id);
    const userInfo = await chef.userInfos(ff.id, address);
    // console.log("arthswapInfo0", Object.keys(poolInfo));
    console.log("arthswappoolInfo", poolInfo);
    console.log("arthswapuserInfo", userInfo);
    const stakedLpAmount =
      Number(Object.values(userInfo)[0] as number) / 10 ** 18;
    const rewardDebt = Object.values(userInfo)[1];
    // const rewardLockedUp = Object.values(userInfo)[2];
    // const nextHarvestUntilTimestamp = Object.values(userInfo)[3];
    const lp = new ethers.Contract(ff.asset.address, lpAbi, provider);
    const unstakedLpAmount = Number(await lp.balanceOf(address)) / 10 ** 18;
    console.log(
      "arthswapstakedLpAmount",
      stakedLpAmount,
      "arthswapunstakedLpAmount",
      unstakedLpAmount
    );

    const name = `${ff.chain}-${ff.protocol}-${ff.chef}-${ff.id}-${ff.asset.symbol}`;

    let pending: any;
    let ucrewAddrs: any;
    let ucrewSymbols: any;
    let ucrewDecimals: any;
    let ucrewAmounts: any;
    pending = await chef.pendingARSW(ff.id, address);
    ucrewAddrs = ["0xDe2578Edec4669BA7F41c5d5D2386300bcEA4678"];
    ucrewSymbols = ["ARSW"];
    ucrewDecimals = [18];
    ucrewAmounts = [pending];

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
          `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
        ]
      );
      ucrews.push({
        token: ucrewSymbols[i],
        amount: Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i]),
        amountUSD:
          (Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i])) *
          tokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
          ],
      });
    }

    console.log("ucrewsarthswap", ucrews);

    // if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
    const tempPositions = { ...positions };

    console.log("arthbefore creating temp positions obejct:\n", {
      unstakedAmount: unstakedLpAmount,
      stakedLpAmount: stakedLpAmount,
      lpTokenPricesMap: lpTokenPricesMap,
      lpTokenPrice:
        lpTokenPricesMap[
          `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
        ],
      lpSymbol: ff.asset.symbol,
      hmm:
        unstakedLpAmount *
        lpTokenPricesMap[
          `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
        ],
    });

    const newPosition = {
      unstaked: {
        amount: unstakedLpAmount,
        amountUSD:
          unstakedLpAmount *
          lpTokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
          ],
      },
      staked: {
        amount: stakedLpAmount,
        amountUSD:
          stakedLpAmount *
          lpTokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
          ],
      },
      unclaimedRewards: ucrews,
      farmType: ff.farmType,
      lpSymbol: ff.asset.symbol,
      lpAddress: ff.asset.address,
    };
    tempPositions[name] = newPosition;
    return { name: name, position: newPosition };
    // setPositions((prevState: any) => ({
    //   ...prevState,
    //   ...tempPositions,
    // }));
    // }
    console.log("after arthswap positions", positions);
  } else if (protocol == "sirius") {
    const ff = farm;
    let chef = new ethers.Contract(ff.chef, siriusChefAbi, provider);
    console.log(
      "ffsirius",
      ff.chain,
      ff.protocol,
      ff.chef,
      ff.id,
      ff.asset.symbol
    );

    const reward_token = await chef.rewardTokens(0);
    console.log("reward_token0", reward_token);
    const claimable_reward = await chef.claimableReward(address, reward_token);
    const stakedLpAmount = Number(await chef.balanceOf(address)) / 10 ** 18;
    const lp_token = await chef.lpToken();
    console.log("siriuslp_token", lp_token);
    const lp = new ethers.Contract(lp_token, lpAbi, provider);
    const unstakedLpAmount = Number(await lp.balanceOf(address)) / 10 ** 18;
    console.log(
      "stakedLpAmount",
      stakedLpAmount,
      "unstakedLpAmount",
      unstakedLpAmount
    );
    const name = `${ff.chain}-${ff.protocol}-${ff.chef}-${ff.id}-${ff.asset.symbol}`;
    const rewardCount: any = await chef.rewardCount();
    let ucrews: any = [];
    for (let i = 0; i < rewardCount; i++) {
      const reward_token: any = await chef.rewardTokens(i);
      const claimable_reward: any = await chef.claimableReward(
        address,
        reward_token
      );
      console.log(
        `sirreward_token[${i}]: ${reward_token}, claimable_reward: ${claimable_reward}`
      );
      const tok = new ethers.Contract(reward_token, lpAbi, provider);
      const sym = await tok.symbol();
      const dec = await tok.decimals();
      console.log(
        "sym",
        sym,
        "\ndec",
        dec,
        "\nsirtokenPrice",
        tokenPricesMap[`${ff.chain}-${ff.protocol}-${sym}-${reward_token}`],
        "\nlpTokenPrice",
        lpTokenPricesMap[
          `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
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
          tokenPricesMap[`${ff.chain}-${ff.protocol}-${sym}-${reward_token}`],
      });
    }

    // console.log("ucrewscurve", ucrews);

    // if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
    const tempPositions = { ...positions };

    console.log("before creating temp positions object:\n", {
      unstakedAmount: unstakedLpAmount,
      stakedLpAmount: stakedLpAmount,
      lpTokenPricesMap: lpTokenPricesMap,
      lpTokenPrice:
        lpTokenPricesMap[
          `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
        ],
      lpSymbol: ff.asset.symbol,
    });

    const newPosition = {
      unstaked: {
        amount: unstakedLpAmount,
        amountUSD:
          unstakedLpAmount *
          lpTokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
          ],
        // lpTokenPricesMap[
        //   `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
        // ],
      },
      staked: {
        amount: stakedLpAmount,
        amountUSD:
          stakedLpAmount *
          lpTokenPricesMap[
            `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
          ],
      },
      unclaimedRewards: ucrews,
      farmType: ff.farmType,
      lpSymbol: ff.asset.symbol,
      lpAddress: ff.asset.address,
    };
    tempPositions[name] = newPosition;
    return { name: name, position: newPosition };
    // setPositions((prevState: any) => ({
    //   ...prevState,
    //   ...tempPositions,
    // }));
    // }
    console.log("after curve positions", positions);
  }
};

// method to empty evm positions when wallet disconnected
export const emptyEvmPositions = ({
  farms,
  positions,
  setPositions,
}: EmptyEvmProps) => {
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

/**
 * EVM Chains Setup
 * Chains -- Moonriver, Moonbeam, Astar
 * Protocols -- Curve, Zenlink, Solarbeam, Stellaswap
 */
export const fetchEvmPositions = async ({
  farms,
  positions,
  setPositions,
  setIsEvmPosLoading,
  address,
  tokenPricesMap,
  lpTokenPricesMap,
}: FetchPositionsProps) => {
  emptyEvmPositions({ farms, positions, setPositions });
  // Fetching EVM positions...
  setIsEvmPosLoading(true);
  let allPromises = new Array<Promise<void>>();

  chains.forEach((chain) => {
    const provider = ethers.getDefaultProvider(chain.url!);
    chain.protocols.forEach((protocol) => {
      const filteredFarms = farms.filter((f: FarmType) => {
        return (
          f.protocol.toLowerCase() == protocol.name &&
          f.chain.toLowerCase() == chain.name &&
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
            tvl: number;
            farmType: string;
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

            const name = `${ff.chain}-${ff.protocol}-${protocol.chef}-${ff.id}-${ff.asset.symbol}`;

            let pending: any;
            let ucrewAddrs: any;
            let ucrewSymbols: any;
            let ucrewDecimals: any;
            let ucrewAmounts: any;
            if (protocol.chef == "0xEDFB330F5FA216C9D2039B99C8cE9dA85Ea91c1E") {
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
                  `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
                ]
              );
              ucrews.push({
                token: ucrewSymbols[i],
                amount:
                  Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i]),
                amountUSD:
                  (Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i])) *
                  tokenPricesMap[
                    `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
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
                    `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
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
                      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                },
                staked: {
                  amount: stakedLpAmount,
                  amountUSD:
                    stakedLpAmount *
                    lpTokenPricesMap[
                      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                },
                unclaimedRewards: ucrews,
                farmType: ff.farmType,
                lpSymbol: ff.asset.symbol,
                lpAddress: ff.asset.address,
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
              `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
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
            asset: { symbol: string; address: string };
            tvl: number;
            farmType: string;
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
            const name = `${ff.chain}-${ff.protocol}-${protocol.chef}-${ff.id}-${ff.asset.symbol}`;
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
                  `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
                ]
              );
              ucrews.push({
                token: ucrewSymbols[i],
                amount:
                  Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i]),
                amountUSD:
                  (Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i])) *
                  tokenPricesMap[
                    `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
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
                    `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                  ],
                lpSymbol: ff.asset.symbol,
              });

              tempPositions[name] = {
                unstaked: {
                  amount: unstakedLpAmount,
                  amountUSD:
                    unstakedLpAmount *
                    lpTokenPricesMap[
                      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                },
                staked: {
                  amount: stakedLpAmount,
                  amountUSD:
                    stakedLpAmount *
                    lpTokenPricesMap[
                      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                },
                unclaimedRewards: ucrews,
                farmType: ff.farmType,
                lpSymbol: ff.asset.symbol,
                lpAddress: ff.asset.address,
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
            asset: { symbol: string; address: string };
            tvl: number;
            farmType: string;
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
            console.log("zlkpoolInfo", poolInfo);
            console.log(ff.asset.symbol, "zlkuserInfo", userInfo);
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
              "zlkunstakedLpAmount",
              unstakedLpAmount
            );
            const name = `${ff.chain}-${ff.protocol}-${protocol.chef}-${ff.id}-${ff.asset.symbol}`;
            const rewardTokens: any = Object.values(poolInfo)[2];
            console.log("rewardTokens", rewardTokens);
            const pendingRewards = await chef.pendingRewards(ff.id, address);
            const rewards: any = Object.values(pendingRewards)[0];

            let ucrews: any = [];
            for (let i = 0; i < rewards.length; i++) {
              const tok = new ethers.Contract(rewardTokens[i], lpAbi, provider);
              const sym = await tok.symbol();
              const dec = await tok.decimals();
              console.log(
                "sym:",
                sym,
                "\ndec:",
                dec,
                "\ntoken price:",
                tokenPricesMap[
                  `${ff.chain}-${ff.protocol}-${sym}-${rewardTokens[i]}`
                ]
              );
              ucrews.push({
                token: sym,
                amount: Number(rewards[i]) / 10 ** Number(dec),
                amountUSD:
                  (Number(rewards[i]) / 10 ** Number(dec)) *
                  tokenPricesMap[
                    `${ff.chain}-${ff.protocol}-${sym}-${rewardTokens[i]}`
                  ],
              });
            }

            console.log("ucrewszenlink", ucrews);

            let price =
              lpTokenPricesMap[
                `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
              ] *
              10 ** 18;
            if (ff.asset.symbol == "ZLK") {
              //  tokenPricesMap[`${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`]
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
                // tokenPricesMap[`${ff.chain}-${ff.protocol}-ZLK-${}`]
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
                    `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
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
                farmType: ff.farmType,
                lpSymbol: ff.asset.symbol,
                lpAddress: ff.asset.address,
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
        const chef = new ethers.Contract(protocol.chef, curveChefAbi, provider);
        // provider.on("block", async () => {
        const cur = filteredFarms.map(
          async (ff: {
            chain: any;
            protocol: any;
            chef: any;
            id: any;
            asset: { symbol: string; address: string };
            tvl: number;
            farmType: string;
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
            const name = `${ff.chain}-${ff.protocol}-${protocol.chef}-${ff.id}-${ff.asset.symbol}`;
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
                  `${ff.chain}${ff.protocol}-${sym}-${reward_token}`
                ],
                "\nlpTokenPrice",
                lpTokenPricesMap[
                  `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
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
                    `${ff.chain}${ff.protocol}-${sym}-${reward_token}`
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
                    `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                  ],
                lpSymbol: ff.asset.symbol,
              });

              tempPositions[name] = {
                unstaked: {
                  amount: unstakedLpAmount,
                  amountUSD:
                    unstakedLpAmount *
                    lpTokenPricesMap[
                      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                  // lpTokenPricesMap[
                  //   `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                  // ],
                },
                staked: {
                  amount: stakedLpAmount,
                  amountUSD:
                    stakedLpAmount *
                    lpTokenPricesMap[
                      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                },
                unclaimedRewards: ucrews,
                farmType: ff.farmType,
                lpSymbol: ff.asset.symbol,
                lpAddress: ff.asset.address,
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
      } else if (protocol.name == "beamswap") {
        const chef = new ethers.Contract(
          protocol.chef,
          beamswapChefAbi,
          provider
        );
        // provider.on("block", async () => {
        const beam = filteredFarms.map(
          async (ff: {
            chain: any;
            protocol: any;
            chef: any;
            id: any;
            asset: { symbol: string; address: string };
            tvl: number;
            farmType: string;
          }) => {
            console.log(
              "beamswapff",
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
              "beamswapInfo0",
              Object.keys(poolInfo),
              Object.values(poolInfo)[0]
            );
            console.log("beamswappoolInfo", poolInfo);
            console.log("beamswapuserInfo", userInfo);
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
              "beamswapstakedLpAmount",
              stakedLpAmount,
              "beamswapunstakedLpAmount",
              unstakedLpAmount
            );
            const name = `${ff.chain}-${ff.protocol}-${protocol.chef}-${ff.id}-${ff.asset.symbol}`;
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
                  `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
                ]
              );
              ucrews.push({
                token: ucrewSymbols[i],
                amount:
                  Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i]),
                amountUSD:
                  (Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i])) *
                  tokenPricesMap[
                    `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
                  ],
              });
            }

            console.log("ucrewsbeamswap", ucrews);

            if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
              const tempPositions = { ...positions };

              console.log("before creating temp positions obejct:\n", {
                unstakedAmount: unstakedLpAmount,
                stakedLpAmount: stakedLpAmount,
                lpTokenPricesMap: lpTokenPricesMap,
                lpTokenPrice:
                  lpTokenPricesMap[
                    `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                  ],
                lpSymbol: ff.asset.symbol,
              });

              tempPositions[name] = {
                unstaked: {
                  amount: unstakedLpAmount,
                  amountUSD:
                    unstakedLpAmount *
                    lpTokenPricesMap[
                      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                },
                staked: {
                  amount: stakedLpAmount,
                  amountUSD:
                    stakedLpAmount *
                    lpTokenPricesMap[
                      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                },
                unclaimedRewards: ucrews,
                farmType: ff.farmType,
                lpSymbol: ff.asset.symbol,
                lpAddress: ff.asset.address,
              };
              setPositions((prevState: any) => ({
                ...prevState,
                ...tempPositions,
              }));
            }
            console.log("after beamswap positions", positions);
          }
        );
        allPromises.push(...beam);
        // });
      } else if (protocol.name == "solarflare") {
        const chef = new ethers.Contract(
          protocol.chef,
          solarflareChefAbi,
          provider
        );
        // provider.on("block", async () => {
        const solarf = filteredFarms.map(
          async (ff: {
            chain: any;
            protocol: any;
            chef: any;
            id: any;
            asset: { symbol: string; address: string };
            tvl: number;
            farmType: string;
          }) => {
            console.log(
              "solarflareff",
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
              "solarflareInfo0",
              Object.keys(poolInfo),
              Object.values(poolInfo)[0]
            );
            console.log("solarflarepoolInfo", poolInfo);
            console.log("solarflareuserInfo", userInfo);
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
              "solarflarestakedLpAmount",
              stakedLpAmount,
              "solarflareunstakedLpAmount",
              unstakedLpAmount
            );
            const name = `${ff.chain}-${ff.protocol}-${protocol.chef}-${ff.id}-${ff.asset.symbol}`;
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
                  `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
                ]
              );
              ucrews.push({
                token: ucrewSymbols[i],
                amount:
                  Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i]),
                amountUSD:
                  (Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i])) *
                  tokenPricesMap[
                    `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
                  ],
              });
            }

            console.log("ucrewssolarflare", ucrews);

            if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
              const tempPositions = { ...positions };

              console.log("before creating temp positions obejct:\n", {
                unstakedAmount: unstakedLpAmount,
                stakedLpAmount: stakedLpAmount,
                lpTokenPricesMap: lpTokenPricesMap,
                lpTokenPrice:
                  lpTokenPricesMap[
                    `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                  ],
                lpSymbol: ff.asset.symbol,
              });

              tempPositions[name] = {
                unstaked: {
                  amount: unstakedLpAmount,
                  amountUSD:
                    unstakedLpAmount *
                    lpTokenPricesMap[
                      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                },
                staked: {
                  amount: stakedLpAmount,
                  amountUSD:
                    stakedLpAmount *
                    lpTokenPricesMap[
                      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                },
                unclaimedRewards: ucrews,
                farmType: ff.farmType,
                lpSymbol: ff.asset.symbol,
                lpAddress: ff.asset.address,
              };
              setPositions((prevState: any) => ({
                ...prevState,
                ...tempPositions,
              }));
            }
            console.log("after solarflare positions", positions);
          }
        );
        allPromises.push(...solarf);
        // });
      } else if (protocol.name == "sushiswap") {
        const chef = new ethers.Contract(protocol.chef, sushiChefAbi, provider);
        // provider.on("block", async () => {
        const sushi = filteredFarms.map(
          async (ff: {
            chain: any;
            protocol: any;
            chef: any;
            id: any;
            asset: { symbol: string; address: string };
            tvl: number;
            farmType: string;
          }) => {
            console.log(
              "sushiswapff",
              ff.chain,
              ff.protocol,
              ff.chef,
              ff.id,
              ff.asset.symbol
            );

            // const [lpToken, , , , , ,] = await chef.poolInfo(ff.id)
            const lpToken = await chef.lpToken(ff.id);
            const poolInfo = await chef.poolInfo(ff.id);
            const userInfo = await chef.userInfo(ff.id, address);
            console.log("sushiswapInfo0", Object.keys(poolInfo), lpToken);
            console.log("sushiswappoolInfo", poolInfo);
            console.log("sushiswapuserInfo", userInfo);
            const stakedLpAmount =
              Number(Object.values(userInfo)[0] as number) / 10 ** 18;
            const rewardDebt = Object.values(userInfo)[1];
            // const rewardLockedUp = Object.values(userInfo)[2];
            // const nextHarvestUntilTimestamp = Object.values(userInfo)[3];
            const lp = new ethers.Contract(lpToken as string, lpAbi, provider);
            const unstakedLpAmount =
              Number(await lp.balanceOf(address)) / 10 ** 18;
            console.log(
              "sushiswapstakedLpAmount",
              stakedLpAmount,
              "sushiswapunstakedLpAmount",
              unstakedLpAmount
            );

            const name = `${ff.chain}-${ff.protocol}-${protocol.chef}-${ff.id}-${ff.asset.symbol}`;

            let pending: any;
            let ucrewAddrs: any;
            let ucrewSymbols: any;
            let ucrewDecimals: any;
            let ucrewAmounts: any;
            pending = await chef.pendingSushi(ff.id, address);
            ucrewAddrs = ["0xf390830DF829cf22c53c8840554B98eafC5dCBc2"];
            ucrewSymbols = ["SUSHI"];
            ucrewDecimals = [18];
            ucrewAmounts = [pending];

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
                  `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
                ]
              );
              ucrews.push({
                token: ucrewSymbols[i],
                amount:
                  Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i]),
                amountUSD:
                  (Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i])) *
                  tokenPricesMap[
                    `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
                  ],
              });
            }

            console.log("ucrewssushiswap", ucrews);

            if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
              const tempPositions = { ...positions };

              console.log("before creating temp positions obejct:\n", {
                unstakedAmount: unstakedLpAmount,
                stakedLpAmount: stakedLpAmount,
                lpTokenPricesMap: lpTokenPricesMap,
                lpTokenPrice:
                  lpTokenPricesMap[
                    `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                  ],
                lpSymbol: ff.asset.symbol,
              });

              tempPositions[name] = {
                unstaked: {
                  amount: unstakedLpAmount,
                  amountUSD:
                    unstakedLpAmount *
                    lpTokenPricesMap[
                      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                },
                staked: {
                  amount: stakedLpAmount,
                  amountUSD:
                    stakedLpAmount *
                    lpTokenPricesMap[
                      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                },
                unclaimedRewards: ucrews,
                farmType: ff.farmType,
                lpSymbol: ff.asset.symbol,
                lpAddress: ff.asset.address,
              };
              setPositions((prevState: any) => ({
                ...prevState,
                ...tempPositions,
              }));
            }
            console.log("after sushiswap positions", positions);
          }
        );
        allPromises.push(...sushi);
        // });
      } else if (protocol.name == "arthswap") {
        const chef = new ethers.Contract(
          protocol.chef,
          arthswapChefAbi,
          provider
        );
        // provider.on("block", async () => {
        const arth = filteredFarms.map(
          async (ff: {
            chain: any;
            protocol: any;
            chef: any;
            id: any;
            asset: { symbol: string; address: string };
            tvl: number;
            farmType: string;
          }) => {
            console.log(
              "arthswapff",
              ff.chain,
              ff.protocol,
              ff.chef,
              ff.id,
              ff.asset.symbol
            );

            // const lpa = new ethers.Contract(
            //   ff.asset.address,
            //   lpAbi,
            //   provider
            // );
            // console.log("artlpa", await lpa.balanceOf(address));
            // const [lpToken, , , , , ,] = await chef.poolInfo(ff.id)
            // const lpToken = await chef.lpTokens(ff.id);
            const poolInfo = await chef.poolInfos(ff.id);
            const userInfo = await chef.userInfos(ff.id, address);
            // console.log("arthswapInfo0", Object.keys(poolInfo));
            console.log("arthswappoolInfo", poolInfo);
            console.log("arthswapuserInfo", userInfo);
            const stakedLpAmount =
              Number(Object.values(userInfo)[0] as number) / 10 ** 18;
            const rewardDebt = Object.values(userInfo)[1];
            // const rewardLockedUp = Object.values(userInfo)[2];
            // const nextHarvestUntilTimestamp = Object.values(userInfo)[3];
            const lp = new ethers.Contract(ff.asset.address, lpAbi, provider);
            const unstakedLpAmount =
              Number(await lp.balanceOf(address)) / 10 ** 18;
            console.log(
              "arthswapstakedLpAmount",
              stakedLpAmount,
              "arthswapunstakedLpAmount",
              unstakedLpAmount
            );

            const name = `${ff.chain}-${ff.protocol}-${protocol.chef}-${ff.id}-${ff.asset.symbol}`;

            let pending: any;
            let ucrewAddrs: any;
            let ucrewSymbols: any;
            let ucrewDecimals: any;
            let ucrewAmounts: any;
            pending = await chef.pendingARSW(ff.id, address);
            ucrewAddrs = ["0xDe2578Edec4669BA7F41c5d5D2386300bcEA4678"];
            ucrewSymbols = ["ARSW"];
            ucrewDecimals = [18];
            ucrewAmounts = [pending];

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
                  `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
                ]
              );
              ucrews.push({
                token: ucrewSymbols[i],
                amount:
                  Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i]),
                amountUSD:
                  (Number(ucrewAmounts[i]) / 10 ** Number(ucrewDecimals[i])) *
                  tokenPricesMap[
                    `${ff.chain}-${ff.protocol}-${ucrewSymbols[i]}-${ucrewAddrs[i]}`
                  ],
              });
            }

            console.log("ucrewsarthswap", ucrews);

            if (unstakedLpAmount > 0 || stakedLpAmount > 0) {
              const tempPositions = { ...positions };

              console.log("arthbefore creating temp positions obejct:\n", {
                unstakedAmount: unstakedLpAmount,
                stakedLpAmount: stakedLpAmount,
                lpTokenPricesMap: lpTokenPricesMap,
                lpTokenPrice:
                  lpTokenPricesMap[
                    `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                  ],
                lpSymbol: ff.asset.symbol,
                hmm:
                  unstakedLpAmount *
                  lpTokenPricesMap[
                    `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                  ],
              });

              tempPositions[name] = {
                unstaked: {
                  amount: unstakedLpAmount,
                  amountUSD:
                    unstakedLpAmount *
                    lpTokenPricesMap[
                      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                },
                staked: {
                  amount: stakedLpAmount,
                  amountUSD:
                    stakedLpAmount *
                    lpTokenPricesMap[
                      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                },
                unclaimedRewards: ucrews,
                farmType: ff.farmType,
                lpSymbol: ff.asset.symbol,
                lpAddress: ff.asset.address,
              };
              setPositions((prevState: any) => ({
                ...prevState,
                ...tempPositions,
              }));
            }
            console.log("after arthswap positions", positions);
          }
        );
        allPromises.push(...arth);
        // });
      } else if (protocol.name.toLowerCase() == "sirius") {
        console.log("insidesir");

        let chef = new ethers.Contract(protocol.chef, siriusChefAbi, provider);

        const sir = filteredFarms.map(
          async (ff: {
            chain: any;
            protocol: any;
            chef: any;
            id: any;
            asset: { symbol: string; address: string };
            tvl: number;
            farmType: string;
          }) => {
            console.log(
              "ffsirius",
              ff.chain,
              ff.protocol,
              ff.chef,
              ff.id,
              ff.asset.symbol
            );

            const reward_token = await chef.rewardTokens(0);
            console.log("reward_token0", reward_token);
            const claimable_reward = await chef.claimableReward(
              address,
              reward_token
            );
            const stakedLpAmount =
              Number(await chef.balanceOf(address)) / 10 ** 18;
            const lp_token = await chef.lpToken();
            console.log("siriuslp_token", lp_token);
            const lp = new ethers.Contract(lp_token, lpAbi, provider);
            const unstakedLpAmount =
              Number(await lp.balanceOf(address)) / 10 ** 18;
            console.log(
              "stakedLpAmount",
              stakedLpAmount,
              "unstakedLpAmount",
              unstakedLpAmount
            );
            const name = `${ff.chain}-${ff.protocol}-${protocol.chef}-${ff.id}-${ff.asset.symbol}`;
            const rewardCount: any = await chef.rewardCount();
            let ucrews: any = [];
            for (let i = 0; i < rewardCount; i++) {
              const reward_token: any = await chef.rewardTokens(i);
              const claimable_reward: any = await chef.claimableReward(
                address,
                reward_token
              );
              console.log(
                `sirreward_token[${i}]: ${reward_token}, claimable_reward: ${claimable_reward}`
              );
              const tok = new ethers.Contract(reward_token, lpAbi, provider);
              const sym = await tok.symbol();
              const dec = await tok.decimals();
              console.log(
                "sym",
                sym,
                "\ndec",
                dec,
                "\nsirtokenPrice",
                tokenPricesMap[
                  `${ff.chain}-${ff.protocol}-${sym}-${reward_token}`
                ],
                "\nlpTokenPrice",
                lpTokenPricesMap[
                  `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
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
                    `${ff.chain}-${ff.protocol}-${sym}-${reward_token}`
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
                    `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                  ],
                lpSymbol: ff.asset.symbol,
              });

              tempPositions[name] = {
                unstaked: {
                  amount: unstakedLpAmount,
                  amountUSD:
                    unstakedLpAmount *
                    lpTokenPricesMap[
                      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                  // lpTokenPricesMap[
                  //   `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                  // ],
                },
                staked: {
                  amount: stakedLpAmount,
                  amountUSD:
                    stakedLpAmount *
                    lpTokenPricesMap[
                      `${ff.chain}-${ff.protocol}-${ff.asset.symbol}-${ff.asset.address}`
                    ],
                },
                unclaimedRewards: ucrews,
                farmType: ff.farmType,
                lpSymbol: ff.asset.symbol,
                lpAddress: ff.asset.address,
              };
              setPositions((prevState: any) => ({
                ...prevState,
                ...tempPositions,
              }));
            }
            console.log("after curve positions", positions);
          }
        );
        allPromises.push(...sir);
      }
    });
  });

  await Promise.allSettled(allPromises);
  setIsEvmPosLoading(false);
  console.log("positionsnow", positions);
};
