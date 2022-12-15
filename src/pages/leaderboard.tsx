import React from "react";
import CountUp from "react-countup";
import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useState } from "react";

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
  data.sort(function (a, b) {
    return b.users_brought - a.users_brought;
  });
  console.log(data);
  return data;
}

export default function Leaderboard() {
  const [userCount, setUserCount] = useState(0);
  const [leaderboardStats, setLeaderboardStats] = useState([]);
  const { address, isConnected } = useAccount();
  const [rank, setRank] = useState(0);
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
    console.log(address);
    return (
      <main>
        <div className="relative flex flex-col flex-1">
          <div className="sm:bg-hero-gradient">
            <div className="mx-auto max-w-lg md:max-w-2xl py-6 sm:py-11 md:py-[60px]">
              <h1
                className="mb-11 sm:mb-6 font-spaceGrotesk font-bold text-2xl px-4 sm:text-3xl md:text-4xl leading-[30.62px] sm:leading-10 md:leading-[46px] text-center text-[#D9D9D9]"
                id="hero-heading"
              >
                Sharing Leaderboard
              </h1>
              <div className="w-1/2 text-center text-base font-medium mx-auto">
                <span>
                  Share farms listed on yieldbay and get Reward NFTs as you
                  climb higher up the leaderboard.
                </span>
              </div>
              <div className="py-2 px-[18px] h-[127px] sm:py-3 sm:px-6 mt-[51px] ring-2 text-base ring-[#314584] rounded-xl mx-auto text-center w-[280px]">
                <div className="grid grid-cols-3 gap-[24px] py-2">
                  <span className="flex-auto text-[16px] font-[700] font-spaceGrotesk text-[#D9D9D9]">
                    Shares
                  </span>
                  <span className="flex-auto flex-auto text-[16px] font-[700] font-spaceGrotesk text-[#D9D9D9]">
                    Rank
                  </span>
                  <span className="flex-auto flex-auto text-[16px] font-[700] font-spaceGrotesk text-[#D9D9D9]">
                    Reward
                  </span>
                  <span className="flex-auto text-[40px] font-[700] font-spaceGrotesk text-[#D9D9D9]">
                    <CountUp start={0} end={userCount} duration={0.5} />
                  </span>
                  <span className="flex-auto text-[40px] font-[700] font-spaceGrotesk text-[#D9D9D9]">
                    x
                  </span>
                  <span className="flex-auto text-[40px] font-[700] font-spaceGrotesk text-[#D9D9D9]">
                    x
                  </span>
                </div>
              </div>
              <div className="mt-[40px] grid grid-cols-3 gap-[24px] py-2">
                <span className="flex-auto text-[40px] font-[700] font-spaceGrotesk text-[#D9D9D9]">
                  Rank
                </span>
                <span className="flex-auto flex-auto text-[40px] font-[700] font-spaceGrotesk text-[#D9D9D9]">
                  Address
                </span>
                <span className="flex-auto flex-auto text-[40px] font-[700] font-spaceGrotesk text-[#D9D9D9]">
                  Shares
                </span>
              </div>
              <>
                {leaderboardStats.map((c, index) => (
                  <div key={c.hash} className="grid grid-cols-3 gap-[24px]">
                    <span className="flex-auto text-[16x] font-[700] font-spaceGrotesk text-[#D9D9D9]">
                      {index + 1}
                    </span>
                    <span className="flex-auto text-[16x] font-[700] font-spaceGrotesk text-[#D9D9D9]">
                      {c.address?.slice(0, 4)}...{c.address?.slice(-4)}
                    </span>
                    <span className="flex-auto text-[16px] font-[700] font-spaceGrotesk text-[#D9D9D9]">
                      {c.users_brought}
                    </span>
                  </div>
                ))}
              </>
            </div>
          </div>
        </div>
      </main>
    );
  } else {
    return (
      <main>
        <div className="relative flex flex-col flex-1">
          <div className="sm:bg-hero-gradient">
            <div className="mx-auto max-w-lg md:max-w-2xl py-6 sm:py-11 md:py-[60px]">
              <h1
                className="mb-11 sm:mb-6 font-spaceGrotesk font-bold text-2xl px-4 sm:text-3xl md:text-4xl leading-[30.62px] sm:leading-10 md:leading-[46px] text-center text-[#D9D9D9]"
                id="hero-heading"
              >
                Connect your wallet
              </h1>
            </div>
          </div>
        </div>
      </main>
    );
  }
}
