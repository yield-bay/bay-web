import { useState } from "react";
import Image from "next/image";
import toDollarFormat from "@utils/toDollarFormat";
// import { trackEventWithProperty } from "@utils/analytics";
import {
  formatFirstLetter,
  farmURL,
  formatTokenSymbols,
  isCritical,
  formatFarmType,
} from "@utils/farmListMethods";
// import ShareFarm from "./ShareFarm";
// import CriticalFarmModal from "./CriticalFarmModal";
import Tooltip from "@components/Library/Tooltip";
import Button from "@components/Library/Button";
import FarmAssets from "@components/Library/FarmAssets";
import FarmBadge from "@components/Library/FarmBadge";
import ShareFarm from "@components/Library/ShareFarm";

const FarmsList = ({ farms }: any) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [thisProtocol, setThisProtocol] = useState<string>("");

  return (
    <>
      {farms.map((farm: any) => {
        const tokenNames = formatTokenSymbols(farm?.asset.symbol);
        return (
          <tr key={`${farm.asset.address}-${farm.tvl}`}>
            <td className="whitespace-nowrap py-8 pl-4 pr-3 text-sm sm:pl-4">
              <div className="flex items-center">
                <div className="ml-1.5 flex flex-col gap-y-[10px]">
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
            <td className="whitespace-nowrap">
              <FarmAssets logos={farm?.asset.logos} />
            </td>
            <td className="whitespace-nowrap py-8 sm:pl-4 dark:text-blueSilver font-bold text-base leading-5 tracking-wide">
              {toDollarFormat(farm?.tvl)}
            </td>
            <td className="whitespace-nowrap py-8 sm:pl-4 dark:text-blueSilver font-bold text-base leading-5 tracking-wide">
              {(farm?.apr.base + farm?.apr.reward).toFixed(2)}%
            </td>
            <td className="whitespace-nowrap py-4 px-0 sm:px-0 text-right text-sm font-medium">
              <div className="relative flex flex-row gap-x-3 items-center justify-start lg:justify-center">
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
                    // onClick={() =>
                    //   trackEventWithProperty("go-to-farm", {
                    //     protocol: farm?.protocol,
                    //   })
                    // }
                  >
                    Go to farm
                  </Button>
                </a>
              </div>
            </td>
          </tr>
        );
      })}
      {/* <CriticalFarmModal
        open={modalOpen}
        setOpen={setModalOpen}
        protocol={thisProtocol}
      /> */}
    </>
  );
};

export default FarmsList;
