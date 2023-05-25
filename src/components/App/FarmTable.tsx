// Library Imports
import { useEffect, useState, memo, FC } from "react";
import { useAtom } from "jotai";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/outline";

// Utility and Component Imports
import { sortedFarmsAtom, sortStatusAtom } from "@store/atoms";
import FarmsList from "./FarmList";
import Tooltip from "@components/Library/Tooltip";
import { trackEventWithProperty } from "@utils/analytics";
import LoadingSkeleton from "@components/Library/LoadingSkeleton";
import { FarmType } from "@utils/types";

enum Order {
  ASC,
  DESC,
}

interface Props {
  farms: FarmType[];
  isLoading: boolean;
  positions: any;
  noResult?: boolean;
}

const FarmTable: FC<Props> = ({ farms, noResult, isLoading, positions }) => {
  const [sortStatus, sortStatusSet] = useAtom(sortStatusAtom);
  const [sortedFarms, sortedFarmsSet] = useAtom(sortedFarmsAtom);

  useEffect(() => {
    if (farms.length > 0) handleSort(sortStatus.key, false);
  }, [farms]);

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
    } else if (newSortStatus.key == "safety") {
      sortFn = (a: any, b: any) =>
        newSortStatus.order == Order.ASC
          ? a.safetyScore >= b.safetyScore
            ? 1
            : -1
          : a.safetyScore < b.safetyScore
          ? 1
          : -1;
    }

    sortedFarmsSet([...farms].sort(sortFn));
  };

  return (
    <div className="bg-white border border-[#EAECF0] rounded-xl">
      <div className="inline-block min-w-full align-middle">
        {!noResult ? (
          <div>
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
                    className="px-3 py-[13px] cursor-pointer font-medium"
                    onClick={() => {
                      handleSort("tvl", true);
                      trackEventWithProperty("table-sorting", {
                        sortingType: "tvl",
                      });
                    }}
                  >
                    <div className="flex justify-end items-center">
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
                          {sortStatus.key == "tvl" &&
                            (sortStatus.order == Order.DESC ? (
                              <ChevronDownIcon className="w-3 h-3 inline -mt-0.5 ml-2" />
                            ) : (
                              <ChevronUpIcon className="w-3 h-3 inline mb-0.5 ml-2" />
                            ))}
                        </div>
                      </Tooltip>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="flex justify-end px-3 py-[13px] cursor-pointer font-medium"
                    onClick={() => {
                      handleSort("yield", true);
                      trackEventWithProperty("table-sorting", {
                        sortingType: "yield",
                      });
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
                        {sortStatus.key == "yield" &&
                          (sortStatus.order == Order.DESC ? (
                            <ChevronDownIcon className="w-3 h-3 inline -mt-0.5 ml-2" />
                          ) : (
                            <ChevronUpIcon className="w-3 h-3 inline mb-0.5 ml-2" />
                          ))}
                      </div>
                    </Tooltip>
                  </th>
                  <th
                    scope="col"
                    className="hidden lg:table-cell px-3 py-[13px] pl-2 lg:pl-16 text-right cursor-pointer font-medium"
                    onClick={() => {
                      handleSort("safety", true);
                      trackEventWithProperty("table-sorting", {
                        sortingType: "safety-score",
                      });
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
                        {sortStatus.key == "safety" &&
                          (sortStatus.order == Order.DESC ? (
                            <ChevronDownIcon className="w-3 h-3 inline -mt-0.5 ml-2" />
                          ) : (
                            <ChevronUpIcon className="w-3 h-3 inline mb-0.5 ml-2" />
                          ))}
                      </div>
                    </Tooltip>
                  </th>
                  <th
                    scope="col"
                    className="hidden md:table-cell px-3 py-[13px] pl-2 lg:pl-16 text-right font-medium"
                  >
                    <span>Rewards</span>
                  </th>
                  <th
                    scope="col"
                    className="py-[13px] pl-4 pr-3 sm:pl-6 font-medium"
                  >
                    Your Positions
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
          </div>
        ) : (
          <div className="flex items-center justify-center px-4 py-10 sm:px-6 md:px-28 text-base font-bold text-bodyGray leading-5">
            <p>No Results. Try searching for something else.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(FarmTable);
