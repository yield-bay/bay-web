import { FC, memo, useEffect } from "react";
import { useRouter } from "next/router";

// Utility Imports
import toDollarUnits from "@utils/toDollarUnits";
import {
  formatFirstLetter,
  formatTokenSymbols,
  formatFarmType,
} from "@utils/farmListMethods";
import { FarmType } from "@utils/types";

// Component Imports
import Button from "@components/Library/Button";
import FarmAssets from "@components/Library/FarmAssets";
import FarmBadge from "@components/Library/FarmBadge";
import ShareFarm from "@components/Library/ShareFarm";
import Rewards from "@components/Library/Rewards";
import SafetyScorePill from "@components/Library/SafetyScorePill";
import Tooltip from "@components/Library/Tooltip";

interface Props {
  farms: FarmType[];
  positions: any;
}

const FarmsList: FC<Props> = ({ farms, positions }) => {
  const router = useRouter();
  return (
    <>
      {farms.map((farm: FarmType) => {
        const tokenNames = formatTokenSymbols(farm?.asset.symbol);
        const safetyScore = (farm?.safetyScore * 10).toFixed(1);
        const position =
          positions[
            `${farm.chain}-${farm.protocol}-${farm.chef}-${farm.id}-${farm.asset.symbol}`
          ];
        const currentPosition =
          position?.unstaked.amountUSD + position?.staked.amountUSD;

        return (
          <tr key={`${farm.asset.address}-${farm.tvl}`}>
            <td className="whitespace-nowrap max-w-[288px] py-8 text-sm pl-8 md:pl-14 lg:pl-28">
              <div className="flex flex-col gap-y-[10px]">
                <div className="flex flex-row items-center">
                  <div className="font-bold text-base leading-5">
                    {tokenNames.map((tokenName, index) => (
                      <span key={index} className="mr-[3px]">
                        {tokenName}
                        {index !== tokenNames.length - 1 && " •"}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="font-medium text-base leading-5">
                  {formatFirstLetter(farm?.protocol)} on{" "}
                  {formatFirstLetter(farm?.chain)}
                </div>
                <FarmBadge type={formatFarmType(farm?.farmType)} />
              </div>
            </td>
            <td className="hidden lg:table-cell whitespace-nowrap">
              <FarmAssets logos={farm?.asset.logos} />
            </td>
            <td className="whitespace-nowrap py-8 text-right sm:pr-3 sm:pl-4 font-bold text-base leading-5 tracking-wide">
              {toDollarUnits(farm?.tvl)}
            </td>
            <td className="whitespace-nowrap py-8 pl-0 pr-2 font-bold text-base leading-5 tracking-wide">
              <div className="w-full inline-flex justify-end items-center gap-x-2">
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
                  <p className="cursor-pointer underline underline-offset-4 decoration-dotted	decoration-3 decoration-blueSilver">
                    {(farm?.apr.base + farm?.apr.reward).toFixed(2)}%
                  </p>
                </Tooltip>
              </div>
            </td>
            <td className="hidden md:table-cell whitespace-nowrap max-w-[130px] h-full py-0 pl-0 lg:pl-16 pr-3 font-bold text-base leading-5 tracking-wide">
              <Rewards rewards={farm?.rewards} />
            </td>
            <td className="hidden lg:table-cell whitespace-nowrap max-w-[130px] h-full py-0 pl-0 lg:pl-16 pr-3 font-bold text-base leading-5 tracking-wide">
              <div className="flex flex-col items-end gap-2 justify-end">
                <span>{safetyScore}</span>
                <SafetyScorePill score={safetyScore} />
              </div>
            </td>
            <td className="whitespace-nowrap max-w-[288px] py-4 pr-0 md:pr-6 xl:pr-14 text-right text-sm font-medium">
              {currentPosition !== undefined && currentPosition > 0 ? (
                <Tooltip
                  label={
                    <>
                      <p>Unstaked: {position?.unstaked.amountUSD}</p>
                      <p>Staked: {position?.staked.amountUSD}</p>
                    </>
                  }
                  placement="bottom"
                >
                  <span>{"$" + currentPosition.toFixed(2)}</span>
                </Tooltip>
              ) : (
                <span>-</span>
              )}
            </td>
            <td className="whitespace-nowrap max-w-[288px] py-4 pr-0 md:pr-6 xl:pr-14 text-right text-sm font-medium">
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
