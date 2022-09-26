// Library  Imports
import React, { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { FixedSizeList } from "react-window";

// Component Imports
import Button from "@components/Library/Button";
import FarmAssets from "@components/Library/FarmAssets";
import FarmBadge from "@components/Library/FarmBadge";
import MobileLoadingSkeleton from "@components/Library/MobileLoadingSkeleton";
import ShareFarm from "@components/Library/ShareFarm";
import PreferencesModal from "@components/Library/PreferencesModal";

// Misc Imports
import {
  farmURL,
  formatFarmType,
  formatFirstLetter,
  formatTokenSymbols,
} from "@utils/farmListMethods";
import toDollarUnits from "@utils/toDollarUnits";
import { trackEventWithProperty } from "@utils/analytics";
import {
  sortedFarmsAtom,
  sortStatusAtom,
  showScrollBtnAtom,
} from "@store/atoms";
import { ArrowUpIcon } from "@heroicons/react/outline";

type FarmListType = {
  farms: any;
  noResult: boolean;
  prefOpen: boolean;
  setPrefOpen: (value: boolean) => void;
};

enum Order {
  ASC,
  DESC,
}

const MobileFarmList = ({
  farms,
  noResult,
  prefOpen,
  setPrefOpen,
}: FarmListType) => {
  const [sortStatus, sortStatusSet] = useAtom(sortStatusAtom);
  const [sortedFarms, sortedFarmsSet] = useAtom(sortedFarmsAtom);
  const [showScrollBtn] = useAtom(showScrollBtnAtom);
  const [hideSkeleton, setHideSkeleton] = useState(false);
  const [vpHeight, setVpHeight] = useState(0);
  const [vpWidth, setVpWidth] = useState(0);

  // reference
  const listRef = React.createRef<FixedSizeList<any>>();

  useEffect(() => {
    setVpHeight(window.innerHeight);

    const handleWidth = () => {
      setVpWidth(window.innerWidth);
    };

    window.addEventListener("scroll", handleWidth);
    return () => window.removeEventListener("scroll", handleWidth);
  }, []);

  useEffect(() => {
    if (farms.length > 0) handleSort(false, false);
  }, [farms]);

  useEffect(() => {
    if (farms.length > 0) {
      setTimeout(() => {
        setHideSkeleton(true);
      }, 500);
    }
  }, [setHideSkeleton, farms]);

  const handleSort = (toggleKey: boolean, toggleOrder: boolean) => {
    let newSortStatus: {
      key: string;
      order: number;
    };

    // Toggle for Order, as we are keeping key same
    if (toggleOrder) {
      newSortStatus = {
        key: sortStatus.key,
        order: sortStatus.order == Order.ASC ? Order.DESC : Order.ASC, // Flip the order
      };
    } else if (toggleKey) {
      newSortStatus = {
        key: sortStatus.key == "tvl" ? "yield" : "tvl",
        order: sortStatus.order,
      };
    } else {
      // when both are false
      newSortStatus = {
        key: sortStatus.key,
        order: sortStatus.order,
      };
    }

    // globally sets the sortStatus in store
    sortStatusSet(newSortStatus);

    let sortFn; // fn used to sort the pools
    if (newSortStatus.key == "tvl") {
      sortFn = (a: any, b: any) =>
        newSortStatus.order == Order.ASC
          ? a.tvl >= b.tvl
            ? 1
            : -1
          : a.tvl < b.tvl
          ? 1
          : -1;
    } else if (newSortStatus.key == "yield") {
      sortFn = (a: any, b: any) =>
        newSortStatus.order == Order.ASC
          ? a.apr.reward + a.apr.base >= b.apr.reward + b.apr.base
            ? 1
            : -1
          : a.apr.reward + a.apr.base < b.apr.reward + b.apr.base
          ? 1
          : -1;
    }

    sortedFarmsSet([...farms].sort(sortFn));
  };

  const MobileFarmCard = ({ index, style }: any) => {
    const farm = sortedFarms[index];
    const tokenNames = formatTokenSymbols(farm?.asset.symbol);
    return (
      <div
        key={index}
        style={style}
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
  };

  return (
    <div className="text-baseBlueDark dark:text-blueSilver">
      {!noResult ? (
        hideSkeleton ? (
          <FixedSizeList
            height={vpHeight}
            width={vpWidth}
            itemCount={sortedFarms.length}
            itemSize={276}
            ref={listRef}
          >
            {MobileFarmCard}
          </FixedSizeList>
        ) : (
          <MobileLoadingSkeleton />
        )
      ) : (
        <div className="flex items-center justify-center px-4 py-10 sm:px-6 md:px-28 font-spaceGrotesk text-base font-bold text-baseBlueDark dark:text-bodyGray leading-5">
          <p>No Results. Try searching for something else.</p>
        </div>
      )}
      {/* Scrolling Button */}
      {showScrollBtn && (
        <button
          className="fixed bottom-20 sm:bottom-[80px] right-12 sm:right-[120px] z-20 p-[10px] rounded-full hover:scale-105 active:scale-100 bg-bodyGray dark:bg-primaryBlue transition-all ease-in-out duration-200"
          onClick={() => {
            listRef.current?.scrollToItem(0, "smart");
          }}
        >
          <ArrowUpIcon className="w-5 text-primaryBlue dark:text-white transition duration-200" />
        </button>
      )}
      <PreferencesModal
        open={prefOpen}
        setOpen={setPrefOpen}
        handleSort={handleSort}
      />
    </div>
  );
};

export default React.memo(MobileFarmList);
