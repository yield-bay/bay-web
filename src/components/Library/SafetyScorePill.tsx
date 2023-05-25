import clsx from "clsx";
import { FC } from "react";

// export default function SafetyScorePill({ score }: { score: string }) {
const SafetyScorePill: FC<{ score: string }> = ({ score }) => {
  const scoreNum = parseFloat(score);
  return (
    <div
      className={clsx(
        "py-[2px] px-[10px] rounded-full w-max text-[10px] leading-5 font-medium text-sm",
        scoreNum >= 6
          ? "bg-[#ECFDF3] text-[#027A48]"
          : scoreNum >= 4
          ? "bg-[#FEF3F2] text-[#B42318]"
          : "bg-[#FEF3F2] text-[#B42318]"
      )}
    >
      {score}
    </div>
  );
};

export default SafetyScorePill;
