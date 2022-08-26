import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
// import { trackPageview } from "fathom-client";
import { fetchListicleFarms } from "@utils/api";
import useFilteredFarms from "@hooks/useFilteredFarms";
import ListicleTable from "./ListicleTable";
import { SearchIcon } from "@heroicons/react/solid";
import FarmStats from "@components/Library/FarmStats";
import { protocolCount, tvlCount } from "@utils/statsMethods";

const Home = () => {
  const router = useRouter();
  const [farms, setFarms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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
          <div>
            {/* Center Container */}
            <div className="mx-auto max-w-3xl py-[60px]">
              <h1 className="font-spaceGrotesk font-medium text-4xl leading-[46px] text-center text-white">
                Discover yield oppurtunities across multiple protocols and
                parachains on Polkadot and Kusama
              </h1>
              {/* Replace this with React-Select */}
              <div className="flex justify-center py-8">
                <input
                  type="text"
                  placeholder="search by token, chain or protocol name"
                  className="w-full py-[11px] px-5 max-w-[480px] text-baseBlue bg-blueSilver font-semibold text-lg leading-[22px] rounded-lg"
                />
              </div>
              <FarmStats
                totalTVL={tvlCount(farms)}
                totalFarms={farms.length}
                totalProtocols={protocolCount(farms)}
              />
            </div>
          </div>
          {/* Listicle Table */}
          {/* <div className="px-4 mx-auto max-w-6xl sm:px-6 md:px-8">
                <ListicleTable farms={farms} noResult={noFilteredFarms} />
              </div> */}
        </div>
      </main>
    </div>
  );
};

export default Home;
