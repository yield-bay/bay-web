import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
// import { trackPageview } from "fathom-client";
import { fetchListicleFarms } from "@utils/api";
// import useFilteredFarms from "@hooks/useFilteredFarms";
import useSpecificFarm from "@hooks/useSpecificFarm";
import ListicleTable from "./ListicleTable";
import FarmStats from "@components/Library/FarmStats";
import { protocolCount, tvlCount } from "@utils/statsMethods";
import { XIcon } from "@heroicons/react/outline";
import Tooltip from "@components/Library/Tooltip";

const Home = () => {
  const router = useRouter();
  const [farms, setFarms] = useState([]);
  const [farmQuery, setFarmQuery] = useState<string | string[] | undefined>();
  const [idQuery, setIdQuery] = useState<string | string[] | undefined>();
  const specificFarm = useSpecificFarm(farms, idQuery, farmQuery);

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
          <div className="px-6">
            {/* Center Container */}
            <div className="mx-auto max-w-lg md:max-w-2xl py-11 md:py-[60px]">
              <h1 className="font-spaceGrotesk font-medium text-2xl sm:text-3xl md:text-4xl leading-8 sm:leading-10 md:leading-[46px] text-center dark:text-transparent dark:bg-clip-text text-white dark:bg-gradient-to-b from-[#ACCDFF] to-white">
                Discover yield opportunities across multiple protocols and
                parachains on Polkadot and Kusama
              </h1>
              {/* Replace this with React-Select */}
              <div className="flex justify-center py-8">
                <input
                  type="text"
                  placeholder="search by token, chain or protocol name"
                  className="w-full sm:w-4/5  md:w-full py-[11px] px-5 max-w-[480px] text-baseBlue bg-blueSilver font-semibold text-sm md:text-lg leading-[22px] rounded-lg"
                />
              </div>
              <FarmStats
                totalTVL={tvlCount(farms)}
                totalFarms={farms.length}
                totalProtocols={protocolCount(farms)}
              />
            </div>
            {idQuery && (
              <div className="flex items-center justify-center px-4 py-10 sm:px-6 md:px-28 font-spaceGrotesk text-base text-white leading-5">
                <p>
                  Showing Yield Farm with address{" "}
                  <span className="font-bold">{farmQuery}</span> and pool ID:{" "}
                  <span className="font-bold">{idQuery}</span>
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
          <div className="px-4 sm:px-6 md:px-28 bg-white dark:bg-baseBlueDark transition duration-200">
            {!idQuery ? (
              <ListicleTable farms={farms} noResult={false} />
            ) : (
              <ListicleTable farms={specificFarm} noResult={false} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
