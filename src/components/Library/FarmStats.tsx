import { FC, memo } from "react";
import { tvlFormatter } from "@utils/statsMethods";

type FarmStatsProps = {
  totalTVL: number;
  totalFarms: number;
  totalProtocols: number;
};

const FarmStats: FC<FarmStatsProps> = ({
  totalTVL,
  totalFarms,
  totalProtocols,
}) => {
  const [tvl, suffix] = tvlFormatter(totalTVL);
  return (
    <div className="inline-flex font-medium text-[13px] leading-[18px] items-center gap-x-2 py-1 pl-[6px] pr-3 rounded-full bg-[#E7F8F354] bg-opacity-30 mix-blend-normal">
      <div className="rounded-full bg-success300 inline-flex items-center gap-x-1 pl-[6px] pr-2 py-[2px] ">
        <div className="rounded-full w-[6px] h-[6px] bg-success500" />
        <p className="text-success700">
          Tracking ${tvl}
          {suffix} TVL
        </p>
      </div>
      <p>
        across {totalFarms} Farms and {totalProtocols} Protocols
      </p>
    </div>
  );
};

export default memo(FarmStats);
