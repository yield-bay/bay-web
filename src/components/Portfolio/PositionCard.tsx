import { FC, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import {
  ChevronDownIcon,
  MinusIcon,
  PlusIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/outline";
import Tooltip from "@components/Library/Tooltip";
import FarmAssets from "@components/Library/FarmAssets";
import { formatFirstLetter } from "@utils/farmListMethods";
import {
  calcAssetPercentage,
  calcTotalRewardValue,
} from "@utils/farmPageMethods";
import { FarmType, PortfolioPositionType } from "@utils/types/common";
import toDollarUnits from "@utils/toDollarUnits";
import toUnits from "@utils/toUnits";
import Image from "next/image";
import Button from "@components/Library/Button";
import { useAtom } from "jotai";
import { InformationCircleIcon } from "@heroicons/react/solid";
import {
  addLiqModalOpenAtom,
  removeLiqModalOpenAtom,
  stakingModalOpenAtom,
  unstakingModalOpenAtom,
} from "@store/commonAtoms";
import { selectedFarmAtom } from "@store/atoms";

interface Props {
  tokenNames: string[];
  thisFarm: FarmType;
  position: PortfolioPositionType;
}

const PositionCard: FC<Props> = ({ tokenNames, thisFarm, position }) => {
  const [showRewards, setShowRewards] = useState<boolean>(false);
  // Modal States
  const [, setAddLiqModalOpen] = useAtom(addLiqModalOpenAtom);
  const [, setRemoveLiqModalOpen] = useAtom(removeLiqModalOpenAtom);
  const [, setStakingModalOpen] = useAtom(stakingModalOpenAtom);
  const [, setUnstakingModalOpen] = useAtom(unstakingModalOpenAtom);
  const [, setSelectedFarm] = useAtom(selectedFarmAtom);

  return (
    <li className="col-span-1 divide-y border border-[#EAECF0] h-fit divide-[#EAECF0] z-0 p-6 max-w-sm rounded-xl bg-white shadow">
      <div className="flex-1 flex flex-row justify-between truncate mb-6">
        <div className="flex w-full flex-col space-y-4 items-start truncate">
          <FarmAssets logos={thisFarm?.asset.logos} />
          <div className="">
            <p className="text-[#101828] font-medium text-xl leading-5">
              {tokenNames.map((tokenName, index) => (
                <span key={index}>
                  {tokenName}
                  {index !== tokenNames.length - 1 && "-"}
                </span>
              ))}
            </p>
            <p className="mt-1 leading-5">
              {formatFirstLetter(position.protocol)} on{" "}
              {formatFirstLetter(position.chain)}
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-row justify-between py-6">
        <div className="flex flex-col gap-y-2">
          <p className="truncate text-sm leading-5">Total Holdings</p>
          <p className="text-2xl leading-7 font-semibold text-[#101828]">
            {toDollarUnits(
              position.unstaked.amountUSD + position.staked.amountUSD,
              2
            )}
          </p>
          <p className="inilne-flex p-2 bg-[#F5F5F5] rounded-lg text-base leading-5 max-w-fit">
            <span className="font-bold">
              {toUnits(position.unstaked.amount + position.staked.amount, 2)}
            </span>{" "}
            LP
          </p>
        </div>
        {(position?.chain.toLowerCase() != "mangata kusama" ||
          position?.protocol.toLowerCase() != "mangata x") && (
          <div className="flex flex-row gap-x-3">
            <div className="flex flex-col justify-between items-end">
              <p className="inline-flex items-center text-sm leading-5">
                <Tooltip label="Not staked in a Farm" placement="top">
                  <QuestionMarkCircleIcon className="hidden sm:block w-4 h-4 text-[#C0CBDC] mr-1" />
                </Tooltip>
                Idle
              </p>
              <p className="text-[#4D6089] font-semibold text-xl leading-7">
                {toDollarUnits(position?.unstaked?.amountUSD, 2)}
              </p>
              <p className="inline-flex gap-x-1 p-2 bg-[#F5F5F5] rounded-lg text-base leading-5">
                <span className="font-bold">
                  {toUnits(position?.unstaked.amount, 2)}
                </span>{" "}
                <span>LP</span>
              </p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <p className="inline-flex items-center text-sm leading-5">
                <Tooltip label="Staked in a Farm" placement="top">
                  <QuestionMarkCircleIcon className="hidden sm:block w-4 h-4 text-[#C0CBDC] mr-1" />
                </Tooltip>
                Staked
              </p>
              <p className="text-[#4D6089] font-semibold text-xl leading-7">
                {toDollarUnits(position?.staked.amountUSD, 2)}
              </p>
              <p className="inline-flex gap-x-1 p-2 bg-[#F5F5F5] rounded-lg text-base leading-5">
                <span className="font-bold">
                  {toUnits(position?.staked.amount, 2)}
                </span>
                <span>LP</span>
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-y-4 pt-6">
        <div className="flex flex-col gap-y-3 justify-between w-full">
          <Button
            size="large"
            style="inline-flex justify-between items-center"
            onButtonClick={() => {
              setAddLiqModalOpen(true);
              setSelectedFarm(thisFarm);
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
              setSelectedFarm(thisFarm);
            }}
            disabled={position.unstaked.amountUSD < 0.01}
            tooltipText="You need to have liquidity first"
          >
            <span>Remove Liquidity</span>
            <MinusIcon className="text-black h-4 w-4" />
          </Button>
          {position?.chain.toLowerCase() != "mangata kusama" ||
          position?.protocol.toLowerCase() != "mangata x" ? (
            <div className="inline-flex items-center gap-x-2">
              <Button
                size="large"
                style="inline-flex justify-between items-center w-1/2"
                onButtonClick={() => {
                  setStakingModalOpen(true);
                  setSelectedFarm(thisFarm);
                }}
                disabled={position.unstaked.amountUSD < 0.01}
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
                  setSelectedFarm(thisFarm);
                }}
                disabled={position.staked.amountUSD < 0.01}
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
              <span className="text-xs">Mangata LPs are staked by default</span>
            </div>
          )}
        </div>
        <div>
          <button
            className={clsx(
              "w-full inline-flex justify-between items-center bg-[#EDEDED] py-2 px-3",
              showRewards ? "rounded-t-lg" : "rounded-lg"
            )}
            onClick={() => setShowRewards(!showRewards)}
          >
            <p>Reward Breakdown</p>
            <ChevronDownIcon
              className={clsx(
                "h-[19px] transition-all",
                showRewards && "transform rotate-180"
              )}
            />
          </button>
          <div
            className={clsx(
              "rounded-b-xl border border-[#EAECF0]",
              !showRewards && "hidden"
            )}
          >
            <table className="min-w-full">
              <thead className="border-b border-[#EAECF0]">
                <tr className="text-xs leading-[18px]">
                  <th className="font-medium text-left w-1/3 py-[13px] pl-6">
                    Asset
                  </th>
                  <th className="font-medium text-left w-1/3 py-[13px] pl-6">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0]">
                {thisFarm?.rewards.map((reward, index) => (
                  <tr className="font-medium text-sm leading-5" key={index}>
                    <td className="py-[14px] pl-6 cursor-default">
                      <Tooltip
                        label={<>{"$" + reward.valueUSD.toFixed(1)}</>}
                        placement="top"
                      >
                        <span className="underline underline-offset-4 decoration-dashed">
                          {`${parseFloat(
                            reward.amount.toFixed(1)
                          ).toLocaleString("en-US")} ${reward.asset}/${
                            reward.freq == "Weekly" ? "WEEK" : "DAY"
                          }`}
                        </span>
                      </Tooltip>
                    </td>
                    <td className="py-[14px] text-left pl-6">
                      {calcAssetPercentage(
                        reward,
                        calcTotalRewardValue(thisFarm.rewards)
                      )}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row items-center text-base leading-5 justify-center py-6 bg-[#EDEDFF] rounded-lg">
          <span className="font-medium">
            Staked at {(thisFarm?.apr.base + thisFarm?.apr.reward).toFixed(2)}%
            APY
          </span>
          <Link
            // href={`/farm/${position.id}?addr=${position.address}`}
            href={`/farm/${thisFarm?.id}?addr=${thisFarm?.asset.address}`}
            className="font-bold underline underline-offset-2"
          >
            View Farm
          </Link>
        </div>
      </div>
    </li>
  );
};

export default PositionCard;
