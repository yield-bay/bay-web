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
              <div className="relative flex items-center justify-start lg:justify-center">
                {/* <a href={farmURL(farm)} target="_blank" rel="noreferrer">
                  <button
                    className="inline-flex items-center duration-50 rounded bg-indigo-50 dark:bg-indigo-300 px-5 py-2 transition-all duration-200 hover:shadow-lg font-semibold text-indigo-500 dark:text-indigo-800 active:bg-indigo-200 hover:ring-2 ring-indigo-400 dark:hover:bg-indigo-200 dark:active:bg-indigo-300"
                    // onClick={() =>
                    //   trackEventWithProperty("go-to-farm", {
                    //     protocol: farm?.protocol,
                    //   })
                    // }
                  >
                    <p>Go to farm</p>
                  </button>
                </a> */}
                <a href={farmURL(farm)} target="_blank" rel="noreferrer">
                  <Button type="secondary" size="large">
                    Go to farm
                  </Button>
                </a>

                {/* <div className="ml-3 sm:ml-0 w-1/3 text-center">
                  <ShareFarm
                    farm={farm}
                    apr={(farm?.apr.base + farm?.apr.reward).toFixed(2)}
                  />
                </div> */}
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
