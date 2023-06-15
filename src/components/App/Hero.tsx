import { FC, memo } from "react";
import { tvlCount, tvlFormatter } from "@utils/statsMethods";
import { FarmType } from "@utils/types";

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
    <div className="flex flex-col sm:flex-row items-center w-full sm:w-fit font-medium text-[13px] leading-[18px] gap-2 mx-[6.5px] sm:mx-0 py-1 px-1 sm:pl-[6px] sm:pr-3 rounded-2xl sm:rounded-full bg-[#E7F8F3] bg-opacity-30 mix-blend-normal">
      <div className="rounded-2xl sm:rounded-full bg-success300 inline-flex w-full sm:w-fit justify-center sm:justify-start items-center gap-x-1 pl-[6px] pr-2 py-[2px]">
        <div className="rounded-full w-[6px] h-[6px] bg-success500" />
        <p className="text-success700">
          Tracking ${tvl}
          {suffix} TVL
        </p>
      </div>
      <p>
        <span>across {totalFarms} Farms and </span>
        <span
          className="underline cursor-pointer underline-offset-2"
          onClick={() => setOpen(true)}
        >
          {totalProtocols} Protocols
        </span>
      </p>
    </div>
  );
};

const Hero: FC<Props> = ({ farms, totalProtocols, setOpen }) => {
  return (
    <div className="px-6 sm:px-0">
      {/* Center Container */}
      <div className="mx-auto max-w-[278px] md:max-w-xl mb-10 mt-4 sm:mt-[13px]">
        <h1
          className="mb-11 sm:mb-4 sm:px-4 font-satoshi font-bold text-[28px] sm:text-3xl md:text-[32px] leading-8 sm:leading-10 md:leading-[38.4px] text-center text-[#D9D9D9]"
          id="hero-heading"
        >
          discover & earn yield from polkadot and kusama paraverse
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
