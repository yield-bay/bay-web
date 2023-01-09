import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { LeaderboardType } from "@utils/types";
import Hero from "./Hero";
import RankingTable from "./RankingTable";
import useScreenSize from "@hooks/useScreenSize";
import RankingCards from "./RankingCards";
import ScrollToTopBtn from "@components/Library/ScrollToTopBtn";
import MetaTags from "@components/metaTags/MetaTags";
import { trackEventWithProperty } from "@utils/analytics";
import {
  IS_PRODUCTION,
  LEADERBOARD_API_DEV,
  LEADERBOARD_API_PROD,
} from "@utils/constants";

/**
 *
 * @param address - Address of user
 * @returns Farm sharing data of the user
 */
async function fetchUserShares(address: `0x${string}` | undefined) {
  const query = { address };
  try {
    const userShares = await axios.post(
      (IS_PRODUCTION ? LEADERBOARD_API_PROD : LEADERBOARD_API_DEV) + "user",
      JSON.stringify(query)
    );
    return userShares.data;
  } catch (error) {
    console.error(error);
  }
}

async function fetchLeaderboard() {
  try {
    let leaderboard = await axios.get(
      (IS_PRODUCTION ? LEADERBOARD_API_PROD : LEADERBOARD_API_DEV) +
        "leaderboard"
    );
    leaderboard.data.sort((a: LeaderboardType, b: LeaderboardType) => {
      return b.users_brought - a.users_brought;
    });
    return leaderboard.data;
  } catch (error) {
    console.error(error);
  }
}

/**
 *
 * @param statsList - List of Leaderboard stats
 * @param userAddress - Address of the User
 * @returns Rank of the user
 */
function findUserRank(
  statsList: LeaderboardType[],
  userAddress: string
): number {
  const rank = statsList.findIndex((stats) => stats.address == userAddress);
  return rank + 1;
}

const Leaderboard: NextPage = () => {
  // Hooks
  const { address, isConnected } = useAccount();
  const screenSize = useScreenSize();
  const [userRank, setUserRank] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // fetching user shares & leaderboard stats
  const { isLoading: isLoadingShares, data: userShares } = useQuery({
    queryKey: ["userShares"],
    queryFn: async () => {
      return await fetchUserShares(address);
    },
  });

  const { isLoading: isLoadingStats, data: leaderboardData } = useQuery({
    queryKey: ["leaderboardStats"],
    queryFn: async () => {
      return await fetchLeaderboard();
    },
  });

  const userCount: number = isLoadingShares ? 0 : userShares?.users_brought;
  const ownsNft: boolean = isLoadingShares ? false : userShares?.owns_nft;
  const leaderboardStats: LeaderboardType[] = isLoadingStats
    ? new Array<LeaderboardType>()
    : leaderboardData;

  useEffect(() => {
    setUserRank(
      isLoadingShares ? 0 : findUserRank(leaderboardStats, address as string)
    );
  }, [isLoadingShares, leaderboardStats, address]);

  useEffect(() => {
    trackEventWithProperty("leaderboard-view");
  }, []);

  // state handler for visibility of scroll-to-top button
  useEffect(() => {
    if (typeof window !== undefined) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
          setShowScrollBtn(true);
        } else {
          setShowScrollBtn(false);
        }
      });
    }

    return () => {
      window.removeEventListener("scroll", () => {});
    };
  });

  return (
    <main>
      <MetaTags
        title={`Leaderboard | Get rewarded for sharing listed farms`}
        url="https://list.yieldbay.io/leaderboard"
        description="Share farms listed on yieldbay and get Reward NFTs as you climb higher up the leaderboard."
      />
      <div className="relative flex flex-col flex-1">
        {/* Hero */}
        <Hero userCount={userCount} userRank={userRank} ownsNft={ownsNft} />
        {/* Table and Cards */}
        {!isLoadingStats ? (
          screenSize === "xs" ? (
            <div className="sm:hidden bg-[#01060F]">
              <RankingCards leaderboardStats={leaderboardStats} />
            </div>
          ) : (
            <div className="hidden sm:block bg-[#0C0306]">
              <RankingTable leaderboardStats={leaderboardStats} />
            </div>
          )
        ) : (
          <div className="flex flex-col gap-y-3 pt-12 pb-60 text-center font-spaceGrotesk bg-[#01060F] sm:bg-[#0C0306]">
            <span className="animate-bounce opacity-70 text-4xl select-none">
              🌾
            </span>
            <span>loading leaderboard...</span>
          </div>
        )}
      </div>
      {showScrollBtn && <ScrollToTopBtn />}
    </main>
  );
};

export default Leaderboard;
