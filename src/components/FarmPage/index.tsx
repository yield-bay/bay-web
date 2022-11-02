// React, Next Imports
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

// Misc Imports
import useSpecificFarm from "@hooks/useSpecificFarm";
import { fetchListicleFarms } from "@utils/api";
import { ArrowLeftIcon } from "@heroicons/react/solid";
import ShareFarm from "@components/Library/ShareFarm";
import {
  farmURL,
  formatFarmType,
  formatFirstLetter,
  formatTokenSymbols,
} from "@utils/farmListMethods";
import SafetyScorePill from "@components/Library/SafetyScorePill";
import toDollarUnits from "@utils/toDollarUnits";
import Button from "@components/Library/Button";
import {
  calcAssetPercentage,
  calcTotalRewardValue,
  protocolURL,
} from "@utils/farmPageMethods";

type RewardType = {
  amount: number;
  asset: string;
  freq: string;
  valueUSD: number;
};

export default function FarmPage(props: any) {
  const router = useRouter();

  // States
  const [farms, setFarms] = useState<any[]>([]);
  const [idQuery, setIdQuery] = useState<string | string[] | undefined>();
  const [addrQuery, setAddrQuery] = useState<string | string[] | undefined>();

  const [farm] = useSpecificFarm(farms, idQuery, addrQuery);
  const tokenNames = farm ? formatTokenSymbols(farm?.asset.symbol) : [""];

  useEffect(() => {
    const { id, addr } = router.query;
    setIdQuery(id);
    setAddrQuery(addr);
  }, []);

  // fetching farms
  useEffect(() => {
    fetchListicleFarms().then((res: any) => {
      setFarms(res.farms);
    });
  }, []);

  return farm?.asset.symbol.length > 0 ? (
    <div className="flex flex-col pb-20 sm:pb-24 px-9 sm:px-11 lg:px-[120px]">
      {/* Back Arrow Icon */}
      <div className="opacity-70 cursor-pointer mt-[6px] mb-11 sm:mb-14">
        <Link href="/">
          <div className="flex flex-row gap-x-[14px]">
            <ArrowLeftIcon className="w-[18px]" />
            <span className="font-semibold text-lg sm:text-xl leading-5 sm:leading-6 select-none">
              back
            </span>
          </div>
        </Link>
      </div>
      {/* Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center mb-14 sm:mb-11 gap-y-6 sm:gap-x-9">
        <p className="text-[32px] font-bold leading-[39px]">
          {tokenNames.map((tokenName, index) => (
            <span key={index} className="mr-[3px]">
              {tokenName}
              {index !== tokenNames.length - 1 && " •"}
            </span>
          ))}
        </p>
        <div className="flex gap-x-5 items-center">
          <a href={farmURL(farm)} target="_blank" rel="noreferrer">
            <Button size="base">Visit Farm</Button>
          </a>
          <Button size="base" style="md:hidden">
            ROI
          </Button>
          <ShareFarm
            farm={farm}
            apr={(farm?.apr.base + farm?.apr.reward).toFixed(2)}
          />
        </div>
      </div>
      {/* First Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-14 sm:gap-16 lg:flex flex-row justify-between mb-10 sm:mb-[171px] text-base font-bold leading-5 text-white">
        <div className="">
          <p className="opacity-70">Assets</p>
          <div className="flex flex-col items-start gap-y-3 mt-6">
            {formatTokenSymbols(farm?.asset.symbol).map((asset, index) => (
              <div key={index} className="flex gap-x-5 items-center">
                <div className="flex rounded-full overflow-hidden ring-[3px] ring-[#01050D]">
                  <Image
                    height={48}
                    width={48}
                    src={farm?.asset.logos[index]}
                    alt={asset}
                  />
                </div>
                <p>{asset}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-y-6">
          <p className="opacity-70">Protocol</p>
          <p>{formatFirstLetter(farm?.protocol)}</p>
          <a
            href={protocolURL(farm?.protocol)}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:block opacity-70 underline"
          >
            Know More
          </a>
        </div>
        <div className="flex flex-col gap-y-6">
          <p className="opacity-70">Chain</p>
          <p>{formatFirstLetter(farm?.chain)}</p>
          <a
            href="https://google.com"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:block opacity-70 underline"
          >
            Know More
          </a>
        </div>

        <div className="flex flex-col gap-y-6 ">
          <p className="opacity-70 font-spaceGrotesk">Type</p>
          <p>{formatFarmType(farm?.farmType)}</p>
          <p className="font-medium leading-6 opacity-60 max-w-[306px]">
            The stable swap is a kind of automated market maker (AMM) dedicated
            to swapping tokens with stable values. Its goal is to facilitate
            swaps as efficiently as possible and allow users to trade
            stablecoins with minimal loss. Know More about them{" "}
            <a className="underline cursor-pointer">here</a>.
          </p>
        </div>
        <div className="flex flex-col gap-y-6 ">
          <p className="opacity-70 font-spaceGrotesk">Safety Score</p>
          <div className="flex items-center justify-start">
            <span>8.4</span>
            <SafetyScorePill score={8.4} />
          </div>
          {/* Safety Score Scale */}
          <div className="max-w-[326px]">
            <div className="w-full h-4 bg-white rounded-lg bg-safety-scale" />
            <div className="flex justify-between mt-[7px]">
              <span>0</span>
              <span>10</span>
            </div>
          </div>
          <p className="font-medium leading-6 opacity-60 max-w-[306px]">
            This score is calculated on the basis of an algorithm that will come
            from the brilliant mind of manan gouhari, he is the CPO and
            frustratingly photogenic, which is not his fault — though he should
            be resented for it.
          </p>
        </div>
      </div>
      {/* Second Row */}
      <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-14 sm:gap-14 xl:flex flex-row justify-between text-base font-bold leading-5 text-white">
        <div className="flex flex-col gap-y-6 max-w-max">
          <p className="opacity-70">APR</p>
          <div className="flex flex-col gap-y-[19px]">
            <p className="text-blueSilver text-2xl leading-7 font-bold">
              {(farm?.apr.base + farm?.apr.reward).toFixed(2)}%
            </p>
            <li className="flex">
              <p className="opacity-70">Reward APR</p>
              <p className="ml-2">{farm?.apr.base.toFixed(2)}%</p>
            </li>
            <li className="flex">
              <p className="opacity-70">Base APR</p>
              <p className="ml-2">{farm?.apr.reward.toFixed(2)}%</p>
            </li>
          </div>
        </div>
        <div className="flex flex-col gap-y-6 max-w-max">
          <p className="opacity-70">Rewards</p>
          {farm?.rewards.map((reward: RewardType, index: number) => (
            <div
              className="flex items-center justify-between gap-x-[61px]"
              key={index}
            >
              <div className="flex items-center">
                <div className="flex overflow-hidden ring-[3px] ring-baseBlueMid rounded-full bg-baseBlueMid mr-5">
                  <Image
                    src={`https://raw.githubusercontent.com/yield-bay/assets/main/list/${reward.asset}.png`}
                    alt={reward.asset}
                    width={48}
                    height={48}
                    className="rounded-full max-h-max"
                  />
                </div>
                <p>
                  {parseFloat(reward.amount.toFixed(1)).toLocaleString("en-US")}{" "}
                  {reward.asset.toUpperCase()}/DAY
                </p>
              </div>
              <p>
                {calcAssetPercentage(
                  reward,
                  calcTotalRewardValue(farm.rewards)
                )}
                %
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-col justify-start gap-y-6 max-w-max">
          <p className="opacity-70">TVL</p>
          <div className="flex flex-col">
            <p className="mb-4">
              <span className="mr-2 opacity-70">Total</span>
              {toDollarUnits(farm?.tvl)}
            </p>
            <p className="mb-2">
              <span className="mr-2 opacity-70">$1500</span>5000 USDC
            </p>
            <p>
              <span className="mr-2 opacity-70">$500</span>200 MOVR
            </p>
          </div>
        </div>
        <div className="hidden md:block border-2 border-[#314584] rounded-lg p-8 min-w-[321px]">
          <div className="flex justify-between mb-6">
            <p>Time Frame</p>
            <p>ROI</p>
          </div>
          <div className="flex flex-col gap-y-4 font-normal">
            <div className="flex justify-between">
              <p>1 day</p>
              <p>0.17%</p>
            </div>
            <div className="flex justify-between">
              <p>7 days</p>
              <p>1.18%</p>
            </div>
            <div className="flex justify-between">
              <p>30 days</p>
              <p>5.01%</p>
            </div>
            <div className="flex justify-between">
              <p>365 days</p>
              <p>60.94%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="w-full text-center py-10">Loading...</div>
  );
}
