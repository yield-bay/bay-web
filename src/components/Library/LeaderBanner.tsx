import { ChevronRightIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";

const LeaderBanner = () => {
  const router = useRouter();
  return (
    <div className="hidden md:flex flex-row items-center text-xs lg:text-sm leading-[18px] font-medium absolute left-[180px] top-10 lg:top-9 lg:left-0 lg:right-0 mx-auto bg-[#010813] text-white select-none rounded-xl py-[14px] px-[19px] gap-x-3 font-spaceGrotesk max-w-[340px] w-fit lg:max-w-sm">
      <div className="flex flex-row gap-x-1.5">
        <span className="opacity-40">NEW</span>
        <span>Climb the Leaderboard & Earn NFTs</span>
      </div>
      <ChevronRightIcon
        onClick={() => {
          router.push(`/leaderboard`);
        }}
        className="text-[#D9D9D9] w-[28px] cursor-pointer"
      />
    </div>
  );
};

export default LeaderBanner;
