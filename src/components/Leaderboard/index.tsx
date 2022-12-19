import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { LeaderboardType } from "@utils/types";
import Hero from "./Hero";
import RankingTable from "./RankingTable";
import useScreenSize from "@hooks/useScreenSize";
import RankingCards from "./RankingCards";

async function fetchUserShares(address: `0x${string}` | undefined) {
  const query = { address };
  let data = await (
    await fetch("https://leaderboard-api-dev.onrender.com/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    })
  ).json();
  console.log(data.users_brought);
  return data.users_brought;
}

async function fetchLeaderboard() {
  let data = await (
    await fetch("https://leaderboard-api-dev.onrender.com/leaderboard", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
  ).json();

  data.sort((a: LeaderboardType, b: LeaderboardType) => {
    return b.users_brought - a.users_brought;
  });

  console.log(data);
  return data;
}

const Leaderboard: NextPage = () => {
  // Hooks
  const [userCount, setUserCount] = useState(0);
  const [leaderboardStats, setLeaderboardStats] = useState<LeaderboardType[]>(
    []
  );
  // todo: setRank
  const [rank, setRank] = useState(0);
  const { address, isConnected } = useAccount();
  const screenSize = useScreenSize();

  // fetching user shares & leaderboard stats
  useEffect(() => {
    if (isConnected) {
      fetchUserShares(address).then((_count) => {
        setUserCount(_count);
      });

      fetchLeaderboard().then((_stats) => {
        setLeaderboardStats(_stats);
      });
    }
  }, [address, isConnected, userCount]);

  if (isConnected) {
    console.log("Address", address);
  }

  return (
    <main>
      <div className="relative flex flex-col flex-1">
        {/* Hero Section */}
        <Hero userCount={userCount} />
        {/* Table and Cards */}

        {screenSize === "xs" ? (
          <div className="sm:hidden bg-[#01060F]">
            <RankingCards leaderboardStats={leaderboardStats} />
          </div>
        ) : (
          <div className="hidden sm:block bg-[#0C0306]">
            <RankingTable leaderboardStats={leaderboardStats} />
          </div>
        )}
      </div>
    </main>
  );
};

export default Leaderboard;

// IS NOT CONNECTED
/* 
  <div className="mx-auto max-w-lg md:max-w-2xl py-6 sm:py-11 md:py-[60px]">
              <h1
                className="mb-11 sm:mb-6 font-bold text-2xl px-4 sm:text-3xl md:text-4xl leading-[30.62px] sm:leading-10 md:leading-[46px] text-center text-[#D9D9D9]"
                id="hero-heading"
              >
                Connect your wallet
              </h1>
  </div>
*/
