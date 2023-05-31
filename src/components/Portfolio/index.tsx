import SearchInput from "@components/Library/SearchInput";
import MetaTags from "@components/metaTags/MetaTags";
import { APP_NAME } from "@utils/constants";
import clsx from "clsx";
import { useEffect, useState } from "react";
import {
  ChevronDownIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/outline";
import FarmAssets from "@components/Library/FarmAssets";
import { formatFirstLetter, formatTokenSymbols } from "@utils/farmListMethods";
import Tooltip from "@components/Library/Tooltip";
import Link from "next/link";
import SelectChain from "@components/Library/SelectChain";
import {
  calcNetWorth,
  calcTotalUnclaimedRewards,
  joinArrayElements,
} from "@utils/portfolioMethods";
import useFilteredPositions from "@hooks/useFilteredPositions";
import useFilteredByChain from "@hooks/useFilteredByChain";
import { useAtom } from "jotai";
import { filteredChainAtom, positionsAtom } from "@store/atoms";
import useFilteredPositionType from "@hooks/useFilteredPositionType";
import { useQuery } from "@tanstack/react-query";
import { fetchListicleFarms } from "@utils/api";
import { FarmType } from "@utils/types";

const PortfolioPage = () => {
  // Avaiable chains we are supporting
  const chains = ["moonriver", "moonbeam", "astar", "mangata"];
  // Storage
  const [searchTerm, setSearchTerm] = useState("");
  const [positionType, setPositionType] = useState(0);
  const [userPositions, setUserPositions] = useState<any[]>([]);

  // Atoms
  const [positions] = useAtom(positionsAtom);
  const [selectedChain] = useAtom(filteredChainAtom);

  // Filteration layers
  const filteredByType = useFilteredPositionType(userPositions, positionType);
  const filteredByChain = useFilteredByChain(filteredByType, selectedChain);
  const [filteredPositions, noFilteredPositions] = useFilteredPositions(
    filteredByChain,
    searchTerm
  );

  useEffect(() => {
    // Creating a desired array of position objects
    if (Object.keys(positions).length > 0) {
      const positionsArray = Object.entries(positions).map(([key, value]) => {
        const farmInfo = key.split("-");
        const lpSymbol = joinArrayElements(farmInfo, 4, farmInfo.length - 1);
        return {
          chain: farmInfo[0],
          protocol: farmInfo[1],
          address: farmInfo[2],
          id: farmInfo[3],
          lpSymbol,
          ...(value as any),
        };
      });
      // Filtering out the positions with null or NaN balance values
      const temp = positionsArray.filter((position) => {
        return (
          !isNaN(position.unstaked.amountUSD) ||
          !isNaN(position.staked.amountUSD)
        );
      });
      // console.log("user positions", temp);
      setUserPositions(temp);
    }
  }, [positions]);

  // Fetching all farms
  const { isLoading, data: farmsList } = useQuery({
    queryKey: ["farmsList"],
    queryFn: async () => {
      try {
        const { farms } = await fetchListicleFarms();
        return farms;
      } catch (error) {
        console.error(error);
      }
    },
  });
  const farms: FarmType[] = isLoading ? new Array<FarmType>() : farmsList;

  return (
    <div className="px-[72px] text-[#475467]">
      <MetaTags title={`Portfolio • ${APP_NAME}`} />
      <div className="mb-[30px] text-white inline-flex gap-x-[17px] w-full">
        <div className="w-1/2 rounded-xl p-6 text-left bg-net-worth-card">
          <p className="font-medium text-base leading-6">Net Worth</p>
          <p className="mt-3 font-semibold text-4xl leading-[44px]">
            ${calcNetWorth(userPositions)}
          </p>
        </div>
        <div className="w-1/2 rounded-xl p-6 text-left bg-rewards-card">
          <p className="font-medium text-base leading-6">
            Unclaimed rewards worth
          </p>
          <p className="mt-3 font-semibold text-4xl leading-[44px]">
            ${calcTotalUnclaimedRewards(userPositions)}
          </p>
        </div>
      </div>
      <div className="flex flex-col bg-white rounded-xl">
        {/* Container Header */}
        <div
          className="flex flex-col-reverse sm:flex-row items-center justify-between
                bg-white mt-8 sm:mt-0 py-0 sm:py-4 border-b border-[#EAECF0] px-0 sm:px-6 md:pl-16 md:pr-8 lg:px-12 font-medium text-[#66686B] text-sm leading-5 rounded-t-xl"
        >
          <div className="inline-flex items-center font-semibold text-[#1D2939] gap-x-8">
            <button
              onClick={() => setPositionType(0)}
              className={clsx(
                "focus:outline-none",
                positionType !== 0 && "opacity-40"
              )}
            >
              All
            </button>
            <button
              onClick={() => setPositionType(1)}
              className={clsx(
                "focus:outline-none",
                positionType !== 1 && "opacity-40"
              )}
            >
              Idle
            </button>
            <button
              onClick={() => setPositionType(2)}
              className={clsx(
                "focus:outline-none",
                positionType !== 2 && "opacity-40"
              )}
            >
              Staked
            </button>
          </div>
          <div className="flex flex-row w-full justify-end gap-x-4">
            <SearchInput term={searchTerm} setTerm={setSearchTerm} />
            <SelectChain availableChains={chains} />
          </div>
        </div>
        {/* Positions catagorized by Chains */}
        <div className="flex flex-col gap-y-16 py-16 px-12">
          {chains.map((chain, index) => {
            // Check if chain has any positions
            const positionsByChain = filteredPositions.filter(
              (position) => chain === position.chain
            );
            if (positionsByChain.length > 0) {
              return (
                <div className="flex flex-col gap-y-6" key={index}>
                  <h1 className="font-semibold text-2xl leading-5 text-[#1D2939]">
                    {formatFirstLetter(chain)}
                  </h1>
                  {/* Card */}
                  <ul
                    role="list"
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {farms.length > 0 ? (
                      positionsByChain.map((position: any, index: number) => {
                        const tokenNames = formatTokenSymbols(
                          position.lpSymbol
                        );
                        const [thisFarm] = farms.filter(
                          (farm) =>
                            farm.id == position.id &&
                            farm.protocol == position.protocol &&
                            farm.chain == position.chain
                        );
                        return (
                          <li
                            key={index + 1}
                            className="col-span-1 divide-y divide-[#EAECF0] p-6 border border-[#EAECF0] max-w-sm rounded-xl bg-white shadow"
                          >
                            <div className="flex-1 flex flex-row justify-between truncate mb-6">
                              <div className="flex flex-col space-y-4 items-start">
                                <FarmAssets logos={thisFarm?.asset.logos} />
                                <div className="">
                                  <p className="text-[#101828] font-medium text-xl leading-5">
                                    {tokenNames.map((tokenName, index) => (
                                      <span key={index}>
                                        {tokenName}
                                        {index !== tokenNames.length - 1 && "-"}
                                      </span>
                                    ))}
                                  </p>
                                  <p className="mt-1 leading-5">
                                    {formatFirstLetter(position.protocol)} on{" "}
                                    {formatFirstLetter(position.chain)}
                                  </p>
                                </div>
                              </div>
                              <p className="truncate text-xl font-bold leading-6 text-black">
                                $
                                {(
                                  position.unstaked.amountUSD +
                                  position.staked.amountUSD
                                ).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex flex-row justify-between py-6">
                              <div className="flex flex-col gap-y-2">
                                <p className="text-sm leading-5">
                                  Total Holdings
                                </p>
                                <p className="text-2xl leading-7 font-semibold text-[#101828]">
                                  $
                                  {(
                                    position.unstaked.amountUSD +
                                    position.staked.amountUSD
                                  ).toFixed(2)}
                                </p>
                                <p className="p-2 bg-[#F5F5F5] rounded-lg text-base leading-5 max-w-fit">
                                  <span className="font-bold">
                                    {(
                                      position.unstaked.amount +
                                      position.staked.amount
                                    ).toFixed(2)}
                                  </span>{" "}
                                  LP
                                </p>
                              </div>
                              <div className="flex flex-row gap-x-3">
                                <div className="flex flex-col items-end gap-y-1">
                                  <p className="inline-flex items-center text-sm leading-5">
                                    <Tooltip
                                      label="Idle balance"
                                      placement="top"
                                    >
                                      <QuestionMarkCircleIcon className="w-4 h-4 text-[#C0CBDC] mr-1" />
                                    </Tooltip>
                                    Idle
                                  </p>
                                  <p className="text-[#4D6089] font-semibold text-xl leading-7">
                                    ${position?.unstaked?.amountUSD.toFixed(2)}
                                  </p>
                                  <p className="p-2 bg-[#F5F5F5] rounded-lg text-base leading-5">
                                    <span className="font-bold">
                                      ${position?.unstaked.amount.toFixed(2)}
                                    </span>{" "}
                                    LP
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-y-1">
                                  <p className="inline-flex items-center text-sm leading-5">
                                    <Tooltip
                                      label="Idel balance"
                                      placement="top"
                                    >
                                      <QuestionMarkCircleIcon className="w-4 h-4 text-[#C0CBDC] mr-1" />
                                    </Tooltip>
                                    Staked
                                  </p>
                                  <p className="text-[#4D6089] font-semibold text-xl leading-7">
                                    ${position?.staked.amountUSD.toFixed(2)}
                                  </p>
                                  <p className="p-2 bg-[#F5F5F5] rounded-lg text-base leading-5">
                                    <span className="font-bold">
                                      ${position?.staked.amount.toFixed(2)}
                                    </span>{" "}
                                    LP
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-y-4 pt-6">
                              <button className="w-full inline-flex justify-between items-center bg-[#EDEDED] rounded-lg py-2 px-3">
                                <p>Breakdown</p>
                                <ChevronDownIcon className="h-[19px]" />
                              </button>
                              <div className="inline-flex items-center text-base leading-5 justify-center py-6 bg-[#EDEDFF] rounded-lg">
                                <span className="font-medium mr-2">
                                  Staked at{" "}
                                  {(
                                    thisFarm?.apr.base + thisFarm?.apr.reward
                                  ).toFixed(2)}
                                  % APY
                                </span>
                                <Link
                                  // href={`/farm/${position.id}?addr=${position.address}`}
                                  href={`/farm/${thisFarm?.id}?addr=${thisFarm?.asset.address}`}
                                  className="font-bold underline underline-offset-2"
                                >
                                  View Farm
                                </Link>
                              </div>
                            </div>
                          </li>
                        );
                      })
                    ) : (
                      <div className="w-full text-center">
                        loading positions...
                      </div>
                    )}
                  </ul>
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
