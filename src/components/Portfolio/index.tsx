import SearchInput from "@components/Library/SearchInput";
import MetaTags from "@components/metaTags/MetaTags";
import { APP_NAME } from "@utils/constants";
import clsx from "clsx";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ChevronDownIcon,
  PhoneIcon,
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
import { filteredChainAtom } from "@store/atoms";
import useFilteredPositionType from "@hooks/useFilteredPositionType";

// Testing Object of position
const positions = {
  "moonbeam-stellaswap-0xF3a5454496E26ac57da879bf3285Fa85DEBF0388-38-axlDualPool":
    {
      unstaked: {
        amount: 0,
        amountUSD: 0,
      },
      staked: {
        amount: 510.6994730234621,
        amountUSD: 512.5126463600104,
      },
      unclaimedRewards: [
        {
          token: "STELLA",
          amount: 20.164450219501695,
          amountUSD: 20.164450219501695,
        },
        {
          token: "WGLMR",
          amount: 15.52313716327595,
          amountUSD: 15.52313716327595,
        },
      ],
    },
  "moonbeam-curve-0xC106C836771B0B4f4a0612Bd68163Ca93be1D340-14-stDOT LP": {
    unstaked: {
      amount: 0.10615991769124165,
      amountUSD: 0.5992796244723804,
    },
    staked: {
      amount: 0,
      amountUSD: 0,
    },
    unclaimedRewards: [
      {
        token: "LDO",
        amount: 0,
        amountUSD: 0,
      },
    ],
  },
  "moonbeam-curve-0x4efb9942e50aB8bBA4953F71d8Bebd7B2dcdE657-18-d2o-xcUSDT LP":
    {
      unstaked: {
        amount: 0,
        amountUSD: 0,
      },
      staked: {
        amount: 2.105965635688815,
        amountUSD: 2.106643574699173,
      },
      unclaimedRewards: [
        {
          token: "WGLMR",
          amount: 0.04885905729800752,
          amountUSD: 0.04885905729800752,
        },
      ],
    },
  "moonriver-solarbeam-0x0329867a8c457e9F75e25b0685011291CD30904F-6-WMOVR-xcKSM LP":
    {
      unstaked: {
        amount: 3.3752569886e-7,
        amountUSD: 0.010805298245182095,
      },
      staked: {
        amount: 0,
        amountUSD: 0,
      },
      unclaimedRewards: [
        {
          token: "SOLAR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
      ],
    },
  "moonriver-solarbeam-0x0329867a8c457e9F75e25b0685011291CD30904F-10-WMOVR-USDC LP":
    {
      unstaked: {
        amount: 2.7230233464e-8,
        amountUSD: 0.2146750120287031,
      },
      staked: {
        amount: 0,
        amountUSD: 0,
      },
      unclaimedRewards: [
        {
          token: "SOLAR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
      ],
    },
  "moonriver-solarbeam-0x0329867a8c457e9F75e25b0685011291CD30904F-9-FRAX-3pool":
    {
      unstaked: {
        amount: 0.000996519600028022,
        amountUSD: 0.00100718736901687,
      },
      staked: {
        amount: 0,
        amountUSD: 0,
      },
      unclaimedRewards: [
        {
          token: "SOLAR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
      ],
    },
  "moonriver-solarbeam-0x0329867a8c457e9F75e25b0685011291CD30904F-12-ETH-WMOVR LP":
    {
      unstaked: {
        amount: 0.000001002834014023,
        amountUSD: 0.00025896527140568,
      },
      staked: {
        amount: 0,
        amountUSD: 0,
      },
      unclaimedRewards: [
        {
          token: "SOLAR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
      ],
    },
  "moonriver-solarbeam-0x0329867a8c457e9F75e25b0685011291CD30904F-18-SOLAR-WMOVR LP":
    {
      unstaked: {
        amount: 0.000542827971554763,
        amountUSD: 0.00037704445086769495,
      },
      staked: {
        amount: 0,
        amountUSD: 0,
      },
      unclaimedRewards: [
        {
          token: "SOLAR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
      ],
    },
  "moonriver-solarbeam-0x0329867a8c457e9F75e25b0685011291CD30904F-25-kBTC-BTC":
    {
      unstaked: {
        amount: 2.39272003623e-7,
        amountUSD: 0.006322346311770977,
      },
      staked: {
        amount: 0,
        amountUSD: 0,
      },
      unclaimedRewards: [
        {
          token: "SOLAR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "xcKINT",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
        {
          token: "WMOVR",
          amount: 0,
          amountUSD: 0,
        },
      ],
    },
  "moonriver-solarbeam-0x0329867a8c457e9F75e25b0685011291CD30904F-36-WMOVR": {
    unstaked: {
      amount: 2.3791017438e-8,
      amountUSD: null,
    },
    staked: {
      amount: 0,
      amountUSD: null,
    },
    unclaimedRewards: [
      {
        token: "SOLAR",
        amount: 0,
        amountUSD: 0,
      },
    ],
  },
  "moonriver-solarbeam-0x0329867a8c457e9F75e25b0685011291CD30904F-20-BNB-BUSD LP":
    {
      unstaked: {
        amount: 0.009961012323632836,
        amountUSD: 0.3721775792041476,
      },
      staked: {
        amount: 0,
        amountUSD: 0,
      },
      unclaimedRewards: [
        {
          token: "SOLAR",
          amount: 0,
          amountUSD: 0,
        },
      ],
    },
  "moonriver-solarbeam-0x0329867a8c457e9F75e25b0685011291CD30904F-37-FRAX-WMOVR LP":
    {
      unstaked: {
        amount: 0.013473274250934319,
        amountUSD: 0.10845884385877262,
      },
      staked: {
        amount: 0,
        amountUSD: 0,
      },
      unclaimedRewards: [
        {
          token: "SOLAR",
          amount: 0,
          amountUSD: 0,
        },
      ],
    },
};

const PortfolioPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [positionType, setPositionType] = useState(0);
  const [userPositions, setUserPositions] = useState<any[]>([]);
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
    const positionsArray = Object.entries(positions).map(([key, value]) => {
      const farmInfo = key.split("-");
      const lpSymbol = joinArrayElements(farmInfo, 4, farmInfo.length - 1);
      return {
        chain: farmInfo[0],
        protocol: farmInfo[1],
        address: farmInfo[2],
        id: farmInfo[3],
        lpSymbol,
        ...value,
      };
    });
    // Filtering out the positions with null balance values
    const temp = positionsArray.filter((position) => {
      return (
        position.unstaked.amountUSD != null && position.staked.amountUSD != null
      );
    });
    console.log("user positions", temp);
    setUserPositions(temp);
  }, []);

  return (
    <div className="px-[72px] text-[#475467]">
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
            <SelectChain
              availableChains={["moonriver", "moonbeam", "astar", "mangata"]}
            />
          </div>
        </div>
        {/* Positions catagorized by Chains */}
        <div className="py-16 px-12">
          <div className="flex flex-col gap-y-6">
            <h1 className="font-semibold text-2xl leading-5 text-[#1D2939]">
              Stellaswap
            </h1>
            <ul
              role="list"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {/* Card */}
              {filteredPositions.map((position, index) => {
                const tokenNames = formatTokenSymbols(position.lpSymbol);
                return (
                  <li
                    key={index + 1}
                    className="col-span-1 divide-y divide-[#EAECF0] p-6 border border-[#EAECF0] max-w-sm rounded-xl bg-white shadow"
                  >
                    <div className="flex-1 flex flex-row justify-between truncate mb-6">
                      <div className="flex items-center space-x-4">
                        {/* <FarmAssets logos={} /> */}
                        <div>
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
                        <p className="text-sm leading-5">Total Holdings</p>
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
                              position.unstaked.amount + position.staked.amount
                            ).toFixed(2)}
                          </span>{" "}
                          LP
                        </p>
                      </div>
                      <div className="flex flex-row gap-x-3">
                        <div className="flex flex-col items-end gap-y-1">
                          <p className="inline-flex items-center text-sm leading-5">
                            <Tooltip label="Idle balance" placement="top">
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
                            <Tooltip label="Idel balance" placement="top">
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
                          Staked at 65% APY
                        </span>
                        <Link
                          href={`/farm/${position.id}?addr=${position.address}`}
                          className="font-bold underline underline-offset-2"
                        >
                          View Farm
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;

{
  /* <MetaTags title={`Portfolio • ${APP_NAME}`} /> */
}
