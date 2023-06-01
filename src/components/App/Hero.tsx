import { FC, memo } from "react";
import FarmStats from "@components/Library/FarmStats";
import { protocolCount, tvlCount } from "@utils/statsMethods";
import { FarmType } from "@utils/types";

interface Props {
  farms: FarmType[];
}

const Hero: FC<Props> = ({ farms }) => {
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
            totalProtocols={protocolCount(farms)}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(Hero);
