// React and Next Imports
import { useEffect, useState } from "react";
import { useRouter, NextRouter } from "next/router";
import { NextPage } from "next";

// Library Imports
import { useAtom } from "jotai";
import { AdjustmentsIcon } from "@heroicons/react/outline";

// Misc Imports
import FarmStats from "@components/Library/FarmStats";
import SelectFarmType from "@components/Library/SelectFarmType";
import AllProtocolsModal from "@components/Library/AllProtocolsModal";
import MobileFarmList from "./MobileFarmList";
import SearchInput from "@components/Library/SearchInput";
import ScrollToTopBtn from "@components/Library/ScrollToTopBtn";
import useFilteredFarmTypes from "@hooks/useFilteredFarmTypes";
import useScreenSize from "@hooks/useScreenSize";
import { trackPageView } from "@utils/analytics";
import { fetchListicleFarms } from "@utils/api";
import { protocolCount, tvlCount, protocolList } from "@utils/statsMethods";
import { filterFarmTypeAtom } from "@store/atoms";
import ListicleTable from "./ListicleTable";
import useFilteredFarms from "@hooks/useFilteredFarms";
import MetaTags from "@components/metaTags/MetaTags";
import Hero from "./Hero";

const Home: NextPage = () => {
  const router = useRouter();
  // Store
  const [filterFarmType] = useAtom(filterFarmTypeAtom);

  // States
  const [farms, setFarms] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [prefModalOpen, setPrefModalOpen] = useState(false);
  const [protocolModalOpen, setProtocolModalOpen] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Hooks
  const filteredByFarmTypes = useFilteredFarmTypes(farms, filterFarmType);
  const [filteredFarms, noFilteredFarms] = useFilteredFarms(
    filteredByFarmTypes,
    searchTerm
  );
  const screenSize = useScreenSize();

  useEffect(() => {
    if (farms.length == 0) return;
    setSearchTerm(router.query.q ? (router.query.q as string) : "");
  }, [router, farms.length]);

  // state handler for visibility of scroll-to-top button
  useEffect(() => {
    if (typeof window !== undefined) {
      window.addEventListener("scroll", () => {
        if (window.scrollY > 400) {
          setShowScrollBtn(true);
        } else {
          setShowScrollBtn(false);
        }
      });
    }

    return () => {
      window.removeEventListener("scroll", () => {});
    };
  });

  useEffect(() => {
    if (router.query.id) {
      router.push(
        `${
          typeof window !== "undefined"
            ? `http://${window.location.host}` // for testing locally
            : "https://list.yieldbay.io"
        }/farm/${router.query.id}?addr=${router.query.farm}`
      );
    }
  }, [router]);

  // Fetching the farms & assigning them to `farms` state
  useEffect(() => {
    fetchListicleFarms().then((res: any) => {
      setFarms(res.farms);
    });

    trackPageView();
  }, []);

  return (
    <div>
      <MetaTags />
      <main>
        {/* THIS IS MAIN CONTAINER -- THIS WILL CONTAIN HERO AND TABLE SECTIONS */}
        <div className="relative flex flex-col flex-1">
          {/* HERO SECTION */}
          <Hero
            setProtocolModalOpen={setProtocolModalOpen}
            farms={farms}
            setPrefModalOpen={setPrefModalOpen}
            filteredFarms={filteredFarms}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
          {/* Rendering Farms here */}
          {screenSize === "xs" ? (
            // MOBILE VIEW
            <div className="sm:hidden bg-[#01050D]">
              {/* Shows Shared farm if queries are available  */}
              <MobileFarmList
                farms={filteredFarms}
                noResult={noFilteredFarms}
                prefOpen={prefModalOpen}
                setPrefOpen={setPrefModalOpen}
              />
              {filteredFarms.length < farms.length && (
                <GoToHome router={router} />
              )}
            </div>
          ) : (
            // DESKTOP VIEW
            <div className="hidden sm:block bg-[#01050D]">
              {/* Shows Shared farm if queries are available  */}
              <ListicleTable farms={filteredFarms} noResult={noFilteredFarms} />
              {filteredFarms.length < farms.length && (
                <GoToHome router={router} />
              )}
            </div>
          )}
        </div>
        {showScrollBtn && <ScrollToTopBtn />}
        <AllProtocolsModal
          open={protocolModalOpen}
          setOpen={setProtocolModalOpen}
          protocols={protocolList(farms)}
        />
      </main>
    </div>
  );
};

// Showing GoToHome if farms are shared or filtered
const GoToHome = ({ router }: { router: NextRouter }) => (
  <div className="border-t border-[#222A39] w-full pt-8 pb-9">
    <div
      className="py-2 sm:py-4 text-bodyGray font-bold text-sm sm:text-base leading-3 sm:leading-5 text-center cursor-pointer"
      onClick={() => {
        router.reload();
      }}
    >
      Go to home
    </div>
  </div>
);

export default Home;
