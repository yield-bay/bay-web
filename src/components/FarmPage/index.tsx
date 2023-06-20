// Library Imports
import { useState, useEffect } from "react";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// Components, Hooks, Utils Imports
import {
  ExternalLinkIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/outline";
import ShareFarm from "@components/Library/ShareFarm";
import Button from "@components/Library/Button";
import CalculatorModal from "@components/Library/CalculatorModal";
import { APP_NAME } from "@utils/constants";
import MetaTags from "@components/Common/metaTags/MetaTags";
import useSpecificFarm from "@hooks/useSpecificFarm";
import { fetchListicleFarms } from "@utils/api";
import {
  farmURL,
  formatFarmType,
  formatFirstLetter,
  formatTokenSymbols,
} from "@utils/farmListMethods";
import toDollarUnits from "@utils/toDollarUnits";
import {
  calcAssetPercentage,
  calcTotalRewardValue,
  chainURL,
  protocolURL,
} from "@utils/farmPageMethods";
import { addrQueryAtom, idQueryAtom, positionsAtom } from "@store/atoms";
import { farmTypeDesc, calcUnclaimedReward } from "@utils/farmPageMethods";
import { trackEventWithProperty } from "@utils/analytics";
import Tooltip from "@components/Library/Tooltip";
import { FarmType } from "@utils/types";
import Breadcrumb from "@components/Library/Breadcrumb";
import InfoContainer from "@components/Library/InfoContainer";
import clsx from "clsx";
import RewardsModal from "@components/Library/RewardsModal";
import useSpecificPosition from "@hooks/useSpecificPosition";
import { useSafetyscoreColor } from "@hooks/useSafetyscoreColor";

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
  const [positions] = useAtom(positionsAtom);

  // const [calcOpen, setCalcOpen] = useState<boolean>(false);
  const [selectedROIBtn, setSelectedROIBtn] = useState<1 | 7 | 30 | 365>(30);

  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState<boolean>(false);

  const [farm] = useSpecificFarm(farms, idQuery, addrQuery);
  const [farmPosition, hasPosition] = useSpecificPosition(positions, farm);
  const [unclaimedReward, setUnclaimedReward] = useState(0);

  const tokenNames: string[] = farm
    ? formatTokenSymbols(farm?.asset.symbol)
    : [""];
  const apr: number = farm ? farm?.apr.base + farm?.apr.reward : 0;

  useEffect(() => {
    idQuerySet(router.query.id);
    addrQuerySet(router.query.addr);
  }, [router]);

  useEffect(() => {
    if (!!farmPosition) {
      const unclaimedRewards = parseFloat(
        calcUnclaimedReward(farmPosition.unclaimedRewards)
      );
      setUnclaimedReward(unclaimedRewards);
    }
  }, [farmPosition]);

  // useEffect(() => {
  //   if (farm?.id) {
  //     trackEventWithProperty("farm-page-view", farm?.asset.symbol);
  //   }
  // }, [farm]);

  const safetyScore = parseFloat((farm?.safetyScore * 10).toFixed(1));
  const safetyScoreColor = useSafetyscoreColor(safetyScore);

  return !isLoading && idQuery ? (
    <div className="px-6 sm:px-[72px] text-[#475467] z-0">
      <MetaTags title={`Farm • ${APP_NAME}`} />
      <Breadcrumb tokenNames={tokenNames} />
      <div className="flex flex-col bg-white rounded-lg p-6 sm:pb-24 sm:pt-[69px] md:pb-24 sm:px-11 lg:pl-[51px] lg:pr-[76px]">
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
          </div>
        </div>
        {/* Positions Row */}
        {hasPosition && (
          <div className="w-full flex flex-col sm:flex-row gap-y-6 rounded-xl sm:rounded-none shadow-md sm:shadow-none sm:gap-x-3">
            <InfoContainer variant="default" className="w-full sm:w-1/2">
              <div className="flex flex-col gap-y-6 sm:flex-row justify-between">
                <div className="flex flex-col gap-y-2">
                  <p className="text-sm leading-5">You hold</p>
                  <p className="text-2xl leading-7 font-bold text-[#101828]">
                    $
                    {(
                      farmPosition.unstaked.amountUSD +
                      farmPosition.staked.amountUSD
                    ).toFixed(2)}
                  </p>
                  <p className="p-2 bg-[#F5F5F5] rounded-lg max-w-fit text-base leading-5">
                    <span className="font-bold">
                      {(
                        farmPosition.unstaked.amount +
                        farmPosition.staked.amount
                      ).toFixed(2)}
                    </span>{" "}
                    LP
                  </p>
                </div>
                <div className="flex flex-row max-w-fit rounded-xl sm:rounded-none shadow-md sm:shadow-none border sm:border-0 border-[#EAECF0] p-3 sm:p-0 gap-x-3">
                  <div className="flex flex-col items-end gap-y-1">
                    <p className="inline-flex items-center text-sm leading-5">
                      <Tooltip
                        label={<span>Not Staked in a Farm</span>}
                        placement="top"
                      >
                        <QuestionMarkCircleIcon className="w-4 h-4 text-[#C0CBDC] mr-1" />
                      </Tooltip>
                      Idle
                    </p>
                    <p className="text-[#4D6089] font-semibold text-xl leading-7">
                      ${farmPosition?.unstaked?.amountUSD.toFixed(2)}
                    </p>
                    <p className="p-2 bg-[#F5F5F5] rounded-lg text-base leading-5">
                      <span className="font-bold">
                        {farmPosition?.unstaked?.amount.toFixed(2)}
                      </span>{" "}
                      LP
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-y-1">
                    <p className="inline-flex items-center text-sm leading-5">
                      <Tooltip
                        label={<span>Staked in a Farm</span>}
                        placement="top"
                      >
                        <QuestionMarkCircleIcon className="w-4 h-4 text-[#C0CBDC] mr-1" />
                      </Tooltip>
                      Staked
                    </p>
                    <p className="text-[#4D6089] font-semibold text-xl leading-7">
                      ${farmPosition?.staked?.amount.toFixed(2)}
                    </p>
                    <p className="p-2 bg-[#F5F5F5] rounded-lg text-base leading-5">
                      <span className="font-bold">
                        {farmPosition?.staked?.amount.toFixed(2)}
                      </span>{" "}
                      LP
                    </p>
                  </div>
                </div>
              </div>
            </InfoContainer>
            <div className="w-full sm:w-1/2 ">
              <InfoContainer
                variant={unclaimedReward > 0 ? "tirtiary" : "secondary"}
                className="flex flex-row justify-between"
              >
                <div className="flex flex-col text-sm leading-5">
                  <p>Unclaimed</p>
                  <p>Rewards Worth</p>
                  <p className="mt-2 font-semibold text-2xl leading-7 text-[#101828]">
                    ${unclaimedReward}
                  </p>
                </div>
                {unclaimedReward >= 0.01 && (
                  <Button
                    size="large"
                    style="h-max"
                    onButtonClick={() => setIsRewardsModalOpen(true)}
                  >
                    Claim
                  </Button>
                )}
              </InfoContainer>
            </div>
          </div>
        )}

        {/* Main Section */}
        <div className="w-full flex flex-col sm:flex-row gap-x-3 mt-4">
          {/* TVL -- APR -- Safety Score */}
          <div className="w-full sm:w-1/2 flex flex-col gap-y-3">
            <InfoContainer variant="primary" className="flex flex-col gap-y-1">
              <p className="text-sm leading-5">TVL (Total Value Locked)</p>
              <p className="text-2xl leading-7 font-bold text-[#101828]">
                {toDollarUnits(farm?.tvl)}
              </p>
            </InfoContainer>
            {/* APR */}
            <div className="border border-[#EAECF0] shadow-sm rounded-xl overflow-hidden">
              <div className="flex flex-col gap-y-1 pt-5 px-6 pb-4 bg-[#FAFAFF] border-b border-[#EAECF0]">
                <p className="text-sm leading-5">
                  APR (Average Percentage Yield)
                </p>
                <p className="text-2xl leading-7 font-semibold text-[#101828]">
                  {apr.toFixed(3)}%
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
                    ).toFixed(3)}
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
                  This farm is{" "}
                  {safetyScore >= 6
                    ? "highly safe"
                    : safetyScore >= 4
                    ? "moderately safe"
                    : "risky"}
                  .
                </p>
              </div>
              <div className="relative w-full p-6">
                <div className="w-[200px] mx-auto h-[100px]">
                  <CircularProgressbar
                    value={safetyScore}
                    className="relative"
                    minValue={0}
                    maxValue={10}
                    circleRatio={0.5}
                    styles={buildStyles({
                      rotation: 0.75,
                      textSize: "30px",
                      pathColor: safetyScoreColor,
                      trailColor: "#EAECF0",
                    })}
                  />
                </div>
                <div className="absolute left-0 right-0 bottom-8 mx-auto max-w-fit text-3xl font-semibold leading-[38px] text-[#101828]">
                  {safetyScore}
                </div>
              </div>
              <div className="py-4 px-6 text-sm leading-5 border-t border-[#EAECF0]">
                The score is a relative indicator of the reliability of the farm
                compared to the other opportunities listed on YieldBay. The
                score is a calculated based on the current TVL, APR, and the
                rewards being dished out in the farm.
              </div>
            </div>
          </div>
          {/* Rewared Breakdown -- Protocol -- Chain -- Farm Type */}
          <div className="flex flex-col gap-y-3 mt-3 sm:mt-0 w-full sm:w-1/2">
            <div className="hidden base:block rounded-xl border border-[#EAECF0]">
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
                    <tr
                      className={clsx(
                        "font-medium text-sm leading-5",
                        reward.amount == 0 && "hidden"
                      )}
                      key={index}
                    >
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
                      <td className="py-[14px] pl-6 underline underline-offset-4 decoration-dotted decoration-3 decoration-[#475467] cursor-default">
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
                      <td className="py-[14px] pl-6">
                        {calcAssetPercentage(
                          reward,
                          calcTotalRewardValue(farm.rewards)
                        )}
                        %
                      </td>
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
                  className="flex items-center gap-x-1 hover:underline"
                >
                  <span>{formatFirstLetter(farm?.protocol)}</span>
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
                  className="flex items-center gap-x-1 hover:underline"
                >
                  <span>{formatFirstLetter(farm?.chain)}</span>
                  <ExternalLinkIcon className="w-4" />
                </a>
              </p>
            </InfoContainer>
            <div className="rounded-lg border border-[#EAECF0] bg-[#FAFAFF] overflow-hidden">
              <div className="pt-5 pb-4 px-6 border-b border-[#EAECF0]">
                <p className="text-sm leading-5">Type</p>
                <p className="text-2xl mt-1 leading-7 font-semibold text-[#101828]">
                  {formatFarmType(farm?.farmType)}
                </p>
              </div>
              <div className="px-6 pt-4 pb-5">
                <p className="text-sm leading-5">
                  {farmTypeDesc(farm?.farmType)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {hasPosition && (
        <RewardsModal
          open={isRewardsModalOpen}
          setOpen={setIsRewardsModalOpen}
          positions={[
            {
              chain: farm?.chain,
              protocol: farm?.protocol,
              address: farm?.asset.address,
              id: farm?.id,
              lpSymbol: farm?.asset.symbol,
              ...farmPosition,
            },
          ]}
        />
      )}
    </div>
  ) : (
    <div className="flex-col gap-y-3 page-center">
      <span className="animate-bounce opacity-70 text-4xl select-none">🌾</span>
      <span>loading farm...</span>
    </div>
  );
};

export default FarmPage;
