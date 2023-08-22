// Library Imports
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAtom } from "jotai";
import { useQuery } from "@tanstack/react-query";
import { isConnectedDotAtom } from "@store/accountAtoms";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// Components, Hooks, Utils Imports
import {
  ExternalLinkIcon,
  MinusIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/outline";
import ShareFarm from "@components/Library/ShareFarm";
import Button from "@components/Library/Button";
// import CalculatorModal from "@components/Library/CalculatorModal";
import { APP_NAME, MANGATA_YIELDBAY_URL } from "@utils/constants";
import MetaTags from "@components/Common/metaTags/MetaTags";
import useSpecificFarm from "@hooks/useSpecificFarm";
import { fetchListicleFarms } from "@utils/api";
import {
  checkIfPoolSupported,
  farmURL,
  formatFarmType,
  formatFirstLetter,
  formatTokenSymbols,
  getLpTokenSymbol,
} from "@utils/farmListMethods";
import toDollarUnits from "@utils/toDollarUnits";
import {
  calcAssetPercentage,
  calcTotalRewardValue,
  calcUnclaimedRewardUSD,
  chainURL,
  protocolURL,
} from "@utils/farmPageMethods";
import {
  addrQueryAtom,
  idQueryAtom,
  positionsAtom,
  selectedFarmAtom,
} from "@store/atoms";
import {
  addLiqModalOpenAtom,
  removeLiqModalOpenAtom,
  stakingModalOpenAtom,
  unstakingModalOpenAtom,
  claimModalOpenAtom,
} from "@store/commonAtoms";
import { farmTypeDesc, calcUnclaimedReward } from "@utils/farmPageMethods";
import Tooltip from "@components/Library/Tooltip";
import { FarmType } from "@utils/types/common";
import Breadcrumb from "@components/Library/Breadcrumb";
import InfoContainer from "@components/Library/InfoContainer";
import clsx from "clsx";
import RewardsModal from "@components/Library/RewardsModal";
import useSpecificPosition from "@hooks/useSpecificPosition";
import { useSafetyscoreColor } from "@hooks/useSafetyscoreColor";
import { InformationCircleIcon } from "@heroicons/react/solid";
import Link from "next/link";

const FarmPage: NextPage = () => {
  const router = useRouter();
  const { isConnected } = useAccount();
  const [isConnectedDot] = useAtom(isConnectedDotAtom);

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
  const farms: FarmType[] = isLoading ? new Array<FarmType>() : farmsList!;

  const [idQuery, idQuerySet] = useAtom(idQueryAtom);
  const [addrQuery, addrQuerySet] = useAtom(addrQueryAtom);
  const [positions] = useAtom(positionsAtom);

  // Modal States
  const [addliqModalOpen, setAddLiqModalOpen] = useAtom(addLiqModalOpenAtom);
  const [removeLiqModalOpen, setRemoveLiqModalOpen] = useAtom(
    removeLiqModalOpenAtom
  );
  const [stakingModalOpen, setStakingModalOpen] = useAtom(stakingModalOpenAtom);
  const [unstakingModalOpen, setUnstakingModalOpen] = useAtom(
    unstakingModalOpenAtom
  );
  const [claimModalOpen, setClaimModalOpen] = useAtom(claimModalOpenAtom);
  const [selectedROIBtn, setSelectedROIBtn] = useState<1 | 7 | 30 | 365>(30);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState<boolean>(false);

  const [, setSelectedFarm] = useAtom(selectedFarmAtom);
  const [farm] = useSpecificFarm(farms, idQuery, addrQuery);
  const [farmPosition, hasPosition] = useSpecificPosition(positions, farm);
  const [unclaimedReward, setUnclaimedReward] = useState(0);
  const [unclaimedRewardUSD, setUnclaimedRewardUSD] = useState(0);

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
      const unclaimedRewardsUSD = parseFloat(
        calcUnclaimedRewardUSD(farmPosition.unclaimedRewards)
      );
      // console.log(
      //   "total unclaimed rewards",
      //   farmPosition.unclaimedRewards,
      //   farm?.asset.symbol,
      //   unclaimedRewards
      // );
      setUnclaimedReward(unclaimedRewards);
      setUnclaimedRewardUSD(unclaimedRewardsUSD);
    }
  }, [farmPosition]);

  useEffect(() => {
    if (
      !addliqModalOpen &&
      !removeLiqModalOpen &&
      !stakingModalOpen &&
      !unstakingModalOpen &&
      !claimModalOpen
    ) {
      setSelectedFarm(null);
    }
  }, [
    addliqModalOpen,
    removeLiqModalOpen,
    stakingModalOpen,
    unstakingModalOpen,
    claimModalOpen,
  ]);

  const safetyScore = parseFloat((farm?.safetyScore * 10).toFixed(1));
  const safetyScoreColor = useSafetyscoreColor(safetyScore);

  const isSupported = checkIfPoolSupported(farm);

  return !isLoading && idQuery ? (
    <div className="px-6 sm:px-[72px] text-[#475467] z-0">
      <MetaTags title={`Farm • ${APP_NAME}`} />
      <Breadcrumb tokenNames={tokenNames} />
      <div className="flex flex-col bg-white rounded-lg p-6 sm:pb-24 sm:pt-[69px] md:pb-24 sm:px-11 lg:pl-[51px] lg:pr-[76px]">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-14 sm:mb-11 gap-y-8 sm:gap-x-4">
          <p className="text-2xl text-[#454545] font-semibold leading-[29px] sm:mr-1">
            {getLpTokenSymbol(tokenNames)}
          </p>
          <ShareFarm farm={farm} />
          <div className="flex gap-x-2 items-center">
            <a href={farmURL(farm)} target="_blank" rel="noreferrer">
              <Button size="large">Visit Farm</Button>
            </a>
            {hasPosition &&
              farm?.chain.toLowerCase() == "mangata kusama" &&
              isConnectedDot && (
                <div className="ml-6 text-sm leading-5 font-semibold text-[#A3A3A3] text-left">
                  <p>
                    You can grow your {tokenNames[0]}-{tokenNames[1]} Tokens by
                  </p>
                  <Link
                    href={MANGATA_YIELDBAY_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="underline underline-offset-4"
                  >
                    Autocompounding here
                  </Link>
                </div>
              )}
            {!hasPosition &&
              isSupported &&
              (farm?.chain.toLowerCase() == "mangata kusama" ||
              farm?.protocol.toLowerCase() == "mangata x"
                ? isConnectedDot
                : isConnected) && (
                <Button
                  size="custom"
                  style="inline-flex justify-between items-center gap-x-2 bg-[#F0F0FF]"
                  onButtonClick={() => {
                    // console.log("farm in farmpage", farm);
                    setSelectedFarm(farm);
                    setAddLiqModalOpen(true);
                  }}
                >
                  <span>Add Liquidity</span>
                  <PlusIcon className="text-black h-4 w-4" />
                </Button>
              )}
          </div>
        </div>
        {/* Positions Row */}
        {hasPosition && (
          <div className="w-full flex flex-col lg:flex-row gap-y-6 rounded-xl sm:rounded-none sm:gap-x-3">
            <InfoContainer variant="default" className="w-full sm:w-1/2">
              <div className="flex flex-col gap-y-6 sm:flex-row justify-between">
                <div className="flex flex-col items-end sm:items-start gap-y-2">
                  <p className="text-sm leading-5">You hold</p>
                  <p className="text-2xl leading-7 font-bold text-[#101828]">
                    {toDollarUnits(
                      farm?.chain.toLowerCase() != "mangata kusama"
                        ? farmPosition.unstaked.amountUSD +
                            farmPosition.staked.amountUSD
                        : farmPosition.staked.amountUSD,
                      2
                    )}
                  </p>
                  <p className="p-2 bg-[#F5F5F5] rounded-lg max-w-fit text-base leading-5">
                    <span className="font-bold">
                      {(farm?.chain.toLowerCase() != "mangata kusama"
                        ? farmPosition.unstaked.amount +
                          farmPosition.staked.amount
                        : farmPosition.staked.amount
                      ).toFixed(2)}
                    </span>{" "}
                    LP
                  </p>
                </div>
                {farm?.chain.toLowerCase() != "mangata kusama" && (
                  <div className="flex flex-row justify-around sm:justify-start max-w-full sm:max-w-fit rounded-xl sm:rounded-none shadow-md sm:shadow-none border sm:border-0 border-[#EAECF0] p-3 sm:p-0 gap-x-3">
                    <div className="flex flex-col justify-between items-end">
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
                        {toDollarUnits(farmPosition?.unstaked?.amountUSD, 2)}
                      </p>
                      <p className="p-2 bg-[#F5F5F5] rounded-lg text-base leading-5">
                        <span className="font-bold">
                          {farmPosition?.unstaked?.amount.toFixed(2)}
                        </span>{" "}
                        LP
                      </p>
                    </div>
                    <div className="flex flex-col justify-between items-end">
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
                        {toDollarUnits(farmPosition?.staked?.amountUSD, 2)}
                      </p>
                      <p className="p-2 bg-[#F5F5F5] rounded-lg text-base leading-5">
                        <span className="font-bold">
                          {farmPosition?.staked?.amount.toFixed(2)}
                        </span>{" "}
                        LP
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </InfoContainer>
            <div className="w-full lg:w-1/2 flex flex-col sm:flex-row gap-3">
              <InfoContainer
                variant={unclaimedReward > 0 ? "tirtiary" : "secondary"}
                className="flex flex-row justify-between w-full sm:min-w-[300px]"
              >
                <div className="flex flex-col text-sm leading-5">
                  <p>Unclaimed</p>
                  <p>Rewards Worth</p>
                  <p className="mt-2 font-semibold text-2xl leading-7 text-[#101828]">
                    {unclaimedRewardUSD < 0.01 && unclaimedReward > 0
                      ? "<$0.01"
                      : `$${unclaimedRewardUSD}`}
                  </p>
                </div>
                <Button
                  size="large"
                  style="h-max"
                  onButtonClick={() => setIsRewardsModalOpen(true)}
                  disabled={unclaimedReward <= 0}
                >
                  Claim
                </Button>
              </InfoContainer>
              <div className="flex flex-col gap-y-3 justify-start w-full">
                <Button
                  size="large"
                  style="inline-flex justify-between items-center"
                  onButtonClick={() => {
                    setAddLiqModalOpen(true);
                    setSelectedFarm(farm);
                  }}
                >
                  <span>Add Liquidity</span>
                  <PlusIcon className="text-black h-4 w-4" />
                </Button>
                <Button
                  size="large"
                  style="inline-flex justify-between items-center"
                  onButtonClick={() => {
                    setRemoveLiqModalOpen(true);
                    setSelectedFarm(farm);
                  }}
                  disabled={
                    farm?.chain.toLowerCase() != "mangata kusama"
                      ? farmPosition.unstaked.amountUSD == 0
                      : farmPosition.staked.amountUSD == 0
                  }
                  tooltipText="You need to have liquidity first"
                >
                  <span>Remove Liquidity</span>
                  <MinusIcon className="text-black h-4 w-4" />
                </Button>
                {farm?.chain.toLowerCase() != "mangata kusama" ? (
                  <div className="inline-flex items-center gap-x-2">
                    <Button
                      size="large"
                      style="inline-flex justify-between items-center w-1/2"
                      onButtonClick={() => {
                        setStakingModalOpen(true);
                        setSelectedFarm(farm);
                      }}
                      disabled={farmPosition.unstaked.amountUSD == 0}
                      tooltipText="You need to have liquidity first"
                    >
                      <span>Stake</span>
                      <Image
                        src="/icons/ArrowLineUpIcon.svg"
                        alt="Stake"
                        height="16"
                        width="16"
                      />
                    </Button>
                    <Button
                      size="large"
                      style="inline-flex justify-between items-center w-1/2"
                      onButtonClick={() => {
                        setUnstakingModalOpen(true);
                        setSelectedFarm(farm);
                      }}
                      disabled={farmPosition.staked.amountUSD == 0}
                      tooltipText="You need to stake tokens first"
                    >
                      <span>Unstake</span>
                      <Image
                        className="transform rotate-180"
                        src="/icons/ArrowLineUpIcon.svg"
                        alt="Stake"
                        height="16"
                        width="16"
                      />
                    </Button>
                  </div>
                ) : (
                  <div className="inline-flex gap-x-2 text-[#4545A6] rounded-[7px] text-xs leading-5 font-semibold bg-[#E8E8FF] items-center px-5 py-[10px] w-full">
                    <InformationCircleIcon className="h-[18px] w-[18px]" />
                    <span className="text-xs">
                      Mangata LPs are staked by default
                    </span>
                  </div>
                )}
              </div>
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
                {toDollarUnits(farm?.tvl, 1)}
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
            {farm?.rewards.length > 0 && (
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
                        <td className="py-[14px] pl-6 underline underline-offset-4 decoration-dashed decoration-[#475467] cursor-default">
                          <Tooltip
                            label={<>{"$" + reward.valueUSD.toFixed(1)}</>}
                            placement="top"
                          >
                            <span>
                              {`${parseFloat(
                                reward.amount.toFixed(1)
                              ).toLocaleString("en-US")}/${
                                reward.freq === "Weekly" ? "WEEK" : "DAY"
                              }`}
                            </span>
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
            )}
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
              chef: farm?.chef,
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
