import { FC, memo, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAtom } from "jotai";
import clsx from "clsx";
import { useAccount } from "wagmi";

// Utility Imports
import toDollarUnits from "@utils/toDollarUnits";
import {
  formatFirstLetter,
  formatTokenSymbols,
  formatFarmType,
  checkIfPoolSupported,
} from "@utils/farmListMethods";
import { FarmType } from "@utils/types";
import { dotAccountAtom, isConnectedDotAtom } from "@store/accountAtoms";

// Component Imports
import Button from "@components/Library/Button";
import FarmAssets from "@components/Library/FarmAssets";
import FarmBadge from "@components/Library/FarmBadge";
import ShareFarm from "@components/Library/ShareFarm";
import Rewards from "@components/Library/Rewards";
import SafetyScorePill from "@components/Library/SafetyScorePill";
import Tooltip from "@components/Library/Tooltip";
import { evmPosLoadingAtom, subPosLoadingAtom } from "@store/commonAtoms";

interface Props {
  farms: FarmType[];
  positions: any;
}

const FarmsList: FC<Props> = ({ farms, positions }) => {
  const router = useRouter();
  const [isEvmPosLoading] = useAtom(evmPosLoadingAtom);
  const [isSubPosLoading] = useAtom(subPosLoadingAtom);

  // Users wallet
  const { isConnected } = useAccount();
  const [isConnectedDot] = useAtom(isConnectedDotAtom);

  return (
    <>
      {farms.map((farm: FarmType, index) => {
        const tokenNames = formatTokenSymbols(farm?.asset.symbol);
        const safetyScore = (farm?.safetyScore * 10).toFixed(1);
        const position =
          positions[
            `${farm.chain}-${farm.protocol}-${farm.chef}-${farm.id}-${farm.asset.symbol}`
          ];
        const currentPosition =
          position?.unstaked.amountUSD + position?.staked.amountUSD ??
          undefined;

        return (
          <tr
            key={`${farm.asset.address}-${farm.tvl}`}
            className={clsx(index % 2 == 0 ? "bg-[#FAFAFF]" : "bg-white")}
          >
            <td className="whitespace-nowrap max-w-[288px] py-4 text-sm pl-8 md:pl-14 lg:pl-12 rounded-bl-xl">
              <div className="flex flex-col gap-y-4">
                <div className="inline-flex items-center gap-x-4">
                  <FarmAssets logos={farm?.asset.logos} />
                  <FarmBadge type={formatFarmType(farm?.farmType)} />
                  <Image
                    src="/icons/umbrella.svg"
                    alt="supported farm"
                    height={20}
                    width={20}
                    className={clsx(
                      "mr-2",
                      !checkIfPoolSupported(farm) && "saturate-0"
                    )}
                  />
                </div>
                <div className="text-[#101828] font-medium text-sm leading-5">
                  {tokenNames.map((tokenName, index) => (
                    <span key={index}>
                      {tokenName}
                      {index !== tokenNames.length - 1 && "-"}
                    </span>
                  ))}
                  <div className="font-normal text-sm leading-5 text-[#475467]">
                    {formatFirstLetter(farm?.protocol)} on{" "}
                    {formatFirstLetter(farm?.chain)}
                  </div>
                </div>
              </div>
            </td>
            <td className="whitespace-nowrap py-4 text-left sm:pr-3 sm:pl-6 font-medium text-sm leading-5">
              {toDollarUnits(farm?.tvl, 1)}
            </td>
            <td className="hidden base:table-cell whitespace-nowrap py-4 pl-6 pr-3 text-base leading-5">
              <div className="w-full inline-flex justify-start items-center gap-x-2">
                <Tooltip
                  label={
                    <div className="max-w-[120px]">
                      <p className="mb-2 inline-flex justify-between w-full">
                        <span className="text-[#636A78]">Base:</span>
                        <span className="text-[#101828]">
                          {farm?.apr.base.toFixed(2)}%
                        </span>
                      </p>
                      <p className="inline-flex justify-between w-full">
                        <span className="text-[#636A78]">Reward:</span>
                        <span className="text-[#101828]">
                          {farm?.apr.reward.toFixed(2)}%
                        </span>
                      </p>
                    </div>
                  }
                  placement="bottom"
                >
                  <p className="cursor-default underline underline-offset-4 decoration-dashed text-sm font-medium">
                    {`${(farm?.apr.base + farm?.apr.reward).toFixed(2)}%`}
                  </p>
                </Tooltip>
              </div>
            </td>
            <td className="hidden lg:table-cell whitespace-nowrap max-w-[130px] h-full py-0 pl-0 lg:pl-6 pr-3 font-bold text-sm leading-5">
              <SafetyScorePill score={safetyScore} />
            </td>
            <td className="hidden md:table-cell whitespace-nowrap h-full py-0 pl-0 lg:pl-6 pr-3">
              <Rewards rewards={farm?.rewards} />
            </td>
            <td
              className={clsx(
                "whitespace-nowrap py-4 px-0 md:px-6 text-center text-sm font-medium",
                (isConnected || isConnectedDot) && "bg-[#F0F0FF]"
              )}
            >
              {isEvmPosLoading || isSubPosLoading ? (
                <div className="w-full">
                  <div className="bg-[#d1d1f1] mx-auto animate-shiny rounded-full h-5 w-10" />
                </div>
              ) : !!currentPosition && currentPosition > 0 ? (
                <Tooltip
                  label={
                    <div className="max-w-[143px]">
                      <p className="mb-2 inline-flex justify-between w-full">
                        <span className="text-[#636A78]">Idle:</span>
                        <span className="text-[#101828]">
                          $
                          {position?.unstaked.amountUSD < 0.001
                            ? "0"
                            : position?.unstaked.amountUSD.toFixed(2)}
                        </span>
                      </p>
                      <p className="inline-flex justify-between w-full">
                        <span className="text-[#636A78]">Staked:</span>
                        <span className="text-[#101828]">
                          $
                          {position?.staked.amountUSD < 0.001
                            ? "0"
                            : position?.staked.amountUSD.toFixed(2)}
                        </span>
                      </p>
                    </div>
                  }
                  placement="bottom"
                >
                  <span className="cursor-default underline underline-offset-4 decoration-dashed">
                    {"$" +
                      parseFloat(currentPosition.toFixed(2)).toLocaleString(
                        "en-US"
                      )}
                  </span>
                </Tooltip>
              ) : (
                <Tooltip
                  label={
                    !isConnected &&
                    !isConnectedDot && <p>Connect Wallet to View Positions</p>
                  }
                  placement="bottom"
                >
                  <span className="cursor-default font-normal text-2xl leading-5 text-[#3A3A5F]">
                    -
                  </span>
                </Tooltip>
              )}
            </td>
            <td className="whitespace-nowrap max-w-[288px] py-4 pr-0 md:pr-6 xl:pr-12 text-right text-sm font-medium rounded-br-xl">
              <div className="flex flex-row gap-x-6 items-center justify-start lg:justify-end">
                <ShareFarm farm={farm} />
                <Button
                  size="large"
                  onButtonClick={() => {
                    router.push(`/farm/${farm.id}/?addr=${farm.asset.address}`);
                  }}
                >
                  View Farm
                </Button>
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
};

export default memo(FarmsList);
