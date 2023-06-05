import Image from "next/image";
import Tooltip from "./Tooltip";
import clsx from "clsx";

type RewardsProps = {
  rewards: {
    amount: number;
    asset: string;
    freq: string;
    valueUSD: number;
  }[];
};

export default function Rewards({ rewards }: RewardsProps) {
  const totalRewardsAmount = rewards.reduce(
    (acc, reward) => acc + reward.amount,
    0
  );

  return totalRewardsAmount > 0 ? (
    <div className="flex justify-end w-full">
      <Tooltip
        content={
          <div>
            {rewards.map((reward, index) => (
              <div
                key={index}
                className={clsx(
                  "flex justify-start items-center gap-x-2",
                  reward.amount == 0 && "hidden"
                )}
              >
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
                <span>
                  {reward.asset}/{reward.freq === "Weekly" ? "WEEK" : "DAY"}
                </span>
              </div>
            ))}
          </div>
        }
      >
        <div className="flex flex-row items-center justify-center p-1 -space-x-0.5">
          {rewards.map((reward, index) => (
            <div
              key={index}
              className="z-10 flex overflow-hidden ring-[3px] ring-baseBlueMid rounded-full bg-neutral-800 transition duration-200"
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
  ) : (
    <></>
  );
}
