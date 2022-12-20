// React, Next Imports
import { useState, useEffect } from "react";
import { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAtom } from "jotai";

// Components, Hooks, Utils Imports
import { ArrowLeftIcon } from "@heroicons/react/solid";
import { ExternalLinkIcon } from "@heroicons/react/outline";
import ShareFarm from "@components/Library/ShareFarm";
import Button from "@components/Library/Button";
import CalculatorModal from "@components/Library/CalculatorModal";
import { APP_NAME } from "@utils/constants";
import MetaTags from "@components/metaTags/MetaTags";
import useSpecificFarm from "@hooks/useSpecificFarm";
import { fetchListicleFarms } from "@utils/api";
import {
  farmURL,
  formatFarmType,
  formatFirstLetter,
  formatTokenSymbols,
} from "@utils/farmListMethods";
import SafetyScorePill from "@components/Library/SafetyScorePill";
import toDollarUnits from "@utils/toDollarUnits";
import {
  calcAssetPercentage,
  calcTotalRewardValue,
  chainURL,
  protocolURL,
} from "@utils/farmPageMethods";
import { addrQueryAtom, idQueryAtom } from "@store/atoms";
import { farmTypeDesc } from "@utils/farmPageMethods";
import { trackEventWithProperty } from "@utils/analytics";
import Tooltip from "@components/Library/Tooltip";

type RewardType = {
  amount: number;
  asset: string;
  freq: string;
  valueUSD: number;
};

