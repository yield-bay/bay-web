import Image from "next/image";
import Tooltip from "./Tooltip";

type RewardsProps = {
  rewards: {
    amount: number;
    asset: string;
    freq: string;
    valueUSD: number;
  }[];
};

export default function Rewards({ rewards }: RewardsProps) {
  return (
    <div className="flex justify-start w-full">
      <Tooltip
        label={
          <div className="flex flex-col gap-2">
            {rewards.map((reward, index) => (
              <div
                key={index}
                className="flex justify-start items-center gap-x-2"
              >
                <Image
                  src={`https://raw.githubusercontent.com/yield-bay/assets/main/list/${reward.asset}.png`}
                  alt={reward.asset}
                  width={12}
                  height={12}
                />
                <span>
                  {parseFloat(reward.amount.toFixed(1)).toLocaleString("en-US")}
                </span>
                <span>
                  {reward.asset}/{reward.freq === "Weekly" ? "WEEK" : "DAY"}
                </span>
              </div>
            ))}
          </div>
        }
        placement="top"
      >
        <div className="inline-flex -space-x-1">
          {rewards.map((reward, index) => (
            <div
              key={index}
              className="z-10 flex overflow-hidden ring-[1.5px] ring-white rounded-full bg-[#EAEAF1]"
            >
              <Image
                src={`https://raw.githubusercontent.com/yield-bay/assets/main/list/${reward.asset}.png`}
                alt={reward.asset}
                width={24}
                height={24}
              />
            </div>
          ))}
        </div>
      </Tooltip>
    </div>
  );
}
