// Library Imports
import React, { useEffect, useState, useContext, useRef } from "react";
import { useAtom } from "jotai";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/outline";
import { FixedSizeList, FixedSizeListProps } from "react-window";

// Utility and Component Imports
import { sortedFarmsAtom, sortStatusAtom } from "@store/atoms";
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

// Context for cross component communication
const VirtualTabelContext = React.createContext<{
  top: number;
  setTop: (top: number) => void;
  header: React.ReactNode;
  footer: React.ReactNode;
}>({
  top: 0,
  setTop: (value: number) => {},
  header: <></>,
  footer: <></>,
});

// Virtual Table. It bsically accepts all of the same parans as the original FixedSizeList
function VirtualTable({
  row,
  header,
  footer,
  ...rest
}: {
  row: FixedSizeListProps["children"];
  header?: React.ReactNode;
  footer?: React.ReactNode;
} & Omit<FixedSizeListProps, "children" | "innerElementType">) {
  const listRef = useRef<FixedSizeList | null>();
  const [top, setTop] = useState(0);

  return (
    <VirtualTabelContext.Provider value={{ top, setTop, header, footer }}>
      <FixedSizeList
        {...rest}
        innerElementType={Inner}
        onItemsRendered={(props) => {
          const style =
            listRef.current &&
            // @ts-ignore private method access
            listRef.current._getItemStyle(props.overscanStartIndex);
          setTop((style && style.top) || 0);

          // call the original callback
          rest.onItemsRendered && rest.onItemsRendered(props);
        }}
        ref={(el) => listRef.current == el}
      >
        {row}
      </FixedSizeList>
    </VirtualTabelContext.Provider>
  );
}

/*
  The Inner component of the virtual list. This is the real deal.
  Capture what would have been the top elements position and apply it to the table
  Other than that, render an optional header and footer.
*/
const Inner = React.forwardRef<HTMLDivElement, React.HTMLProps<HTMLDivElement>>(
  function Inner({ children, ...rest }, ref) {
    const { header, footer, top } = useContext(VirtualTabelContext);
    return (
      <div {...rest} ref={ref}>
        <table style={{ top, position: "absolute", width: "100%" }}>
          {header}
          <tbody className="divide-y divide-[#D9D9D9] dark:divide-[#222A39] transition duration-200">
            {children}
          </tbody>
          {footer}
        </table>
      </div>
    );
  }
);

// Rendering Example
const ListicleTable = ({ farms }: any) => {
  const [vpHeight, setVpHeight] = useState(0);
  // const [vpWidth, setVpWidth] = useState(0);

  useEffect(() => {
    setVpHeight(window.innerHeight);
    // setVpWidth(window.innerWidth);
  }, []);

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
        <td className="hidden lg:flex whitespace-nowrap">
          <FarmAssets logos={farm?.asset.logos} />
        </td>
        <td className="whitespace-nowrap flex items-center py-8 text-right sm:pr-3 sm:pl-4 dark:text-blueSilver font-bold text-base leading-5 tracking-wide">
          {toDollarUnits(farm?.tvl)}
        </td>
        <td className="whitespace-nowrap flex items-center py-8 pl-0 pr-2 dark:text-blueSilver font-bold text-base leading-5 tracking-wide">
          <div className="w-full inline-flex justify-end items-center gap-x-2">
            {(farm?.apr.base + farm?.apr.reward).toFixed(2)}%
            <YieldBreakdown base={farm?.apr.base} reward={farm?.apr.reward} />
          </div>
        </td>
        <td className="hidden md:flex whitespace-nowrap max-w-[130px] h-full py-0 pl-0 lg:pl-16 dark:text-blueSilver font-bold text-base leading-5 tracking-wide">
          <Rewards rewards={farm?.rewards} />
        </td>
        <td className="whitespace-nowrap flex items-center max-w-[288px] py-4 pr-0 md:pr-6 lg:pr-14 text-right text-sm font-medium">
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

  return (
    <VirtualTable
      height={vpHeight}
      width="100%"
      itemCount={farms.length}
      itemSize={142}
      header={
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
      }
      row={Row}
    />
  );
};

export default React.memo(ListicleTable);
