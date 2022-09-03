// Library Imports
import { useEffect } from "react";
import { useAtom } from "jotai";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/outline";

// Utility and Component Imports
import { sortedFarmsAtom, sortStatusAtom } from "@store/atoms";
import FarmsList from "./FarmList";
import Tooltip from "@components/Library/Tooltip";
// import { trackEventWithProperty } from "@utils/analytics";

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

  useEffect(() => {
    if (farms.length > 0) handleSort(sortStatus.key, false, sortStatus.order);
  }, [farms, sortedFarmsSet]);

  const handleSort = (key: string, toggle: boolean, defaultOrder?: number) => {
    let newSortStatus: {
      key: string;
      order: number | undefined;
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
        order: defaultOrder,
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
    }

    sortedFarmsSet([...farms].sort(sortFn));
  };

  return (
    <div className="flex flex-col">
      <div>
        <div className="inline-block min-w-full align-middle">
          {farms.length > 0 ? (
            <div>
              <table className="min-w-full text-baseBlue dark:text-white">
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
                      className="px-3 pt-9 pb-6 text-left cursor-pointer"
                      onClick={() => handleSort("tvl", true)}
                    >
                      <div className="flex items-center">
                        <Tooltip
                          content="Total Value Locked. Amount of money currently invested in the farm, denoted in USD."
                          onButtonClick={() => {
                            handleSort("tvl", true);
                            // trackEventWithProperty("table-sorting", {
                            //   sortingType: "tvl",
                            // });
                          }}
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
                      className="flex px-3 pt-9 pb-6 text-left cursor-pointer"
                      onClick={() => {
                        handleSort("yield", true);
                        // trackEventWithProperty("table-sorting", {
                        //   sortingType: "yield",
                        // });
                      }}
                    >
                      <div className="flex items-center">
                        <Tooltip
                          content="The percentage of returns the farm offers on staking for an year."
                          onButtonClick={() => handleSort("yield", true)}
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
                      </div>
                    </th>
                    <th
                      scope="col"
                      className="hidden md:table-cell px-3 pt-9 pb-6 text-left cursor-pointer"
                    >
                      <span>Rewards</span>
                    </th>
                    <th scope="col" className="pt-9 pb-6 pl-4 pr-3 sm:pl-6">
                      <span className="sr-only">Go to farm</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D9D9] dark:divide-[#222A39] transition duration-200">
                  <FarmsList farms={sortedFarms} />
                </tbody>
              </table>
            </div>
          ) : noResult ? (
            <div className="flex items-center justify-center px-4 py-10 sm:px-6 md:px-28 font-spaceGrotesk text-base font-bold text-baseBlueDark dark:text-bodyGray leading-5">
              <p>No Results. Try searching for something else.</p>
            </div>
          ) : (
            <div className="px-6 py-10 text-center animate-pulse text-lg text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-600 sm:rounded-lg">
              🌾 Finding Farms 🌾
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListicleTable;