const FarmPage: NextPage = () => {
  const router = useRouter();

  // States
  const [farms, setFarms] = useState<any[]>([]);
  const [idQuery, idQuerySet] = useAtom(idQueryAtom);
  const [addrQuery, addrQuerySet] = useAtom(addrQueryAtom);
  const [calcOpen, setCalcOpen] = useState<boolean>(false);

  const [farm] = useSpecificFarm(farms, idQuery, addrQuery);
  const tokenNames: string[] = farm
    ? formatTokenSymbols(farm?.asset.symbol)
    : [""];
  const apr: number = farm ? farm?.apr.base + farm?.apr.reward : 0;

  useEffect(() => {
    idQuerySet(router.query.id);
    addrQuerySet(router.query.addr);
  }, [router]);

  // fetching farms
  useEffect(() => {
    fetchListicleFarms().then((res: any) => {
      setFarms(res.farms);
    });
  }, []);

  useEffect(() => {
    if (farm?.id) {
      trackEventWithProperty("farm-page-view", farm?.asset.symbol);
    }
  }, [farm]);

  const safetyScore = (farm?.safetyScore * 10).toFixed(1);

  return farm?.asset.symbol.length > 0 && idQuery ? (
    <div className="flex flex-col pb-20 sm:pb-24 md:pb-[141px] px-9 sm:px-11 lg:px-[120px] bg-hero-gradient">
      <MetaTags title={`Farm • ${APP_NAME}`} />
      {/* Back Arrow Icon */}
      <div className="opacity-70 w-max cursor-pointer mt-[6px] mb-11 sm:mb-14">
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
            <Button
              size="base"
              onButtonClick={() => {
                trackEventWithProperty("go-to-farm", {
                  protocol: farm?.protocol,
                });
              }}
            >
              Visit Farm
            </Button>
          </a>
          <Button
            size="base"
            style="md:hidden"
            onButtonClick={() => setCalcOpen(true)}
          >
            ROI
          </Button>
          <ShareFarm farm={farm} />
        </div>
      </div>
      {/* First Row */}
      <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-14 sm:gap-14 xl:flex flex-row justify-between mb-10 sm:mb-[107px] text-base font-bold leading-5 text-white">
        {/* TVL */}
        <div className="flex flex-col justify-start gap-y-6 max-w-max">
          <p className="opacity-70">TVL</p>
          <div className="flex flex-col gap-y-[19px]">
            <p className="text-blueSilver text-2xl leading-7 font-bold">
              {toDollarUnits(farm?.tvl)}
            </p>
          </div>
        </div>
        {/* APR */}
        <div className="flex flex-col gap-y-6 max-w-max">
          <p className="opacity-70">APR</p>
          <div className="flex flex-col gap-y-[19px]">
            <p className="text-blueSilver text-2xl leading-7 font-bold">
              {apr.toFixed(2)}%
            </p>
            <li className="flex">
              <p className="opacity-70">Reward APR</p>
              <p className="ml-2">{farm?.apr.reward.toFixed(2)}%</p>
            </li>
            <li className="flex">
              <p className="opacity-70">Base APR</p>
              <p className="ml-2">{farm?.apr.base.toFixed(2)}%</p>
            </li>
          </div>
        </div>
        {/* Rewards */}
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
                <Tooltip
                  content={<div>{"$" + reward.valueUSD.toFixed(1)}</div>}
                >
                  <p>
                    {parseFloat(reward.amount.toFixed(1)).toLocaleString(
                      "en-US"
                    )}{" "}
                    {reward.asset.toUpperCase()}/
                    {reward.freq === "Weekly" ? "WEEK" : "DAY"}
                  </p>
                </Tooltip>
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
        {/* Calculator */}
        <div className="hidden md:block border-2 border-[#314584] rounded-lg p-8 h-max min-w-[321px]">
          <div className="flex justify-between mb-6">
            <p>Time Frame</p>
            <p>ROI</p>
          </div>
          <div className="flex flex-col gap-y-4 font-normal">
            <div className="flex justify-between">
              <p>1 day</p>
              <p>{(apr / 365).toFixed(2)}%</p>
            </div>
            <div className="flex justify-between">
              <p>7 days</p>
              <p>{(apr / 52).toFixed(2)}%</p>
            </div>
            <div className="flex justify-between">
              <p>30 days</p>
              <p>{(apr / 12).toFixed(2)}%</p>
            </div>
            <div className="flex justify-between">
              <p>365 days</p>
              <p>{apr.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>
      {/* Second Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-14 sm:gap-16 lg:flex flex-row justify-between text-base font-bold leading-5 text-white">
        {/* Assets */}
        <div>
          <p className="opacity-70">Assets</p>
          <div className="flex flex-col items-start gap-y-3 mt-6">
            {farm?.asset.logos.map((asset: any, index: number) => (
              <div key={index} className="flex gap-x-5 items-center">
                <div className="flex rounded-full overflow-hidden ring-[3px] ring-[#01050D]">
                  <Image height={48} width={48} src={asset} alt={asset} />
                </div>
                <p>{asset.trim().slice(61, -4)}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Protocol */}
        <div className="flex flex-col gap-y-6">
          <p className="opacity-70">Protocol</p>
          <a
            href={protocolURL(farm?.protocol)}
            target="_blank"
            rel="noreferrer"
            className="sm:flex items-center gap-x-1 hover:underline"
          >
            <p>{formatFirstLetter(farm?.protocol)}</p>
            <ExternalLinkIcon className="w-4" />
          </a>
        </div>
        {/* Chain */}
        <div className="flex flex-col gap-y-6">
          <p className="opacity-70">Chain</p>
          <a
            href={chainURL(farm?.chain)}
            target="_blank"
            rel="noreferrer"
            className="sm:flex items-center gap-x-1 hover:underline"
          >
            <p>{formatFirstLetter(farm?.chain)}</p>
            <ExternalLinkIcon className="w-4" />
          </a>
        </div>
        {/* Farm Type */}
        <div className="flex flex-col gap-y-6 ">
          <p className="opacity-70 font-spaceGrotesk">Type</p>
          <p>{formatFarmType(farm?.farmType)}</p>
          <p className="font-medium leading-6 opacity-60 max-w-[306px]">
            {farmTypeDesc(farm?.farmType)}
          </p>
        </div>
        {/* Safety Score */}
        <div className="flex flex-col gap-y-6">
          <p className="opacity-70 font-spaceGrotesk">Safety Score</p>
          <div className="flex items-center justify-start">
            <span>{safetyScore}</span>
            <SafetyScorePill score={safetyScore} />
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
            The score is a relative indicator of the reliability of the farm
            compared to the other opportunities listed on YieldBay. The score is
            a calculated based on the current TVL, APR, and the rewards being
            dished out in the farm.
          </p>
        </div>
      </div>
      <CalculatorModal open={calcOpen} setOpen={setCalcOpen} apr={apr} />
    </div>
  ) : (
    <div className="flex-col gap-y-3 page-center font-spaceGrotesk bg-hero-gradient">
      <span className="animate-bounce opacity-70 text-4xl select-none">🌾</span>
      <span>loading farm...</span>
    </div>
  );
};

export default FarmPage;
