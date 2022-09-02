import Image from "next/image";

type RewardsProps = {
  rewards: {
    amount: number;
    asset: string;
    freq: string;
    valueUSD: number;
  }[];
};

export default function Rewards({ rewards }: RewardsProps) {
  console.log("rewards", rewards);
  return (
    <div className="flex justify-start pl-3 w-full">
      <div className="hidden md:flex flex-row items-center justify-center p-1 -space-x-0.5">
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
    </div>
  );
}
