import Button from "@components/Library/Button";
import FarmAssets from "@components/Library/FarmAssets";
import FarmBadge from "@components/Library/FarmBadge";
import ShareFarm from "@components/Library/ShareFarm";
import {
  formatFarmType,
  formatFirstLetter,
  formatTokenSymbols,
} from "@utils/farmListMethods";

export default function MobileFarmList({ farms }: any) {
  return (
    <div className="text-baseBlueDark dark:text-blueSilver">
      {farms.map((farm: any, index: number) => {
        const tokenNames = formatTokenSymbols(farm?.asset.symbol);
        return (
          <div
            key={index}
            className="w-full p-9 border-b border-blueSilver dark:border-[#01060F]"
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
                  <p className="text-2xl leading-[30px]">$3.1M</p>
                </div>
                <div>
                  <p className="text-base opacity-50 leading-5">APR</p>
                  <p className="text-2xl leading-[30px]">75.76%</p>
                </div>
              </div>
            </div>
            <div className="flex flex-row gap-x-3 justify-between mt-9">
              <ShareFarm
                farm={farm}
                apr={(farm?.apr.base + farm?.apr.reward).toFixed(2)}
              />
              <Button size="large" type="secondary">
                Visit Farm
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
