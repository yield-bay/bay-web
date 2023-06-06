import SearchInput from "@components/Library/SearchInput";
import MetaTags from "@components/Common/metaTags/MetaTags";
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
import { useAccount } from "wagmi";
import { dotAccountAtom } from "@store/accountAtoms";

const PortfolioPage = () => {
  // Avaiable chains we are supporting
  const chains = ["moonriver", "moonbeam", "astar", "mangata"];
  // Storage
  const [searchTerm, setSearchTerm] = useState("");
  const [positionType, setPositionType] = useState(0);
  const [userPositions, setUserPositions] = useState<any[]>([]);
  const [netWorth, setNetWorth] = useState(0);
  const [totalUnclaimedRewards, setTotalUnclaimedRewards] = useState(0);

  // Users wallet
  const { isConnected } = useAccount();
  const [account] = useAtom(dotAccountAtom);

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

  useEffect(() => {
    if (userPositions) {
      const netWorth = parseFloat(calcNetWorth(userPositions));
      const unclaimedRewards = parseFloat(
        calcTotalUnclaimedRewards(userPositions)
      );
      setNetWorth(netWorth);
      setTotalUnclaimedRewards(unclaimedRewards);
    }
  }, [userPositions]);

  return (
    <div className="px-6 sm:px-[72px] text-[#475467] z-10">
      <MetaTags title={`Portfolio • ${APP_NAME}`} />
      <div className="mb-[30px] text-white flex flex-col gap-y-6 sm:flex-row gap-x-[17px] w-full">
        <div
          className={clsx(
            "w-full sm:w-1/2 rounded-xl p-6 text-left bg-net-worth-card",
            userPositions.length == 0 && "max-w-[364px]"
          )}
        >
          <p className="font-medium text-base leading-6">Net Worth</p>
          <p className="mt-3 font-semibold text-4xl leading-[44px]">
            ${isConnected || account ? netWorth : "???"}
          </p>
        </div>
        {(isConnected || account) && userPositions.length > 0 ? (
          totalUnclaimedRewards >= 0 ? (
            <div className="w-full sm:w-1/2 rounded-xl p-6 text-left bg-rewards-card">
              <p className="font-medium text-base leading-6">
                Unclaimed rewards worth
              </p>
              <p className="mt-3 font-semibold text-4xl leading-[44px]">
                ${totalUnclaimedRewards}
              </p>
            </div>
          ) : (
            <div className="w-1/2 rounded-xl p-6 text-left border border-[#D6D6D6]">
              <p className="font-medium text-base leading-6">No Rewards Yet</p>
              <p className="mt-3 font-semibold text-4xl leading-[44px]"></p>
            </div>
          )
        ) : null}
      </div>
      <div className="flex flex-col bg-white rounded-xl">
        {/* Container Header */}
        <div
          className="flex flex-col-reverse sm:flex-row items-center justify-between
                bg-white py-0 sm:py-4 border-b border-[#EAECF0] px-0 sm:px-6 md:pl-16 md:pr-8 lg:px-12 font-medium text-[#66686B] text-sm leading-5 rounded-t-xl"
        >
          <div className="inline-flex pb-4 sm:py-0 w-full sm:w-fit justify-center sm:justify-start items-center font-semibold text-[#1D2939] gap-x-8">
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
          <div className="flex flex-row items-center w-full justify-between sm:justify-end p-4 sm:p-0 gap-x-3 sm:gap-x-4">
            <SearchInput term={searchTerm} setTerm={setSearchTerm} />
            <SelectChain availableChains={chains} />
          </div>
        </div>
        {/* Positions catagorized by Chains */}
        {isConnected || account !== null ? (
          userPositions.length == 0 || netWorth == 0 ? (
            <div className="flex justify-center text-[#1D2939] h-[calc(100vh-107px)] sm:h-[calc(100vh-144px)">
              <div className="flex flex-col mt-[125px] h-fit gap-y-[46px] items-center text-center">
                <p className="font-semibold px-20 sm:px-0 text-center sm:font-bold text-xl leading-6">
                  No Liquidity Positions Yet
                </p>
                <Link href="/">
                  <button className=" max-w-[217px] sm:max-w-full px-6 py-3 sm:p-6 border border-[#D0D5DD] bg-[#F9FAFB] text-sm sm:text-2xl font-semibold leading-4 sm:leading-7 rounded-lg shadow hover:shadow-md">
                    Explore Opportunities to earn on Yieldbay
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-y-8 sm:gap-y-16 py-8 sm:py-16 px-[18px] sm:px-12">
              {chains.map((chain, index) => {
                // Check if chain has any positions
                const positionsByChain = filteredPositions.filter(
                  (position) => chain === position.chain
                );
                if (positionsByChain.length > 0) {
                  return (
                    <div
                      className="flex flex-col gap-y-2 sm:gap-y-6"
                      key={index}
                    >
                      <h1 className="font-semibold text-base sm:text-2xl leading-5 text-[#1D2939]">
                        {formatFirstLetter(chain)}
                      </h1>
                      {/* Card */}
                      <ul
                        role="list"
                        className="grid grid-cols-1 base:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
                      >
                        {farms.length > 0 ? (
                          positionsByChain.map(
                            (position: any, index: number) => {
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
                                    <div className="flex w-full flex-col space-y-4 items-start truncate">
                                      <FarmAssets
                                        logos={thisFarm?.asset.logos}
                                      />
                                      <div className="">
                                        <p className="text-[#101828] font-medium text-xl leading-5">
                                          {tokenNames.map(
                                            (tokenName, index) => (
                                              <span key={index}>
                                                {tokenName}
                                                {index !==
                                                  tokenNames.length - 1 && "-"}
                                              </span>
                                            )
                                          )}
                                        </p>
                                        <p className="mt-1 leading-5">
                                          {formatFirstLetter(position.protocol)}{" "}
                                          on {formatFirstLetter(position.chain)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex flex-row justify-between py-6">
                                    <div className="flex flex-col gap-y-2">
                                      <p className="truncate text-sm leading-5">
                                        Total Holdings
                                      </p>
                                      <p className="text-2xl leading-7 font-semibold text-[#101828]">
                                        $
                                        {(
                                          position.unstaked.amountUSD +
                                          position.staked.amountUSD
                                        ).toFixed(2)}
                                      </p>
                                      <p className="inilne-flex p-2 bg-[#F5F5F5] rounded-lg text-base leading-5 max-w-fit">
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
                                            <QuestionMarkCircleIcon className="hidden sm:block w-4 h-4 text-[#C0CBDC] mr-1" />
                                          </Tooltip>
                                          Idle
                                        </p>
                                        <p className="text-[#4D6089] font-semibold text-xl leading-7">
                                          $
                                          {position?.unstaked?.amountUSD.toFixed(
                                            2
                                          )}
                                        </p>
                                        <p className="inline-flex p-2 bg-[#F5F5F5] rounded-lg text-base leading-5">
                                          <span className="font-bold">
                                            $
                                            {position?.unstaked.amount.toFixed(
                                              2
                                            )}
                                          </span>{" "}
                                          LP
                                        </p>
                                      </div>
                                      <div className="flex flex-col items-end gap-y-1">
                                        <p className="inline-flex items-center text-sm leading-5">
                                          <Tooltip
                                            label="Idles balance"
                                            placement="top"
                                          >
                                            <QuestionMarkCircleIcon className="hidden sm:block w-4 h-4 text-[#C0CBDC] mr-1" />
                                          </Tooltip>
                                          Staked
                                        </p>
                                        <p className="text-[#4D6089] font-semibold text-xl leading-7">
                                          $
                                          {position?.staked.amountUSD.toFixed(
                                            2
                                          )}
                                        </p>
                                        <p className="inline-flexp-2 bg-[#F5F5F5] rounded-lg text-base leading-5">
                                          <span className="font-bold">
                                            $
                                            {position?.staked.amount.toFixed(2)}
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
                                    <div className="flex flex-col gap-2 sm:flex-row items-center text-base leading-5 justify-center py-6 bg-[#EDEDFF] rounded-lg">
                                      <span className="font-medium">
                                        Staked at{" "}
                                        {(
                                          thisFarm?.apr.base +
                                          thisFarm?.apr.reward
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
                            }
                          )
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
          )
        ) : (
          <div className="relative flex justify-center text-[#1D2939]">
            <div className="absolute flex flex-col mt-[151px] h-fit items-center">
              <p className="max-w-[183px] text-center font-bold text-xl leading-6">
                Connect wallet To View Positions
              </p>
            </div>
            <div className="w-full p-0 sm:px-12 sm:py-8 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <div className=" h-96 sm:h-[340px] bg-[#FFFFFF] sm:bg-[#FBFBFB] border border-[#EAECF0] rounded-b-xl sm:rounded-xl shadow-none sm:shadow" />
              <div className="hidden sm:block h-[340px] bg-[#FBFBFB] border border-[#EAECF0] rounded-xl shadow" />
              <div className="hidden sm:block h-[340px] bg-[#FBFBFB] border border-[#EAECF0] rounded-xl shadow" />
              <div className="hidden sm:block h-[340px] bg-[#FBFBFB] border border-[#EAECF0] rounded-xl shadow" />
              <div className="hidden sm:block h-[340px] bg-[#FBFBFB] border border-[#EAECF0] rounded-xl shadow" />
              <div className="hidden sm:block h-[340px] bg-[#FBFBFB] border border-[#EAECF0] rounded-xl shadow" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioPage;
