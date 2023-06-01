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
    <div className="flex flex-col sm:flex-row items-center w-full sm:w-fit font-medium text-[13px] leading-[18px] gap-2 mx-[6.5px] sm:mx-0 py-1 px-1 sm:pl-[6px] sm:pr-3 rounded-2xl sm:rounded-full bg-[#E7F8F3] bg-opacity-30 mix-blend-normal">
      <div className="rounded-2xl sm:rounded-full bg-success300 inline-flex w-full sm:w-fit justify-center sm:justify-start items-center gap-x-1 pl-[6px] pr-2 py-[2px]">
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
