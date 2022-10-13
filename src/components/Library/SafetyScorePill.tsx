export default function SafetyScorePill({ score }: { score: number }) {
  return score > 7 ? (
    <div className="ml-2 py-[2px] px-[8.5px] bg-[#67C84B] text-black dark:text-black rounded-full w-max text-[10px] leading-3 font-bold">
      SAFE
    </div>
  ) : score > 5 ? (
    <div className="ml-2 py-[2px] px-[8.5px] bg-[#C8BB4B] text-black dark:text-black rounded-full w-max text-[10px] leading-3 font-bold">
      OKAY
    </div>
  ) : (
    <div className="ml-2 py-[2px] px-[8.5px] bg-[#C84B4B] text-black dark:text-black rounded-full w-max text-[10px] leading-3 font-bold">
      BAD
    </div>
  );
}
