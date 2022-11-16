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
    <div className="flex justify-end w-full">
      <Tooltip
        content={
          <div>
            {rewards.map((reward, index) => (
              <div key={index} className="flex justify-start gap-x-2">
                <div>
                  <Image
                    src={`https://raw.githubusercontent.com/yield-bay/assets/main/list/${reward.asset}.png`}
                    alt={reward.asset}
                    width={12}
                    height={12}
                  />
                </div>
                <span>
                  {parseFloat(reward.amount.toFixed(1)).toLocaleString("en-US")}
                </span>
                <span>{reward.asset}/DAY</span>
              </div>
            ))}
          </div>
        }
      >
        <div className="flex flex-row items-center justify-center p-1 -space-x-0.5">
          {rewards.map((reward, index) => (
            <div
              key={index}
              className="z-10 flex overflow-hidden ring-[3px] ring-white dark:ring-baseBlueMid rounded-full bg-white dark:bg-neutral-800 transition duration-200"
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
