// Library Imports
import { useState, useEffect } from "react";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";

// Components, Hooks, Utils Imports
import {
  ExternalLinkIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/outline";
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
import { FarmType } from "@utils/types";
import Breadcrumb from "@components/Library/Breadcrumb";
import InfoContainer from "@components/Library/InfoContainer";
import clsx from "clsx";

const FarmPage: NextPage = () => {
  const router = useRouter();

  // Hooks
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
  const [idQuery, idQuerySet] = useAtom(idQueryAtom);
  const [addrQuery, addrQuerySet] = useAtom(addrQueryAtom);
  const [calcOpen, setCalcOpen] = useState<boolean>(false);
  const [hasPosition, setHasPosition] = useState<boolean>(true);
  const [selectedROIBtn, setSelectedROIBtn] = useState<1 | 7 | 30 | 365>(30);

  const [farm] = useSpecificFarm(farms, idQuery, addrQuery);
  const tokenNames: string[] = farm
    ? formatTokenSymbols(farm?.asset.symbol)
    : [""];
  const apr: number = farm ? farm?.apr.base + farm?.apr.reward : 0;

  useEffect(() => {
    idQuerySet(router.query.id);
    addrQuerySet(router.query.addr);
  }, [router]);

  useEffect(() => {
    if (farm?.id) {
      trackEventWithProperty("farm-page-view", farm?.asset.symbol);
    }
  }, [farm]);

  const safetyScore = (farm?.safetyScore * 10).toFixed(1);

  return !isLoading && idQuery ? (
    <div className="px-[72px] text-[#475467]">
      <MetaTags title={`Farm • ${APP_NAME}`} />
      <Breadcrumb tokenNames={tokenNames} />
      <div className="flex flex-col pb-20 border border-red-500 bg-white rounded-lg sm:pb-24 pt-[69px] md:pb-24 px-9 sm:px-11 lg:pl-[51px] lg:pr-[76px]">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-14 sm:mb-11 gap-y-8 sm:gap-x-9">
          <p className="text-2xl text-[#454545] font-semibold leading-[29px]">
            {tokenNames.map((tokenName, index) => (
              <span key={index}>
                {tokenName}
                {index !== tokenNames.length - 1 && "-"}
              </span>
            ))}
          </p>
          <div className="flex gap-x-7 items-center">
            <ShareFarm farm={farm} />
            <a href={farmURL(farm)} target="_blank" rel="noreferrer">
              <Button
                size="large"
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
          </div>
        </div>
        {/* Positions Row */}
        {hasPosition && (
          <div className="w-full inline-flex gap-x-3">
            <InfoContainer variant="default" className="w-1/2">
              <div className="flex flex-row justify-between">
                <div className="flex flex-col gap-y-2">
                  <p className="text-sm leading-5">You hold</p>
                  <p className="text-2xl leading-7 font-bold text-[#101828]">
                    $424
                  </p>
                  <p className="p-2 bg-[#F5F5F5] rounded-lg text-base leading-5">
                    <span className="font-bold">45.7</span> LP
                  </p>
                </div>
                <div className="flex flex-row gap-x-3">
                  <div className="flex flex-col items-end gap-y-1">
                    <p className="inline-flex items-center text-sm leading-5">
                      <Tooltip label="Idle balance" placement="top">
                        <QuestionMarkCircleIcon className="w-4 h-4 text-[#C0CBDC] mr-1" />
                      </Tooltip>
                      Idle
                    </p>
                    <p className="text-[#4D6089] font-semibold text-xl leading-7">
                      $434
                    </p>
                    <p className="p-2 bg-[#F5F5F5] rounded-lg text-base leading-5">
                      <span className="font-bold">45.7</span> LP
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-y-1">
                    <p className="inline-flex items-center text-sm leading-5">
                      <Tooltip label="Idel balance" placement="top">
                        <QuestionMarkCircleIcon className="w-4 h-4 text-[#C0CBDC] mr-1" />
                      </Tooltip>
                      Staked
                    </p>
                    <p className="text-[#4D6089] font-semibold text-xl leading-7">
                      $434
                    </p>
                    <p className="p-2 bg-[#F5F5F5] rounded-lg text-base leading-5">
                      <span className="font-bold">45.7</span> LP
                    </p>
                  </div>
                </div>
              </div>
            </InfoContainer>
            <div className="w-1/2">
              <InfoContainer
                variant="tirtiary"
                className="flex flex-row justify-between"
              >
                <div className="flex flex-col text-sm leading-5">
                  <p>Unclaimed</p>
                  <p>Rewards Worth</p>
                  <p className="mt-2 font-semibold text-2xl leading-7 text-[#101828]">
                    $43
                  </p>
                </div>
                <Button size="large" style="h-max">
                  Claim
                </Button>
              </InfoContainer>
            </div>
          </div>
        )}

        {/* Main Section */}
        <div className="w-full flex flex-row gap-x-3 mt-4">
          {/* TVL -- APR -- Safety Score */}
          <div className="w-1/2 flex flex-col gap-y-3">
            <InfoContainer variant="primary" className="flex flex-col gap-y-1">
              <p className="text-sm leading-5">TVL (Total Value Locked)</p>
              <p className="text-2xl leading-7 font-bold text-[#101828]">
                {toDollarUnits(farm?.tvl)}
              </p>
            </InfoContainer>
            {/* APR */}
            <div className="border border-[#EAECF0] shadow-sm rounded-xl">
              <div className="flex flex-col gap-y-1 pt-5 px-6 pb-4 bg-[#FAFAFF] border-b border-[#EAECF0]">
                <p className="text-sm leading-5">
                  APR (Average Percentage Yield)
                </p>
                <p className="text-2xl leading-7 font-semibold text-[#101828]">
                  {apr.toFixed(2)}%
                </p>
              </div>
              <div className="flex flex-col gap-y-2 py-4 px-6 bg-[#FAFAFF] shadow-sm shadow-gray-200 rounded-b-xl">
                <p className="inline-flex justify-between">
                  <span className="font-semibold text-base leading-7">
                    Reward APR
                  </span>
                  <span className="text-base leading-5">
                    {farm?.apr.reward.toFixed(2)}%
                  </span>
                </p>
                <p className="inline-flex justify-between">
                  <span className="font-semibold text-base leading-7">
                    Base APR
                  </span>
                  <span className="text-base leading-5">
                    {farm?.apr.base.toFixed(2)}%
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-y-4 px-6 py-5 mt-4">
                <div>
                  <p className="text-sm leading-5">
                    Return on Investment in the next{" "}
                    {selectedROIBtn == 1
                      ? "1 day"
                      : selectedROIBtn == 7
                      ? "7 days"
                      : selectedROIBtn == 30
                      ? "30 days"
                      : "1 year"}
                  </p>
                  <p className="text-2xl mt-1 leading-7 font-semibold text-[#101828]">
                    {(
                      apr /
                      (selectedROIBtn == 1
                        ? 365
                        : selectedROIBtn == 7
                        ? 52
                        : selectedROIBtn == 30
                        ? 12
                        : 1)
                    ).toFixed(2)}
                    %
                  </p>
                </div>
                <span className="isolate inline-flex w-full font-semibold leading-5 text-[#344054]">
                  <button
                    type="button"
                    onClick={() => setSelectedROIBtn(1)}
                    className={clsx(
                      "relative -ml-px inline-flex justify-center items-center rounded-l-lg w-1/4 py-[10px] ring-1 ring-inset ring-[#D0D5DD] hover:bg-[#F9FAFB] focus:z-10 focus:outline-none shadow-sm",
                      selectedROIBtn == 1 ? "bg-[#F9FAFB]" : "bg-white"
                    )}
                  >
                    1d
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedROIBtn(7)}
                    className={clsx(
                      "relative -ml-px inline-flex justify-center items-center w-1/4 py-[10px] ring-1 ring-inset ring-[#D0D5DD] hover:bg-[#F9FAFB] focus:z-10 focus:outline-none shadow-sm",
                      selectedROIBtn == 7 ? "bg-[#F9FAFB]" : "bg-white"
                    )}
                  >
                    7d
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedROIBtn(30)}
                    className={clsx(
                      "relative -ml-px inline-flex justify-center items-center w-1/4 py-[10px] ring-1 ring-inset ring-[#D0D5DD] hover:bg-[#F9FAFB] focus:z-10 focus:outline-none shadow-sm",
                      selectedROIBtn == 30 ? "bg-[#F9FAFB]" : "bg-white"
                    )}
                  >
                    30d
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedROIBtn(365)}
                    className={clsx(
                      "relative -ml-px inline-flex justify-center items-center rounded-r-lg w-1/4 py-[10px] ring-1 ring-inset ring-[#D0D5DD] hover:bg-[#F9FAFB] focus:z-10 focus:outline-none shadow-sm",
                      selectedROIBtn == 365 ? "bg-[#F9FAFB]" : "bg-white"
                    )}
                  >
                    1y
                  </button>
                </span>
              </div>
            </div>
            <div className="border border-[#EAECF0] shadow-sm rounded-xl">
              <div className="flex flex-col gap-y-1 py-5 px-6 border-b border-[#EAECF0]">
                <p className="font-semibold text-lg leading-7 text-[#101828]">
                  Safety Score
                </p>
                <p className="text-sm leading-5">
                  This farm is moderately safe.
                </p>
              </div>
              <div className="mx-auto p-6 border-b border-[#EAECF0]">
                <Image
                  src="/ProgressCircle.png"
                  alt="Safety Score Meter"
                  height={110}
                  width={200}
                  className="mx-auto"
                />
              </div>
              <div className="py-4 px-6 text-sm leading-5">
                The score is a relative indicator of the reliability of the farm
                compared to the other opportunities listed on YieldBay. The
                score is a calculated based on the current TVL, APR, and the
                rewards being dished out in the farm.
              </div>
            </div>
          </div>
          {/* Rewared Breakdown -- Protocol -- Chain -- Farm Type */}
          <div className="w-1/2 flex flex-col gap-y-3">
            <div className="rounded-xl border border-[#EAECF0]">
              <div className="pt-5 pb-4 px-6 bg-[#FAFAFF] rounded-t-xl border-b border-[#EAECF0]">
                <span>Reward Breakdown</span>
              </div>
              <table className="min-w-full">
                <thead className="border-b border-[#EAECF0]">
                  <tr className="text-xs leading-[18px]">
                    <th className="font-medium text-left w-1/3 py-[13px] pl-6">
                      Asset
                    </th>
                    <th className="font-medium text-left w-1/3 py-[13px] pl-6">
                      Amount and Frequency
                    </th>
                    <th className="font-medium text-left w-1/3 py-[13px] pl-6">
                      Percentage of the Rewards
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAECF0]">
                  {farm?.rewards.map((reward, index) => (
                    <tr className="font-medium text-sm leading-5" key={index}>
                      <td className="py-[14px] pl-6 inline-flex items-center">
                        <Image
                          src={`https://raw.githubusercontent.com/yield-bay/assets/main/list/${reward.asset}.png`}
                          alt={reward.asset}
                          width={24}
                          height={24}
                          className="rounded-full max-h-max"
                        />
                        <span className="ml-3">{reward.asset}</span>
                      </td>
                      <td className="py-[14px] pl-6 underline underline-offset-4 decoration-dotted	decoration-3 decoration-[#475467] cursor-default">
                        <Tooltip
                          label={<div>{"$" + reward.valueUSD.toFixed(1)}</div>}
                        >
                          <>
                            {parseFloat(
                              reward.amount.toFixed(1)
                            ).toLocaleString("en-US")}
                            /{reward.freq === "Weekly" ? "WEEK" : "DAY"}
                          </>
                        </Tooltip>
                      </td>
                      <td className="py-[14px] pl-6 ">75.76%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <InfoContainer variant="primary">
              <p className="text-sm leading-5">Protocol</p>
              <p className="text-2xl mt-1 leading-7 font-semibold text-[#101828]">
                <a
                  href={protocolURL(farm?.protocol)}
                  target="_blank"
                  rel="noreferrer"
                  className="sm:flex items-center gap-x-1 hover:underline"
                >
                  <p>{formatFirstLetter(farm?.protocol)}</p>
                  <ExternalLinkIcon className="w-4" />
                </a>
              </p>
            </InfoContainer>
            <InfoContainer variant="primary">
              <p className="text-sm leading-5">Chain</p>
              <p className="text-2xl mt-1 leading-7 font-semibold text-[#101828]">
                <a
                  href={chainURL(farm?.chain)}
                  target="_blank"
                  rel="noreferrer"
                  className="sm:flex items-center gap-x-1 hover:underline"
                >
                  <p>{formatFirstLetter(farm?.chain)}</p>
                  <ExternalLinkIcon className="w-4" />
                </a>
              </p>
            </InfoContainer>
            <div className="rounded-lg border-[#EAECF0] bg-[#FAFAFF]">
              <div className="pt-5 pb-4 px-6 border-b border-[#EAECF0]">
                <p className="text-sm leading-5">Type</p>
                <p className="text-2xl mt-1 leading-7 font-semibold text-[#101828]">
                  <p>{formatFarmType(farm?.farmType)}</p>
                </p>
              </div>
              <div className="px-6 pt-4 pb-5">
                <p className="max-w-xs text-sm leading-5">
                  High impermanent loss risk unless the assets in the LP token
                  are pegged to the same price. For example, GLMR-ETH LP has
                  high IL risk, while USDC-BUSD LP has very low IL risk.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex-col gap-y-3 page-center font-spaceGrotesk bg-hero-gradient">
      <span className="animate-bounce opacity-70 text-4xl select-none">🌾</span>
      <span>loading farm...</span>
    </div>
  );
};

export default FarmPage;

/* Back Arrow Icon */
/* <div className="opacity-70 w-max cursor-pointer mt-[6px] mb-11 sm:mb-14">
        <Link href="/">
          <div className="flex flex-row gap-x-[14px]">
            <ArrowLeftIcon className="w-[18px]" />
            <span className="font-semibold text-lg sm:text-xl leading-5 sm:leading-6 select-none">
              back
            </span>
          </div>
        </Link>
      </div> */

//     {/* First Row */}
//     <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-14 sm:gap-14 xl:flex flex-row justify-between mb-10 sm:mb-[107px] text-base font-bold leading-5">
//     {/* TVL */}
//     <div className="flex flex-col justify-start gap-y-6 max-w-max">
//       <p className="opacity-70">TVL</p>
//       <div className="flex flex-col gap-y-[19px]">
//         <p className="text-blueSilver text-2xl leading-7 font-bold">
//           {toDollarUnits(farm?.tvl)}
//         </p>
//       </div>
//     </div>
//     {/* APR */}
//     <div className="flex flex-col gap-y-6 max-w-max">
//       <p className="opacity-70">APR</p>
//       <div className="flex flex-col gap-y-[19px]">
//         <p className="text-blueSilver text-2xl leading-7 font-bold">
//           {apr.toFixed(2)}%
//         </p>
//         <li className="flex">
//           <p className="opacity-70">Reward APR</p>
//           <p className="ml-2">{farm?.apr.reward.toFixed(2)}%</p>
//         </li>
//         <li className="flex">
//           <p className="opacity-70">Base APR</p>
//           <p className="ml-2">{farm?.apr.base.toFixed(2)}%</p>
//         </li>
//       </div>
//     </div>
//     {/* Rewards */}
//     <div className="flex flex-col gap-y-6 max-w-max">
//       <p className="opacity-70">Rewards</p>
//       {farm?.rewards.map((reward, index) => (
//         <div
//           className="flex items-center justify-between gap-x-[61px]"
//           key={index}
//         >
//           <div className="flex items-center">
//             <div className="flex overflow-hidden ring-[3px] ring-baseBlueMid rounded-full bg-baseBlueMid mr-5">
//               <Image
//                 src={`https://raw.githubusercontent.com/yield-bay/assets/main/list/${reward.asset}.png`}
//                 alt={reward.asset}
//                 width={48}
//                 height={48}
//                 className="rounded-full max-h-max"
//               />
//             </div>
//             <Tooltip
//               label={<div>{"$" + reward.valueUSD.toFixed(1)}</div>}
//             >
//               <p>
//                 {parseFloat(reward.amount.toFixed(1)).toLocaleString(
//                   "en-US"
//                 )}{" "}
//                 {reward.asset.toUpperCase()}/
//                 {reward.freq === "Weekly" ? "WEEK" : "DAY"}
//               </p>
//             </Tooltip>
//           </div>
//           <p>
//             {calcAssetPercentage(
//               reward,
//               calcTotalRewardValue(farm.rewards)
//             )}
//             %
//           </p>
//         </div>
//       ))}
//     </div>
//     {/* Calculator */}
//     <div className="hidden md:block border-2 border-[#314584] rounded-lg p-8 h-max min-w-[321px]">
//       <div className="flex justify-between mb-6">
//         <p>Time Frame</p>
//         <p>ROI</p>
//       </div>
//       <div className="flex flex-col gap-y-4 font-normal">
//         <div className="flex justify-between">
//           <p>1 day</p>
//           <p>{(apr / 365).toFixed(2)}%</p>
//         </div>
//         <div className="flex justify-between">
//           <p>7 days</p>
//           <p>{(apr / 52).toFixed(2)}%</p>
//         </div>
//         <div className="flex justify-between">
//           <p>30 days</p>
//           <p>{(apr / 12).toFixed(2)}%</p>
//         </div>
//         <div className="flex justify-between">
//           <p>365 days</p>
//           <p>{apr.toFixed(2)}%</p>
//         </div>
//       </div>
//     </div>
//   </div>
//   {/* Second Row */}
//   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-14 sm:gap-16 lg:flex flex-row justify-between text-base font-bold leading-5">
//     {/* Assets */}
//     <div>
//       <p className="opacity-70">Assets</p>
//       <div className="flex flex-col items-start gap-y-3 mt-6">
//         {farm?.asset.logos.map((logo, index) => (
//           <div key={index} className="flex gap-x-5 items-center">
//             <div className="flex rounded-full overflow-hidden ring-[3px] ring-[#01050D]">
//               <Image height={48} width={48} src={logo} alt={logo} />
//             </div>
//             <p>{logo.trim().slice(61, -4)}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//     {/* Protocol */}
//     <div className="flex flex-col gap-y-6">
//       <p className="opacity-70">Protocol</p>
//       <a
//         href={protocolURL(farm?.protocol)}
//         target="_blank"
//         rel="noreferrer"
//         className="sm:flex items-center gap-x-1 hover:underline"
//       >
//         <p>{formatFirstLetter(farm?.protocol)}</p>
//         <ExternalLinkIcon className="w-4" />
//       </a>
//     </div>
//     {/* Chain */}
//     <div className="flex flex-col gap-y-6">
//       <p className="opacity-70">Chain</p>
//       <a
//         href={chainURL(farm?.chain)}
//         target="_blank"
//         rel="noreferrer"
//         className="sm:flex items-center gap-x-1 hover:underline"
//       >
//         <p>{formatFirstLetter(farm?.chain)}</p>
//         <ExternalLinkIcon className="w-4" />
//       </a>
//     </div>
//     {/* Farm Type */}
//     <div className="flex flex-col gap-y-6 ">
//       <p className="opacity-70 font-spaceGrotesk">Type</p>
//       <p>{formatFarmType(farm?.farmType)}</p>
//       <p className="font-medium leading-6 opacity-60 max-w-[306px]">
//         {farmTypeDesc(farm?.farmType)}
//       </p>
//     </div>
//     {/* Safety Score */}
//     <div className="flex flex-col gap-y-6">
//       <p className="opacity-70 font-spaceGrotesk">Safety Score</p>
//       <div className="flex items-center justify-start">
//         <span>{safetyScore}</span>
//         <SafetyScorePill score={safetyScore} />
//       </div>
//       {/* Safety Score Scale */}
//       <div className="max-w-[326px]">
//         <div className="w-full h-4 bg-white rounded-lg bg-safety-scale" />
//         <div className="flex justify-between mt-[7px]">
//           <span>0</span>
//           <span>10</span>
//         </div>
//       </div>
//       <p className="font-medium leading-6 opacity-60 max-w-[306px]">
//         The score is a relative indicator of the reliability of the farm
//         compared to the other opportunities listed on YieldBay. The score
//         is a calculated based on the current TVL, APR, and the rewards
//         being dished out in the farm.
//       </p>
//     </div>
//   </div>
//   <CalculatorModal open={calcOpen} setOpen={setCalcOpen} apr={apr} />
// </div>
