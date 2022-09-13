// Utility Imports
import toDollarUnits from "@utils/toDollarUnits";
import {
  formatFirstLetter,
  farmURL,
  formatTokenSymbols,
  formatFarmType,
} from "@utils/farmListMethods";
import { trackEventWithProperty } from "@utils/analytics";

// Component Imports
import Button from "@components/Library/Button";
import FarmAssets from "@components/Library/FarmAssets";
import FarmBadge from "@components/Library/FarmBadge";
import ShareFarm from "@components/Library/ShareFarm";
import YieldBreakdown from "@components/Library/YieldBreakdown";
import Rewards from "@components/Library/Rewards";

const FarmsList = ({ farms }: any) => {
  return (
    <>
      {farms.map((farm: any) => {
        const tokenNames = formatTokenSymbols(farm?.asset.symbol);
        return (
          <tr key={`${farm.asset.address}-${farm.tvl}`}>
            <td className="whitespace-nowrap max-w-[288px] py-8 text-sm pl-8 md:pl-14 lg:pl-28">
              <div>
                <div className="flex flex-col gap-y-[10px]">
                  <div className="flex flex-row items-center">
                    <div className="dark:text-blueSilver font-bold text-base leading-5">
                      {tokenNames.map((tokenName, index) => (
                        <span key={index} className="mr-[3px]">
                          {tokenName}
                          {index !== tokenNames.length - 1 && " •"}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-mediumGray dark:text-[#9397A6] font-medium text-base leading-5">
                    {formatFirstLetter(farm?.protocol)} on{" "}
                    {formatFirstLetter(farm?.chain)}
                  </div>
                  <FarmBadge type={formatFarmType(farm?.farmType)} />
                </div>
              </div>
            </td>
            <td className="hidden lg:table-cell whitespace-nowrap">
              <FarmAssets logos={farm?.asset.logos} />
            </td>
            <td className="whitespace-nowrap py-8 text-right sm:pr-3 sm:pl-4 dark:text-blueSilver font-bold text-base leading-5 tracking-wide">
              {toDollarUnits(farm?.tvl)}
            </td>
            <td className="whitespace-nowrap py-8 pl-0 pr-2 dark:text-blueSilver font-bold text-base leading-5 tracking-wide">
              <div className="w-full inline-flex justify-end items-center gap-x-2">
                {(farm?.apr.base + farm?.apr.reward).toFixed(2)}%
                <YieldBreakdown
                  base={farm?.apr.base}
                  reward={farm?.apr.reward}
                />
              </div>
            </td>
            <td className="hidden md:table-cell whitespace-nowrap max-w-[130px] h-full py-0 pl-0 lg:pl-16 dark:text-blueSilver font-bold text-base leading-5 tracking-wide">
              <Rewards rewards={farm?.rewards} />
            </td>
            <td className="whitespace-nowrap max-w-[288px] py-4 pr-0 md:pr-6 lg:pr-14 text-right text-sm font-medium">
              <div className="flex flex-row gap-x-3 items-center justify-start lg:justify-center">
                <div className="text-center">
                  <ShareFarm
                    farm={farm}
                    apr={(farm?.apr.base + farm?.apr.reward).toFixed(2)}
                  />
                </div>
                <a href={farmURL(farm)} target="_blank" rel="noreferrer">
                  <Button
                    type="secondary"
                    size="large"
                    onButtonClick={() =>
                      trackEventWithProperty("go-to-farm", {
                        protocol: farm?.protocol,
                      })
                    }
                  >
                    Visit Farm
                  </Button>
                </a>
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
};

export default FarmsList;
