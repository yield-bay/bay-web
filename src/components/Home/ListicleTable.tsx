// Library Imports
import React, { useEffect, useState, useContext, useRef } from "react";
import { useAtom } from "jotai";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowUpIcon,
} from "@heroicons/react/outline";
import { FixedSizeList, FixedSizeListProps } from "react-window";

// Utility and Component Imports
import {
  sortedFarmsAtom,
  sortStatusAtom,
  showScrollBtnAtom,
} from "@store/atoms";
import FarmsList from "./FarmList";
import Tooltip from "@components/Library/Tooltip";
import { trackEventWithProperty } from "@utils/analytics";
import LoadingSkeleton from "@components/Library/LoadingSkeleton";
import Button from "@components/Library/Button";
import ShareFarm from "@components/Library/ShareFarm";
import Rewards from "@components/Library/Rewards";
import YieldBreakdown from "@components/Library/YieldBreakdown";
import toDollarUnits from "@utils/toDollarUnits";
import FarmAssets from "@components/Library/FarmAssets";
import FarmBadge from "@components/Library/FarmBadge";
import {
  farmURL,
  formatFarmType,
  formatFirstLetter,
  formatTokenSymbols,
} from "@utils/farmListMethods";

enum Order {
  ASC,
  DESC,
}

type ListicleType = {
  farms: any;
  noResult?: boolean;
};

