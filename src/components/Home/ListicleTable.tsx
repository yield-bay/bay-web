// Library Imports
import { useEffect, useState, memo } from "react";
import { useAtom } from "jotai";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/outline";

// Utility and Component Imports
import { sortedFarmsAtom, sortStatusAtom } from "@store/atoms";
import FarmsList from "./FarmList";
import Tooltip from "@components/Library/Tooltip";
import { trackEventWithProperty } from "@utils/analytics";
import LoadingSkeleton from "@components/Library/LoadingSkeleton";

enum Order {
  ASC,
  DESC,
}

type ListicleType = {
  farms: any;
  noResult?: boolean;
};

const ListicleTable = ({ farms, noResult }: ListicleType) => {
  const [sortStatus, sortStatusSet] = useAtom(sortStatusAtom);
  const [sortedFarms, sortedFarmsSet] = useAtom(sortedFarmsAtom);
  const [hideSkeleton, setHideSkeleton] = useState(false);

  useEffect(() => {
    if (farms.length > 0) handleSort(sortStatus.key, false);
  }, [farms]);

  useEffect(() => {
    if (farms.length > 0) {
      setTimeout(() => {
        setHideSkeleton(true);
      }, 500);
    }
  }, [setHideSkeleton, farms]);

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
    <div className="flex flex-col">
      <div>
        <div className="inline-block min-w-full align-middle">
          {!noResult ? (
            <div>
              <table className="min-w-full text-white">
                <thead className="font-bold text-base leading-5">
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
                        handleSort("tvl", true);
                        trackEventWithProperty("table-sorting", {
                          sortingType: "tvl",
                        });
                      }}
                    >
                      <div className="flex justify-end items-center">
                        <Tooltip
                          content={
                            <span>
                              Total Value Locked. Amount of money currently
                              invested in the farm, denoted in USD.
                            </span>
                          }
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
                      className="flex justify-end px-3 pt-9 pb-6 cursor-pointer"
                      onClick={() => {
                        handleSort("yield", true);
                        trackEventWithProperty("table-sorting", {
                          sortingType: "yield",
                        });
                      }}
                    >
                      <Tooltip
                        content={
                          <span>
                            The percentage of returns the farm offers on staking
                            for an year.
                          </span>
                        }
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
                      className="hidden md:table-cell px-3 pt-9 pb-6 pl-2 lg:pl-16 text-right"
                    >
                      <span>Rewards</span>
                    </th>
                    <th
                      scope="col"
                      className="hidden lg:table-cell px-3 pt-9 pb-6 pl-2 lg:pl-16 text-right cursor-pointer"
                      onClick={() => {
                        handleSort("safety", true);
                        trackEventWithProperty("table-sorting", {
                          sortingType: "safety-score",
                        });
                      }}
                    >
                      <Tooltip
                        content={
                          <span>Score indicates the reliability of a farm</span>
                        }
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
                    <th scope="col" className="pt-9 pb-6 pl-4 pr-3 sm:pl-6">
                      <span className="sr-only">Visit Farm</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#445AAD] divide-opacity-50">
                  {hideSkeleton ? (
                    <FarmsList farms={sortedFarms} />
                  ) : (
                    <LoadingSkeleton />
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center px-4 py-10 sm:px-6 md:px-28 font-spaceGrotesk text-base font-bold text-bodyGray leading-5">
              <p>No Results. Try searching for something else.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(ListicleTable);
