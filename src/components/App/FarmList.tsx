import { FC, memo, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAtom } from "jotai";
import clsx from "clsx";

// Utility Imports
import toDollarUnits from "@utils/toDollarUnits";
import {
  formatFirstLetter,
  formatTokenSymbols,
  formatFarmType,
} from "@utils/farmListMethods";
import { FarmType } from "@utils/types";
import { showSupportedFarmsAtom } from "@store/atoms";

// Component Imports
import Button from "@components/Library/Button";
import FarmAssets from "@components/Library/FarmAssets";
import FarmBadge from "@components/Library/FarmBadge";
import ShareFarm from "@components/Library/ShareFarm";
import Rewards from "@components/Library/Rewards";
import SafetyScorePill from "@components/Library/SafetyScorePill";
import Tooltip from "@components/Library/Tooltip";
import { useAccount } from "wagmi";
import { dotAccountAtom } from "@store/accountAtoms";

interface Props {
  farms: FarmType[];
  positions: any;
}

const FarmsList: FC<Props> = ({ farms, positions }) => {
  const router = useRouter();
  const [showSupportedFarms, setShowSupportedFarms] = useAtom(
    showSupportedFarmsAtom
  );

  // Users wallet
  const { isConnected } = useAccount();
  const [account] = useAtom(dotAccountAtom);

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
          position?.unstaked.amountUSD + position?.staked.amountUSD;

        return (
          <tr
            key={`${farm.asset.address}-${farm.tvl}`}
            className={clsx(
              index % 2 == 0 ? "bg-[#FAFAFF]" : "bg-white",
              (position == undefined || currentPosition <= 0) &&
                showSupportedFarms &&
                "hidden"
            )}
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
                      (position == undefined || currentPosition <= 0) &&
                        "saturate-0"
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
              {toDollarUnits(farm?.tvl)}
            </td>
            <td className="hidden base:table-cell whitespace-nowrap py-4 pl-6 pr-3 text-base leading-5">
              <div className="w-full inline-flex justify-start items-center gap-x-2">
                <Tooltip
                  label={
                    <>
                      <p>
                        Base:{" "}
                        <span className="font-bold">
                          {farm?.apr.base.toFixed(2)}%
                        </span>
                      </p>
                      <p>
                        Reward:{" "}
                        <span className="font-bold">
                          {farm?.apr.reward.toFixed(2)}%
                        </span>
                      </p>
                    </>
                  }
                  placement="top"
                >
                  <p className="cursor-default underline underline-offset-4 decoration-dotted	decoration-3 decoration-[#475467] text-sm font-medium">
                    {(farm?.apr.base + farm?.apr.reward).toFixed(2)}%
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
                (isConnected || account !== null) && "bg-[#F0F0FF]"
              )}
            >
              {currentPosition !== undefined && currentPosition > 0 ? (
                <Tooltip
                  label={
                    <>
                      <p>Idle: {position?.unstaked.amountUSD}</p>
                      <p>Staked: {position?.staked.amountUSD}</p>
                    </>
                  }
                  placement="bottom"
                >
                  <span>{"$" + currentPosition.toFixed(2)}</span>
                </Tooltip>
              ) : (
                <span className="text-[#D5D3D3]">-</span>
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
