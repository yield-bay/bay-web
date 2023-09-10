import { FC, memo } from "react";
import { tvlCount, tvlFormatter } from "@utils/statsMethods";
import { FarmType } from "@utils/types/common";

interface Props {
  farms: FarmType[];
  totalProtocols: number;
  setOpen: (open: boolean) => void;
}

interface FarmStatsProps {
  totalTVL: number;
  totalFarms: number;
  totalProtocols: number;
  setOpen: (open: boolean) => void;
}

const FarmStats: FC<FarmStatsProps> = ({
  totalTVL,
  totalFarms,
  totalProtocols,
  setOpen,
}) => {
  const [tvl, suffix] = tvlFormatter(totalTVL);
  return (
    <div className="flex flex-col sm:flex-row items-center w-full sm:w-fit font-medium text-[14px] leading-[18px] gap-2 mx-[6.5px]  py-1 px-1 rounded-2xl sm:rounded-full bg-[#E7F8F3] bg-opacity-30 mix-blend-normal">
      <div className="rounded-2xl sm:rounded-full bg-success300 inline-flex w-full sm:w-fit justify-center sm:justify-start items-center gap-x-1 px-3 py-[3px]">
        <div className="rounded-full w-[6px] h-[6px] bg-success500 animate-pulse" />
        <p className="text-success700 ml-1">
          Tracking ${tvl}
          {suffix} TVL
        </p>
      </div>
      {/* <p className="pb-[2px]">
        <span>across {totalFarms} Farms and </span>
        <span
          className="underline cursor-pointer underline-offset-2"
          onClick={!!totalProtocols ? () => setOpen(true) : () => {}}
        >
          {totalProtocols} Protocols
        </span>
      </p> */}
    </div>
  );
};

const Hero: FC<Props> = ({ farms, totalProtocols, setOpen }) => {
  return (
    <div className="px-6 sm:px-0">
      {/* Center Container */}
      <div className="mx-auto max-w-[278px] md:max-w-xl mb-12 mt-4 sm:mt-[13px]">
        <h1
          className="mb-6 sm:mb-6 sm:px-4 font-satoshi font-bold text-[28px] sm:text-3xl md:text-[32px] leading-8 sm:leading-10 md:leading-[38.4px] text-center text-slate-100"
          id="hero-heading"
        >
          Discover & Earn in Polkadot's Paraverse
        </h1>
        <div className="flex justify-center w-full">
          <FarmStats
            totalTVL={tvlCount(farms)}
            totalFarms={farms.length}
            totalProtocols={totalProtocols}
            setOpen={setOpen}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(Hero);
