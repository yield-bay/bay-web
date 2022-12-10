import { ChevronRightIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";

const LeaderBanner = () => {
  const router = useRouter();
  return (
    <div className="hidden md:flex flex-row items-center absolute left-[180px] top-10 lg:top-9 lg:left-0 lg:right-0 mx-auto bg-[#010813] text-white select-none rounded-xl py-[14px] px-[19px] gap-x-6 font-spaceGrotesk max-w-[340px] lg:max-w-sm">
      <span className="text-slate-400">NEW</span>
      <span className="text-xs lg:text-sm">
        Climb the Leaderboard & earn NFTs
      </span>
      <ChevronRightIcon
        onClick={() => {
          router.push(`/leaderboard`);
        }}
        className="text-[#999999] w-[28px] cursor-pointer"
      />
    </div>
  );
};

export default LeaderBanner;
