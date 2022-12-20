import { FC } from "react";
import { LeaderboardType } from "@utils/types";

const RankingTable: FC<{ leaderboardStats: LeaderboardType[] }> = ({
  leaderboardStats,
}) => {
  return (
    <div className="inline-block min-w-full align-middle">
      <div>
        <table className="min-w-full text-white">
          <thead className="font-bold text-base leading-5">
            <tr>
              <th scope="col" className="pt-9 pb-6 pl-8 lg:pl-56 xl:pl-[369px]">
                <span className="">Rank</span>
              </th>
              <th scope="col" className="pt-9 pb-6 ">
                Address
              </th>
              <th scope="col" className="pt-9 pb-6 lg:pr-56 xl:pr-[390px] ">
                <span>Shares</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#445AAD] divide-opacity-50">
            {leaderboardStats.map((stat, index: number) => (
              <tr key={stat.address}>
                <td className="py-8 pl-8 lg:pl-[240px] xl:pl-[390px] text-center whitespace-nowrap">
                  <span className="">{index + 1}</span>
                </td>
                <td className=" py-8 text-center whitespace-nowrap">
                  {stat.address?.slice(0, 4)}...{stat.address?.slice(-4)}
                </td>
                <td className="text-center py-8 lg:pr-[250px] xl:pr-[420px] whitespace-nowrap">
                  {stat.users_brought}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingTable;
