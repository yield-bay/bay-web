// Library Imports
import { useEffect, memo, type FC } from "react";
import { useAtom } from "jotai";
import { ArrowSmDownIcon } from "@heroicons/react/outline";
import { useIsClient } from "usehooks-ts";

// Utility and Component Imports
import {
  showSupportedFarmsAtom,
  sortedFarmsAtom,
  sortStatusAtom,
} from "@store/atoms";
import FarmsList from "./FarmList";
import Tooltip from "@components/Library/Tooltip";
import LoadingSkeleton from "@components/Library/LoadingSkeleton";
import { FarmType } from "@utils/types/common";
import Image from "next/image";
import SupportedFarmsToggle from "@components/Library/SupportedFarmsToggle";
import SelectFarmType from "@components/Library/SelectFarmType";
import SearchInput from "@components/Library/SearchInput";
import clsx from "clsx";
import { useAccount } from "wagmi";
import { dotAccountAtom } from "@store/accountAtoms";
import { evmPosLoadingAtom, subPosLoadingAtom } from "@store/commonAtoms";

enum Order {
  ASC,
  DESC,
}

interface Props {
  farms: FarmType[];
  isLoading: boolean;
  positions: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  noResult?: boolean;
}

const FarmTable: FC<Props> = ({
  farms,
  noResult,
  isLoading,
  searchTerm,
  setSearchTerm,
  positions,
}) => {
  const [sortStatus, sortStatusSet] = useAtom(sortStatusAtom);
  const [sortedFarms, sortedFarmsSet] = useAtom(sortedFarmsAtom);
  const [showSupportedFarms, setShowSupportedFarms] = useAtom(
    showSupportedFarmsAtom
  );
  const [isEvmPosLoading] = useAtom(evmPosLoadingAtom);
  const [isSubPosLoading] = useAtom(subPosLoadingAtom);

  // Users wallet
  const { isConnected } = useAccount();
  const [account] = useAtom(dotAccountAtom);

  const isClient = useIsClient();

  useEffect(() => {
    if (farms.length > 0) handleSort(sortStatus.key, false);
  }, [farms]);

  useEffect(() => {
    // Sorts the table based on positions if there are any
    if (sortStatus.key !== "pos" && !isEvmPosLoading && !isSubPosLoading) {
      if (Object.keys(positions).length > 0) {
        setShowSupportedFarms(true);
        sortStatusSet({
          key: "pos",
          order: Order.DESC,
        });
      }
    }
  }, [positions, isEvmPosLoading, isSubPosLoading]);

  /**
   * Method to handle farms table sorting
   * @param key Key of the main sorting sorting column ("tvl" by default)
   * @param toggle Sorting order
   */
  const handleSort = (key: string, toggle: boolean) => {
    let newSortStatus: {
      key: string;
      order: number;
    };

    if (toggle) {
      newSortStatus = {
        key,
        order: sortStatus.order == Order.ASC ? Order.DESC : Order.ASC, // Flip the order
      };
      if (key !== sortStatus.key) newSortStatus.order = Order.DESC; // if the key is not same as before, set the Order to DESC
    } else {
      newSortStatus = {
        key,
        order: sortStatus.order,
      };
    }

    sortStatusSet(newSortStatus);

    let sortFn; // to be used to sort the pools
    if (newSortStatus.key == "tvl") {
      sortFn = (a: FarmType, b: FarmType) =>
        newSortStatus.order == Order.ASC
          ? a.tvl >= b.tvl
            ? 1
            : -1
          : a.tvl < b.tvl
          ? 1
          : -1;
    } else if (newSortStatus.key == "yield") {
      sortFn = (a: FarmType, b: FarmType) =>
        newSortStatus.order == Order.ASC
          ? a.apr.reward + a.apr.base >= b.apr.reward + b.apr.base
            ? 1
            : -1
          : a.apr.reward + a.apr.base < b.apr.reward + b.apr.base
          ? 1
          : -1;
    } else if (newSortStatus.key == "safety") {
      sortFn = (a: FarmType, b: FarmType) =>
        newSortStatus.order == Order.ASC
          ? a.safetyScore >= b.safetyScore
            ? 1
            : -1
          : a.safetyScore < b.safetyScore
          ? 1
          : -1;
    } else if (newSortStatus.key == "pos") {
      sortFn = (a: FarmType, b: FarmType) => {
        const positionA =
          positions[
            `${a.chain}-${a.protocol}-${a.chef}-${a.id}-${a.asset.symbol}`
          ];
        const positionB =
          positions[
            `${b.chain}-${b.protocol}-${b.chef}-${b.id}-${b.asset.symbol}`
          ];

        const currentA =
          positionA?.unstaked.amountUSD + positionA?.staked.amountUSD;
        const currentB =
          positionB?.unstaked.amountUSD + positionB?.staked.amountUSD;

        return isNaN(currentA) // If position of A is NaN, push it back in both cases
          ? 1
          : newSortStatus.order == Order.ASC
          ? currentA >= currentB
            ? 1
            : -1
          : currentA < currentB
          ? 1
          : -1;
      };
    }

    sortedFarmsSet([...farms].sort(sortFn));
  };

  return (
    <>
      {/* Shows Shared farm if queries are available  */}
      <div
        className="flex flex-col-reverse sm:flex-row items-center justify-between
                bg-white mt-8 sm:mt-0 py-0 sm:py-4 px-0 sm:px-6 md:pl-16 md:pr-8 lg:px-12 font-medium text-[#66686B] text-sm leading-5 rounded-t-xl"
      >
        <div className="flex items-center py-5 sm:py-0 px-9 sm:px-0 justify-between w-full sm:w-max sm:gap-x-6">
          <div className="hidden sm:block">
            <SelectFarmType />
          </div>
          <div className="inline-flex gap-x-2 items-center">
            <SupportedFarmsToggle
              enabled={showSupportedFarms}
              setEnabled={setShowSupportedFarms}
            />
            <Tooltip
              label={
                <p className="max-w-[183px] text-center">
                  We only track selected farms right now
                </p>
              }
            >
              <p className="inline-flex gap-x-2">
                <span className="hidden lg:block cursor-default underline underline-offset-4 decoration-dashed">
                  show only supported farms
                </span>
                <Image
                  src="/icons/umbrella.svg"
                  alt="supported farms"
                  height={16}
                  width={16}
                />
              </p>
            </Tooltip>
          </div>
        </div>
        <div className="inline-flex items-center gap-x-4 max-w-fit">
          <p className="min-w-fit">{sortedFarms.length} Results</p>
          <SearchInput term={searchTerm} setTerm={setSearchTerm} />
        </div>
      </div>
      <div className="bg-white border-x border-b border-[#EAECF0] rounded-b-xl">
        <div className="inline-block min-w-full align-middle">
          {!noResult ? (
            <table className="min-w-full text-[#475467]">
              <thead className="font-medium text-xs leading-[18px] border-y border-[#EAECF0]">
                <tr>
                  <th
                    scope="col"
                    className="py-[13px] pr-3 text-left pl-8 md:pl-14 lg:pl-12 font-medium"
                  >
                    <span>Farm</span>
                  </th>
                  <th
                    scope="col"
                    className="hidden xl:table-cell pl-6 py-[13px] cursor-pointer font-medium"
                    onClick={() => {
                      handleSort("tvl", true);
                    }}
                  >
                    <div className="flex justify-start items-center">
                      <Tooltip
                        label={
                          <span>
                            Total Value Locked. Amount of money currently
                            invested in the farm, denoted in USD.
                          </span>
                        }
                        placement="top"
                      >
                        <div>
                          <span>TVL</span>
                          {sortStatus.key == "tvl" && (
                            <ArrowSmDownIcon
                              className={clsx(
                                "w-4 h-4 inline -mt-0.5 ml-2 transform origin-center transition-all duration-300",
                                sortStatus.order == Order.DESC
                                  ? "rotate-0"
                                  : "rotate-180"
                              )}
                            />
                          )}
                        </div>
                      </Tooltip>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="hidden base:flex justify-start items-center pl-6 pr-3 py-[13px] cursor-pointer font-medium"
                    onClick={() => {
                      handleSort("yield", true);
                    }}
                  >
                    <Tooltip
                      label={
                        <span>
                          The percentage of returns the farm offers on staking
                          for an year.
                        </span>
                      }
                      placement="top"
                    >
                      <div>
                        <span>APR</span>
                        {sortStatus.key == "yield" && (
                          <ArrowSmDownIcon
                            className={clsx(
                              "w-4 h-4 inline -mt-0.5 ml-2 transform origin-center transition-all duration-300",
                              sortStatus.order == Order.DESC
                                ? "rotate-0"
                                : "rotate-180"
                            )}
                          />
                        )}
                      </div>
                    </Tooltip>
                  </th>
                  <th
                    scope="col"
                    className="hidden lg:table-cell px-3 py-[13px] pl-3 lg:pl-6 text-left cursor-pointer font-medium"
                    onClick={() => {
                      handleSort("safety", true);
                    }}
                  >
                    <Tooltip
                      label={
                        <span>Score indicates the reliability of a farm</span>
                      }
                      placement="top"
                    >
                      <div>
                        <span>Safety Score</span>
                        {sortStatus.key == "safety" && (
                          <ArrowSmDownIcon
                            className={clsx(
                              "w-4 h-4 inline -mt-0.5 ml-2 transform origin-center transition-all duration-300",
                              sortStatus.order == Order.DESC
                                ? "rotate-0"
                                : "rotate-180"
                            )}
                          />
                        )}
                      </div>
                    </Tooltip>
                  </th>
                  <th
                    scope="col"
                    className="hidden base:table-cell px-3 py-[13px] pl-2 lg:pl-6 text-left font-medium"
                  >
                    <span>Rewards</span>
                  </th>
                  <th
                    scope="col"
                    className={clsx(
                      "py-[13px] pr-3 pl-4 sm:px-6 text-center font-medium cursor-pointer",
                      isClient
                        ? (isConnected || account !== null) && "bg-[#F0F0FF]"
                        : ""
                    )}
                    onClick={() => {
                      handleSort("pos", true);
                    }}
                  >
                    <div>
                      <span>Your Positions</span>
                      {sortStatus.key == "pos" && (
                        <ArrowSmDownIcon
                          className={clsx(
                            "w-4 h-4 inline -mt-0.5 ml-2 transform origin-center transition-all duration-300",
                            sortStatus.order == Order.DESC
                              ? "rotate-0"
                              : "rotate-180"
                          )}
                        />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="py-[13px] pl-4 pr-3 sm:pl-6">
                    <span className="sr-only">Visit Farm</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0]">
                {!isLoading ? (
                  <FarmsList farms={sortedFarms} positions={positions} />
                ) : (
                  <LoadingSkeleton />
                )}
              </tbody>
            </table>
          ) : (
            <div className="flex items-center justify-center px-4 py-10 sm:px-6 md:px-28 text-base font-bold leading-5 text-[#101828]">
              <p>No Results. Try searching for something else.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default memo(FarmTable);
