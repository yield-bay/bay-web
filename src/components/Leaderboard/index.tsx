import { useState, useEffect } from "react";
import type { NextPage } from "next";
import Image from "next/image";
import { useAccount } from "wagmi";
import CountUp from "react-countup";
import { LeaderboardType } from "@utils/types";

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
  const [rank, setRank] = useState(0);
  const { address, isConnected } = useAccount();

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
        <div className="sm:bg-hero-gradient">
          {/* heading / description / stats board */}
          <div className="font-spaceGrotesk mx-auto max-w-lg md:max-w-2xl pt-1 pb-[87px] sm:py-11 md:pt-16 md:pb-[115px]">
            <p
              className="mb-9 sm:mb-6 px-4 font-bold text-2xl sm:text-3xl md:text-[40px] leading-[30.62px] sm:leading-10 md:leading-[51px] text-center text-[#D9D9D9]"
              id="hero-heading"
            >
              Sharing Leaderboard
            </p>
            <div className="max-w-[290px] text-center text-base leading-5 font-medium text-[#D9D9D9] mx-auto">
              Share farms listed on yieldbay and get Reward NFTs as you climb
              higher up the leaderboard.
            </div>
            <div className="p-6 mt-[45px] sm:mt-[51px] bg-[#010E23] ring-1 text-base ring-[#314584] rounded-2xl mx-auto text-center w-[280px]">
              <div className="grid grid-cols-3 gap-[24px] text-[#D9D9D9] font-bold">
                {/* titles */}
                <span className="flex-auto text-[16px] leading-5">Shares</span>
                <span className="flex-auto text-[16px] leading-5">Rank</span>
                <span className="flex-auto text-[16px] leading-5">Reward</span>
                {/* values */}
                <span className="flex-auto text-[40px] leading-[51px]">
                  <CountUp start={0} end={userCount} duration={0.5} />
                </span>
                <span className="flex-auto text-[40px] leading-[51px]">4</span>
                <div
                  className={`overflow-hidden h-12 w-full flex justify-center ${
                    userCount > 5 ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <Image
                    src="/nft-crown.svg"
                    height={48}
                    width={48}
                    alt="commendation nft"
                    className="rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Table Section - Desktop */}
        <div className="hidden sm:block bg-[#0C0306]">
          <div className="inline-block min-w-full align-middle">
            <div>
              <table className="min-w-full text-white">
                <thead className="font-bold text-base leading-5">
                  <tr>
                    <th
                      scope="col"
                      className="pt-9 pb-6 pl-8 lg:pl-56 xl:pl-[369px]"
                    >
                      <span className="">Rank</span>
                    </th>
                    <th scope="col" className="pt-9 pb-6 ">
                      Address
                    </th>
                    <th
                      scope="col"
                      className="pt-9 pb-6 lg:pr-56 xl:pr-[390px] "
                    >
                      <span>Shares</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#445AAD] divide-opacity-50">
                  {leaderboardStats.map((c, index: number) => (
                    <tr key={c.address}>
                      <td className="py-8 pl-8 lg:pl-[240px] xl:pl-[390px] text-center whitespace-nowrap">
                        <span className="">{index + 1}</span>
                      </td>
                      <td className=" py-8 text-center whitespace-nowrap">
                        {c.address?.slice(0, 4)}...{c.address?.slice(-4)}
                      </td>
                      <td className="text-center py-8 lg:pr-[250px] xl:pr-[420px] whitespace-nowrap">
                        {c.users_brought}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Leaderboard;

/* 
   <div className="mt-[0px]">
   <div className="grid grid-cols-3 gap-[24px] py-2">
     <span className="border py-8 pl-8 md:pl-14 lg:pl-28 text-[40px] font-[700] text-[#D9D9D9]">
       Rank
     </span>
     <span className="border py-8 pl-8 md:pl-14 lg:pl-28 text-[40px] font-[700] text-[#D9D9D9]">
       Address
     </span>
     <span className="border py-8 pl-8 md:pl-14 lg:pl-28 text-[40px] font-[700] text-[#D9D9D9]">
       Shares
     </span>
   </div>
   <div>
     {leaderboardStats.map((c, index: number) => (
       <div key={index} className="grid grid-cols-3 gap-[24px]">
         <span className="border py-8 pl-8 md:pl-14 lg:pl-28 ">
           {index + 1}
         </span>
         <span className="border py-8 pl-8 md:pl-14 lg:pl-28 ">
           {c.address?.slice(0, 4)}...{c.address?.slice(-4)}
         </span>
         <span className="border py-8 pl-8 md:pl-14 lg:pl-28 text-[16px] font-[700] text-[#D9D9D9]">
           {c.users_brought}
         </span>
       </div>
     ))}
   </div>
 </div>
*/

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