// Main Component
const ListicleTable = ({ farms }: any) => {
  const [vpHeight, setVpHeight] = useState(0);
  const [showScrollBtn] = useAtom(showScrollBtnAtom);

  // reference
  const scrollRef = React.createRef<FixedSizeList<any>>();

  useEffect(() => {
    setVpHeight(window.innerHeight);
  }, []);

  // Context for cross component communication
  const VirtualTableContext = React.createContext<{
    top: number;
    setTop: (top: number) => void;
    header: React.ReactNode;
  }>({
    top: 0,
    setTop: (value: number) => {},
    header: <></>,
  });

  // Virtual Table. It basically accepts all of the same params as the original FixedSizeList
  function VirtualTable({
    row,
    header,
    ...rest
  }: {
    row: FixedSizeListProps["children"];
    header?: React.ReactNode;
  } & Omit<FixedSizeListProps, "children" | "innerElementType">) {
    // const listRef = useRef<FixedSizeList | null>();
    const [top, setTop] = useState(0);

    return (
      <VirtualTableContext.Provider value={{ top, setTop, header }}>
        <FixedSizeList
          {...rest}
          innerElementType={Inner}
          onItemsRendered={(props) => {
            const style =
              scrollRef.current &&
              // @ts-ignore private method access
              scrollRef.current._getItemStyle(props.overscanStartIndex);
            setTop((style && style.top) || 0);

            // call the original callback
            rest.onItemsRendered && rest.onItemsRendered(props);
          }}
          ref={(el) => scrollRef.current == el}
        >
          {row}
        </FixedSizeList>
      </VirtualTableContext.Provider>
    );
  }

  /*
  The Inner component of the virtual list. This is the real deal.
  Capture what would have been the top elements position and apply it to the table
  Other than that, render an optional header and footer.
*/
  const Inner = React.forwardRef<
    HTMLDivElement,
    React.HTMLProps<HTMLDivElement>
  >(function Inner({ children, ...rest }, ref) {
    const { header, top } = useContext(VirtualTableContext);
    return (
      <div {...rest} ref={ref}>
        <table style={{ top, position: "absolute", width: "100%" }}>
          {header}
          <tbody className="divide-y divide-[#D9D9D9] dark:divide-[#222A39] transition duration-200">
            {children}
          </tbody>
        </table>
      </div>
    );
  });

  // Row components. This should be the table row. We aren't using the style that regulat react-window egs. passes in
  function Row({ index, style }: { index: number; style: any }) {
    let newStyle = {
      ...style,
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
    };
    const farm = farms[index];
    const tokenNames = formatTokenSymbols(farm?.asset.symbol);
    return (
      <tr key={`${farm.asset.address}-${farm.tvl}`} style={newStyle}>
        <td className="whitespace-nowrap min-w-[265px] py-8 text-sm pl-8 md:pl-14 lg:pl-28 w-full">
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
        <td className="hidden lg:flex justify-end whitespace-nowrap w-full">
          <FarmAssets logos={farm?.asset.logos} />
        </td>
        <td className="whitespace-nowrap flex justify-center items-center max-w-[300px] py-8 w-full text-right sm:pr-3 sm:pl-4 dark:text-blueSilver font-bold text-base leading-5 tracking-wide">
          {toDollarUnits(farm?.tvl)}
        </td>
        <td className="whitespace-nowrap flex w-full max-w-[300px] py-8 pl-0 dark:text-blueSilver font-bold text-base leading-5 tracking-wide">
          <div className="w-full inline-flex justify-center items-center gap-x-2">
            {(farm?.apr.base + farm?.apr.reward).toFixed(2)}%
            <YieldBreakdown base={farm?.apr.base} reward={farm?.apr.reward} />
          </div>
        </td>
        <td className="hidden md:flex justify-start whitespace-nowrap w-full max-w-[300px] h-full py-0 pl-0 lg:pl-6 dark:text-blueSilver font-bold text-base leading-5 tracking-wide">
          <Rewards rewards={farm?.rewards} />
        </td>
        <td className="whitespace-nowrap flex items-center w-full max-w-[288px] py-4 pr-0 md:pr-6 lg:pr-14 text-right text-sm font-medium">
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
  }

  function TableHeader() {
    return (
      <div>
        <thead className="transition duration-200 font-bold text-base leading-5">
          <tr>
            <th
              scope="col"
              className="pt-9 pb-6 pr-3 text-left pl-8 md:pl-14 lg:pl-28"
            >
              <span>Farm</span>
            </th>
            <th
              scope="col"
              className="hidden lg:table-cell pt-9 pb-6 pl-4 pr-3 sm:pl-6"
            >
              <span className="sr-only">Farm Assets</span>
            </th>
            <th
              scope="col"
              className="px-3 pt-9 pb-6 cursor-pointer"
              onClick={() => {
                // handleSort("tvl", true);
                trackEventWithProperty("table-sorting", {
                  sortingType: "tvl",
                });
              }}
            >
              <div className="flex justify-end items-center">
                <Tooltip
                  content={
                    <span>
                      Total Value Locked. Amount of money currently invested in
                      the farm, denoted in USD.
                    </span>
                  }
                >
                  <div>
                    <span>TVL</span>
                    {/* {sortStatus.key == "tvl" &&
                      (sortStatus.order == Order.DESC ? (
                        <ChevronDownIcon className="w-3 h-3 inline -mt-0.5 ml-2" />
                      ) : (
                        <ChevronUpIcon className="w-3 h-3 inline mb-0.5 ml-2" />
                      ))} */}
                  </div>
                </Tooltip>
              </div>
            </th>
            <th
              scope="col"
              className="flex justify-end px-3 pt-9 pb-6 cursor-pointer"
              onClick={() => {
                // handleSort("yield", true);
                trackEventWithProperty("table-sorting", {
                  sortingType: "yield",
                });
              }}
            >
              <Tooltip
                content={
                  <span>
                    The percentage of returns the farm offers on staking for an
                    year.
                  </span>
                }
              >
                <div>
                  <span>APR</span>
                  {/* {sortStatus.key == "yield" &&
                    (sortStatus.order == Order.DESC ? (
                      <ChevronDownIcon className="w-3 h-3 inline -mt-0.5 ml-2" />
                    ) : (
                      <ChevronUpIcon className="w-3 h-3 inline mb-0.5 ml-2" />
                    ))} */}
                </div>
              </Tooltip>
            </th>
            <th
              scope="col"
              className="hidden md:table-cell px-3 pt-9 pb-6 pl-2 lg:pl-16 text-left cursor-pointer"
            >
              <span>Rewards</span>
            </th>
            <th scope="col" className="pt-9 pb-6 pl-4 pr-3 sm:pl-6">
              <span className="sr-only">Go to farm</span>
            </th>
          </tr>
        </thead>
      </div>
    );
  }

  return (
    <>
      <VirtualTable
        height={farms.length >= 8 ? vpHeight : 142 * farms.length}
        width="100%"
        itemCount={farms.length}
        itemSize={142}
        // header={TableHeader}
        row={Row}
      />
      {showScrollBtn && (
        <button
          className="fixed bottom-20 sm:bottom-[80px] right-12 sm:right-[120px] z-20 p-[10px] rounded-full hover:scale-105 active:scale-100 bg-bodyGray dark:bg-primaryBlue transition-all ease-in-out duration-200"
          onClick={() => {
            if (typeof window !== undefined) {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }
            scrollRef.current?.scrollToItem(0, "smart");
          }}
        >
          <ArrowUpIcon className="w-5 text-primaryBlue dark:text-white transition duration-200" />
        </button>
      )}
    </>
  );
};

export default React.memo(ListicleTable);
