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

const FarmsList = ({ farms }: any) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [thisProtocol, setThisProtocol] = useState<string>("");

  return (
    <>
      {farms.map((farm: any) => {
        const tokenNames = formatTokenSymbols(farm?.asset.symbol);
        return (
          <tr key={`${farm.asset.address}-${farm.tvl}`}>
            <td className="whitespace-nowrap py-6 pl-4 pr-3 text-sm sm:pl-6">
              <div className="flex items-center">
                <div className="hidden md:flex flex-row items-center justify-center -space-x-2">
                  {farm?.asset.logos.map((logo: string, index: number) => (
                    <div
                      key={index}
                      className="z-10 flex overflow-hidden ring-2 ring-neutral-300 dark:ring-neutral-500 rounded-full bg-white dark:bg-neutral-800"
                    >
                      <Image src={logo} alt={logo} width={36} height={36} />
                    </div>
                  ))}
                </div>
                <div className="ml-2 flex flex-col gap-y-0.5">
                  <div className="flex flex-row items-center">
                    <div className="font-semibold tracking-wide">
                      {tokenNames.map((tokenName, index) => (
                        <span key={index} className="mr-[3px]">
                          {tokenName}
                          {index !== tokenNames.length - 1 && " •"}
                        </span>
                      ))}
                    </div>
                    <div className="ml-2">
                      <span className="tracking-[0.08em] items-center rounded bg-indigo-50 dark:bg-indigo-300 px-2 py-0.5 text-xs font-medium text-indigo-500 dark:text-neutral-900">
                        {formatFarmType(farm?.farmType)}
                      </span>
                      {isCritical(farm?.id, farm?.chef) && (
                        <Tooltip content="This Yield Farm has been affected by the recent Nomad Hack.">
                          <span className="ml-2 select-none items-center rounded-full bg-red-400 dark:bg-red-300 px-2 py-0.5 text-sm font-semibold text-white dark:text-red-700">
                            !
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                  <div className="text-neutral-500 dark:text-neutral-400 font-medium">
                    {formatFirstLetter(farm?.protocol)} on{" "}
                    {formatFirstLetter(farm?.chain)}
                  </div>
                </div>
              </div>
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-900 dark:text-neutral-100 font-semibold">
              {toDollarFormat(farm?.tvl)}
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-sm text-neutral-900 dark:text-neutral-100 font-semibold">
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
                  <Button type="secondary" size="small">
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
