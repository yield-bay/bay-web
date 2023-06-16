// Library  Imports
import { useState, useEffect, memo, type FC } from "react";
import { useAtom } from "jotai";
import Image from "next/image";
import { useRouter } from "next/router";
import clsx from "clsx";

// Component Imports
import Button from "@components/Library/Button";
import FarmAssets from "@components/Library/FarmAssets";
import FarmBadge from "@components/Library/FarmBadge";
import MobileLoadingSkeleton from "@components/Library/MobileLoadingSkeleton";
import ShareFarm from "@components/Library/ShareFarm";
import PreferencesModal from "@components/Library/PreferencesModal";
import SearchInput from "@components/Library/SearchInput";
import SafetyScorePill from "@components/Library/SafetyScorePill";
import PositionModal from "@components/Library/PositionModal";

// Misc Imports
import {
  formatFarmType,
  formatFirstLetter,
  formatTokenSymbols,
  checkIfPoolSupported,
} from "@utils/farmListMethods";
import toDollarUnits from "@utils/toDollarUnits";
import { sortedFarmsAtom, sortStatusAtom } from "@store/atoms";
import { FarmType } from "@utils/types";

interface Props {
  farms: FarmType[];
  noResult: boolean;
  isLoading: boolean;
  positions: any;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

enum Order {
  ASC,
  DESC,
}

const MobileFarmList: FC<Props> = ({
  farms,
  noResult,
  isLoading,
  positions,
  searchTerm,
  setSearchTerm,
}) => {
  const [sortStatus, sortStatusSet] = useAtom(sortStatusAtom);
  const [sortedFarms, sortedFarmsSet] = useAtom(sortedFarmsAtom);
  const [prefModalOpen, setPrefModalOpen] = useState(false);
  const [positionModalOpen, setPositionModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<any>(undefined);

  const router = useRouter();

  useEffect(() => {
    if (farms.length > 0) handleSort(false, false);
  }, [farms]);

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

  return (
    <>
      <div
        className="flex flex-row gap-x-3 p-4 items-center justify-between
                bg-white font-medium text-[#66686B] text-sm leading-5 rounded-t-xl"
      >
        <SearchInput term={searchTerm} setTerm={setSearchTerm} />
        <div
          className="py-3 px-4 rounded-lg border border-[#D0D5DD]"
          onClick={() => setPrefModalOpen(true)}
        >
          <Image
            src="/icons/MenuIcon.svg"
            alt="Preferences"
            width={20}
            height={20}
          />
        </div>
      </div>
      {!noResult ? (
        !isLoading ? (
          sortedFarms.map((farm: FarmType, index: number) => {
            const tokenNames = formatTokenSymbols(farm?.asset.symbol);
            const safetyScore = (farm?.safetyScore * 10).toFixed(1);
            const position =
              positions[
                `${farm.chain}-${farm.protocol}-${farm.chef}-${farm.id}-${farm.asset.symbol}`
              ];

            return (
              <div
                key={index}
                className={clsx(
                  "w-full py-6 px-8 border-b border-[#EAECF0] text-[#101828]",
                  index % 2 == 0 ? "bg-[#FAFAFF]" : "bg-white",
                  index == sortedFarms.length - 1 && "rounded-b-xl"
                )}
              >
                {/* Upper Container for left and right */}
                <div className="flex flex-col gap-y-4">
                  {/* LEFT */}
                  <div className="flex flex-row items-center gap-x-4">
                    <FarmAssets logos={farm?.asset.logos} />
                    <FarmBadge type={formatFarmType(farm?.farmType)} />
                    <Image
                      src="/icons/umbrella.svg"
                      alt="supported farm"
                      height={20}
                      width={20}
                      className={clsx(
                        "ml-2",
                        !checkIfPoolSupported(farm) && "saturate-0"
                      )}
                    />
                  </div>
                  <div className="text-[#101828] font-medium text-sm leading-5">
                    {tokenNames.map((tokenName, index) => (
                      <span key={index}>
                        {tokenName}
                        {index !== tokenNames.length - 1 && "-"}
                      </span>
                    ))}
                    <div className="font-normal text-sm leading-5 text-[#475467]">
                      {formatFirstLetter(farm?.protocol)} on{" "}
                      {formatFirstLetter(farm?.chain)}
                    </div>
                  </div>
                  <div className="inline-flex items-center gap-x-3">
                    <SafetyScorePill score={safetyScore} />
                    <span className="py-[2px] px-[10px] rounded-full w-max text-[10px] leading-5 font-medium text-sm bg-[#F4F4F4] text-[#475467]">
                      {toDollarUnits(farm?.tvl)} TVL
                    </span>
                    <span className="py-[2px] px-[10px] rounded-full w-max text-[10px] leading-5 font-medium text-sm bg-[#F4F4F4] text-[#475467]">
                      {(farm?.apr.base + farm?.apr.reward).toFixed(2)}% APR
                    </span>
                  </div>
                </div>
                <div className="flex flex-row gap-x-3 items-center justify-between mt-[42px]">
                  <Button
                    size="large"
                    onButtonClick={() => {
                      router.push(
                        `/farm/${farm.id}/?addr=${farm.asset.address}`
                      );
                    }}
                  >
                    View Farm
                  </Button>
                  <button
                    className="bg-[#EDEDFF] text-[#1D2939] font-medium text-sm leading-5 rounded-lg shadow py-[10px] px-4"
                    onClick={() => {
                      setPositionModalOpen(true);
                      setSelectedPosition(position);
                    }}
                  >
                    My Position
                  </button>
                  <ShareFarm farm={farm} />
                </div>
              </div>
            );
          })
        ) : (
          <MobileLoadingSkeleton />
        )
      ) : (
        <div className="flex items-center justify-center px-4 py-10 sm:px-6 md:px-28 text-base font-bold text-black leading-5">
          <p>No Results. Try searching for something else.</p>
        </div>
      )}
      <PreferencesModal
        open={prefModalOpen}
        setOpen={setPrefModalOpen}
        handleSort={handleSort}
      />
      <PositionModal
        open={positionModalOpen}
        setOpen={setPositionModalOpen}
        position={selectedPosition}
      />
    </>
  );
};

export default memo(MobileFarmList);
