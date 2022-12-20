import Image from "next/image";
import { FC } from "react";
import CountUp from "react-countup";
import { useAccount } from "wagmi";
import ClientOnly from "@components/Library/ClientOnly";

const Hero: FC<{ userCount: number; userRank: number }> = ({
  userCount,
  userRank,
}) => {
  const { isConnected } = useAccount();
  return (
    <div className="sm:bg-hero-gradient z-0">
      {/* heading / description / stats board */}
      <div className="font-spaceGrotesk mx-auto max-w-lg md:max-w-2xl pt-1 pb-[87px] sm:py-11 md:pt-16 md:pb-[115px]">
        <p
          className="mb-9 sm:mb-6 px-4 font-bold text-2xl sm:text-3xl md:text-[40px] leading-[30.62px] sm:leading-10 md:leading-[51px] text-center text-[#D9D9D9]"
          id="hero-heading"
        >
          Sharing Leaderboard
        </p>
        <div className="max-w-[290px] text-center text-base leading-5 font-medium text-[#D9D9D9] mx-auto">
          Share farms listed on yieldbay and get Reward NFTs as you climb higher
          up the leaderboard.
        </div>
        {/* Stats board */}
        <ClientOnly>
          {isConnected ? (
            <div className="z-20 p-6 mt-[45px] sm:mt-[51px] bg-[#010E23] ring-1 text-base ring-[#314584] rounded-2xl mx-auto text-center w-[280px]">
              <div className="grid grid-cols-3 gap-[24px] text-[#D9D9D9] text-[16px] leading-5 font-bold">
                {/* titles */}
                <span className="flex-auto">Shares</span>
                <span className="flex-auto">Rank</span>
                <span className="flex-auto">Reward</span>
                {/* values */}
                <span className="flex-auto text-[40px] leading-[51px]">
                  <CountUp start={0} end={userCount} duration={0.5} />
                </span>
                <span className="flex-auto text-[40px] leading-[51px]">
                  <CountUp start={0} end={userRank} duration={0.5} />
                </span>
                <div
                  className={`overflow-hidden h-12 w-full flex justify-center ${
                    userCount > 5
                      ? "opacity-100"
                      : "opacity-50 cursor-not-allowed"
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
          ) : (
            <div className="mt-[45px] sm:mt-[51px] font-medium">
              <div className="flex flex-row mx-auto gap-x-[13px] px-[19px] py-[19px] rounded-xl items-center bg-[#011330] max-w-fit select-none">
                <span className="text-xl leading-6 opacity-50">!</span>
                <span className="text-sm leading-[18px]">
                  Connect Wallet to know your ranking
                </span>
              </div>
            </div>
          )}
        </ClientOnly>
      </div>
    </div>
  );
};

export default Hero;
