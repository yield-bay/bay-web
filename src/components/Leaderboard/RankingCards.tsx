import { FC } from "react";
import { LeaderboardType } from "@utils/types";

const RankingCards: FC<{ leaderboardStats: LeaderboardType[] }> = ({
  leaderboardStats,
}) => {
  return (
    <div className="relative min-w-full font-semibold text-xl leading-6 text-white">
      <div className="absolute -top-[85px] bg-hero-gradient-mob z-0 h-[85px] w-full"></div>
      {leaderboardStats.map((stat, index: number) => (
        <div
          className={`flex flex-row justify-between items-center px-[34px] py-7 border-[#1F2B52] ${
            index !== leaderboardStats.length - 1 ? "border-b" : ""
          }`}
          key={stat.address}
        >
          <div>{index + 1}</div>
          <div className="flex flex-col gap-y-4 justify-between">
            <span>
              {stat.address?.slice(0, 4)}...{stat.address?.slice(-4)}
            </span>
            <span className="text-right text-base leading-5 opacity-80">
              {stat.users_brought} Shares
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RankingCards;
