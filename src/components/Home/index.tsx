// React and Next Imports
import { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";

// Library Imports
import { useAtom } from "jotai";
import { XIcon } from "@heroicons/react/outline";
// import { trackPageview } from "fathom-client";

// Misc Imports
import FarmStats from "@components/Library/FarmStats";
import Tooltip from "@components/Library/Tooltip";
import SelectFarmType from "@components/Library/SelectFarmType";
import SelectInput from "@components/Library/SelectInput";
import useSpecificFarm from "@hooks/useSpecificFarm";
import useFilteredFarmTypes from "@hooks/useFilteredFarmTypes";
import { fetchListicleFarms } from "@utils/api";
import { protocolCount, tvlCount } from "@utils/statsMethods";
import { filterFarmTypeAtom } from "@store/atoms";
import ListicleTable from "./ListicleTable";
import useFilteredFarms from "@hooks/useFilteredFarms";
import MobileFarmList from "./MobileFarmList";

const Home = () => {
  const router = useRouter();
  const [filterFarmType] = useAtom(filterFarmTypeAtom);
  const [farms, setFarms] = useState([]);
  const [searchArray, setSearchArray] = useState<
    { value: string; label: string }[]
  >([]);
  const [farmQuery, setFarmQuery] = useState<string | string[] | undefined>();
  const [idQuery, setIdQuery] = useState<string | string[] | undefined>();
  const specificFarm = useSpecificFarm(farms, idQuery, farmQuery);
  const [filteredByFarmTypes, noFarms] = useFilteredFarmTypes(
    farms,
    filterFarmType
  );
  const [filteredFarms, noFilteredFarms] = useFilteredFarms(
    filteredByFarmTypes,
    searchArray
  );

  useEffect(() => {
    setFarmQuery(router.query.farm);
    setIdQuery(router.query.id);
  }, [router]);

  useEffect(() => {
    fetchListicleFarms().then((res: any) => {
      setFarms(res.farms);
    });

    // trackPageview();
  }, []);

  return (
    <div>
      <Head>
        <title>YieldBay Farms</title>
        <meta
          name="description"
          content="YieldBay List | Discover Yield Farms in DotSama"
        />
      </Head>
      <main>
        {/* THIS IS MAIN CONTAINER -- THIS WILL CONTAIN HERO AND TABLE SECTIONS */}
        <div className="flex flex-col flex-1">
          {/* HERO SECTION */}
          <div className="px-6 sm:px-0">
            {/* Center Container */}
            <div className="mx-auto max-w-lg md:max-w-2xl py-6 sm:py-11 md:py-[60px]">
              <h1 className="font-spaceGrotesk font-medium text-base px-8 sm:text-3xl md:text-4xl leading-5 sm:leading-10 md:leading-[46px] text-center dark:text-transparent dark:bg-clip-text text-white dark:bg-gradient-to-b from-[#ACCDFF] to-white">
                Discover yield opportunities across multiple protocols and
                parachains on Polkadot and Kusama
              </h1>
              <div className="flex justify-center pt-9 pb-7 sm:py-8">
                <SelectInput
                  farms={filteredByFarmTypes}
                  setSearchArray={setSearchArray}
                />
              </div>
              <FarmStats
                totalTVL={tvlCount(farms)}
                totalFarms={farms.length}
                totalProtocols={protocolCount(farms)}
              />
            </div>
            {!idQuery ? (
              <div className="flex items-center justify-between font-medium text-base py-10 px-4 sm:px-6 md:px-28 font-spaceGrotesk text-white dark:text-blueSilver leading-5">
                <div className="flex gap-x-5 items-center">
                  <div>
                    <SelectFarmType />
                  </div>
                  <div className="border-2 rounded-[5px] py-1 px-2">
                    {filteredFarms.length} Results
                  </div>
                </div>
                <a
                  className="hover:underline inline-flex gap-x-2 cursor-pointer"
                  // TODO: Haven't found a way to reset farmtype back to All Types - Refreshing page for now
                  onClick={() => router.reload()}
                >
                  <div>View All Protocols</div>
                  <Image
                    src="/OpenIcon.svg"
                    alt="open-icon"
                    height={10}
                    width={10}
                  />
                </a>
              </div>
            ) : (
              <div className="flex items-center justify-center px-4 py-10 sm:px-6 md:px-28 font-spaceGrotesk text-base text-white leading-5">
                <p className="font-bold">
                  Showing Yield Farm with address <span>{farmQuery}</span> and
                  pool ID: <span>{idQuery}</span>
                </p>
                <Tooltip content="back to all farms">
                  <button
                    onClick={() => router.push("/")}
                    className="cursor-default transition-all duration-150"
                  >
                    <XIcon className="ml-2 w-4 text-blueSilver dark:text-[#999999]" />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
          {/* Listicle Table */}
          <div className="border border-red-500 bg-white dark:bg-baseBlueDark transition duration-200">
            <MobileFarmList farms={filteredFarms} noResult={noFarms} />
          </div>
          <div className="hidden border border-red-500 bg-white dark:bg-baseBlueDark transition duration-200">
            {/* If queries - Show Specific Farm according to queries  */}
            {!idQuery ? (
              <ListicleTable farms={filteredFarms} noResult={noFarms} />
            ) : (
              <>
                <ListicleTable farms={specificFarm} noResult={false} />
                <div className="border-t dark:border-[#222A39] w-full pt-8 pb-9">
                  <div
                    className="py-4 dark:text-bodyGray font-bold text-base leading-5 text-center cursor-default"
                    onClick={() => router.push("/")}
                  >
                    Go to home
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
