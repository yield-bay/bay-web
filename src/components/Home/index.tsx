import { useEffect, useState } from "react";
import Head from "next/head";
import { fetchListicleFarms } from "@utils/api";

const Home = () => {
  const [farms, setFarms] = useState<any>([]);

  useEffect(() => {
    fetchListicleFarms().then((res: any) => {
      setFarms(res.farms);
    });
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
        <div>
          {/* Listicle Table */}
          <div>
            <p className="text-white">Table Listicle</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
