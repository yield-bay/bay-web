import { FC, memo } from "react";
import FarmStats from "@components/Library/FarmStats";
import SelectFarmType from "@components/Library/SelectFarmType";
import { protocolCount, tvlCount } from "@utils/statsMethods";
import { AdjustmentsIcon } from "@heroicons/react/outline";
import SearchInput from "@components/Library/SearchInput";
import { FarmType } from "@utils/types";

interface Props {
  setProtocolModalOpen: (value: boolean) => void;
  farms: FarmType[];
  setPrefModalOpen: (value: boolean) => void;
  filteredFarms: FarmType[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const Hero: FC<Props> = ({
  setProtocolModalOpen,
  farms,
  setPrefModalOpen,
  filteredFarms,
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="bg-hero-gradient-mob sm:bg-hero-gradient">
      {/* Center Container */}
      <div className="mx-auto max-w-lg md:max-w-2xl py-10">
        <h1
          className="mb-11 sm:mb-4 font-satoshi font-bold text-2xl px-4 sm:text-3xl md:text-4xl leading-[30.62px] sm:leading-10 md:leading-[46px] text-center text-[#D9D9D9]"
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
      <div
        className="flex flex-col-reverse sm:flex-row items-center justify-between border-y sm:border-none border-[#334380] border-opacity-60
                          mt-8 sm:mt-0 py-0 sm:py-10 px-0 sm:px-6 md:pl-16 md:pr-8 lg:px-28 bg-hero-gradient-mob
                          font-medium text-base text-blueSilver leading-5"
      >
        <div className="flex items-center py-5 sm:py-0 px-9 sm:px-0 justify-between w-full sm:w-max sm:gap-x-5">
          <div className="hidden sm:block">
            <SelectFarmType />
          </div>
          <div className="sm:hidden" onClick={() => setPrefModalOpen(true)}>
            <AdjustmentsIcon className="w-4 h-4 rotate-90" />
          </div>
          <div className="sm:hidden min-w-max py-1 px-2">
            {/* TODO: While searching, if there're no farms, then too it shows Loading coz no farms */}
            {filteredFarms.length == 0
              ? "Loading..."
              : `${filteredFarms.length} Results`}
          </div>
        </div>
        <div className="flex border-b sm:border-none border-[#334380] border-opacity-40 w-full justify-center sm:justify-end lg:justify-center">
          <SearchInput term={searchTerm} setTerm={setSearchTerm} />
        </div>
        <div className="hidden sm:block min-w-max py-1 px-2 opacity-50">
          {filteredFarms.length == 0
            ? "Loading..."
            : `${filteredFarms.length} Results`}
        </div>
      </div>
    </div>
  );
};

export default memo(Hero);
