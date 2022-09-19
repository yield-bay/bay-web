// Library  Imports
import { useState, useEffect } from "react";

// Component Imports
import Button from "@components/Library/Button";
import FarmAssets from "@components/Library/FarmAssets";
import FarmBadge from "@components/Library/FarmBadge";
import MobileLoadingSkeleton from "@components/Library/MobileLoadingSkeleton";
import ShareFarm from "@components/Library/ShareFarm";

// Misc Imports
import {
  farmURL,
  formatFarmType,
  formatFirstLetter,
  formatTokenSymbols,
} from "@utils/farmListMethods";
import toDollarUnits from "@utils/toDollarUnits";
import { trackEventWithProperty } from "@utils/analytics";

export default function MobileFarmList({ farms, noResult }: any) {
  const [hideSkeleton, setHideSkeleton] = useState(false);

  useEffect(() => {
    if (farms.length > 0) {
      setTimeout(() => {
        setHideSkeleton(true);
      }, 500);
    }
  }, [setHideSkeleton, farms]);

  return (
    <div className="text-baseBlueDark dark:text-blueSilver">
      {!noResult ? (
        hideSkeleton ? (
          farms.map((farm: any, index: number) => {
            const tokenNames = formatTokenSymbols(farm?.asset.symbol);
            return (
              <div
                key={index}
                className="w-full p-9 border-b border-blueSilver dark:border-[#222A39] transition-all duration-200"
              >
                {/* Upper Container for left and right */}
                <div className="flex flex-row justify-between">
                  {/* LEFT */}
                  <div className="flex flex-col gap-y-[6px]">
                    <div className="mb-[18px]">
                      <FarmAssets logos={farm?.asset.logos} />
                    </div>
                    <div className="flex flex-row items-center">
                      <div className="font-bold text-xs leading-[15px]">
                        {tokenNames.map((tokenName, index) => (
                          <span key={index} className="mr-[3px]">
                            {tokenName}
                            {index !== tokenNames.length - 1 && " •"}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-mediumGray dark:text-[#9397A6] font-medium text-xs leading-[15px]">
                      {formatFirstLetter(farm?.protocol)} on{" "}
                      {formatFirstLetter(farm?.chain)}
                    </div>
                    <FarmBadge type={formatFarmType(farm?.farmType)} />
                  </div>
                  {/* RIGHT */}
                  <div className="flex flex-col gap-y-[18px] font-medium font-spaceGrotesk text-right">
                    <div>
                      <p className="text-base opacity-50 leading-5">TVL</p>
                      <p className="text-2xl leading-[30px]">
                        {toDollarUnits(farm?.tvl)}
                      </p>
                    </div>
                    <div>
                      <p className="text-base opacity-50 leading-5">APR</p>
                      <p className="text-2xl leading-[30px]">
                        {(farm?.apr.base + farm?.apr.reward).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-row gap-x-3 justify-between mt-9">
                  <ShareFarm
                    farm={farm}
                    apr={(farm?.apr.base + farm?.apr.reward).toFixed(2)}
                  />
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
              </div>
            );
          })
        ) : (
          <MobileLoadingSkeleton />
        )
      ) : (
        <div className="flex items-center justify-center px-4 py-10 sm:px-6 md:px-28 font-spaceGrotesk text-base font-bold text-baseBlueDark dark:text-bodyGray leading-5">
          <p>No Results. Try searching for something else.</p>
        </div>
      )}
    </div>
  );
}
