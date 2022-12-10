import React from "react";

export default function Leaderboard() {
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
                Share farms listed on yieldbay and get Reward NFTs as you climb
                higher up the leaderboard.
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
                  41
                </span>
                <span className="flex-auto text-[40px] font-[700] font-spaceGrotesk text-[#D9D9D9]">
                  23
                </span>
                <span className="flex-auto text-[40px] font-[700] font-spaceGrotesk text-[#D9D9D9]">
                  x
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
