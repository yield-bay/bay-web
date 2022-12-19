import { useState, useEffect } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { LeaderboardType } from "@utils/types";
import Hero from "./Hero";
import RankingTable from "./RankingTable";
import useScreenSize from "@hooks/useScreenSize";
import RankingCards from "./RankingCards";
import ScrollToTopBtn from "@components/Library/ScrollToTopBtn";

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
  const { address, isConnected } = useAccount();
  const screenSize = useScreenSize();
  const [userCount, setUserCount] = useState(0);
  const [leaderboardStats, setLeaderboardStats] = useState<LeaderboardType[]>(
    []
  );
  // todo: setRank
  const [rank, setRank] = useState(0);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // fetching user shares & leaderboard stats
  useEffect(() => {
    if (isConnected) {
      fetchUserShares(address).then((_count) => {
        setUserCount(_count);
      });
    }

    fetchLeaderboard().then((_stats) => {
      setLeaderboardStats(_stats);
    });
  }, [address, isConnected, userCount]);

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
      <div className="relative flex flex-col flex-1">
        {/* Hero */}
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
      {showScrollBtn && <ScrollToTopBtn />}
    </main>
  );
};

export default Leaderboard;
