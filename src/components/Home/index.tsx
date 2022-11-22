// React and Next Imports
import { useEffect, useState } from "react";
import { useRouter, NextRouter } from "next/router";

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
import MetaTags from "@metaTags/MetaTags";

const Home = () => {
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

  console.log("filterfarmtype state", filterFarmType);

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
          <div className="sm:bg-hero-gradient">
            {/* Center Container */}
            <div className="mx-auto max-w-lg md:max-w-2xl py-6 sm:py-11 md:py-[60px]">
              <h1
                className="mb-11 sm:mb-6 font-spaceGrotesk font-bold text-2xl px-4 sm:text-3xl md:text-4xl leading-[30.62px] sm:leading-10 md:leading-[46px] text-center text-[#D9D9D9]"
                id="hero-heading"
              >
                discover & earn yield from polkadot and kusama paraverse
              </h1>
              <div className="flex justify-center">
                <div
                  className="w-max cursor-pointer hover:scale-[1.02] transition-all duration-200"
                  onClick={() => setProtocolModalOpen(true)}
                >
                  <FarmStats
                    totalTVL={tvlCount(farms)}
                    totalFarms={farms.length}
                    totalProtocols={protocolCount(farms)}
                  />
                </div>
              </div>
            </div>
            <div
              className="flex flex-col-reverse sm:flex-row items-center justify-between border-y sm:border-none border-[#334380] border-opacity-60
                          mt-8 sm:mt-0 py-0 sm:py-10 px-0 sm:px-6 md:pl-16 md:pr-8 lg:px-28 bg-hero-gradient-mob
                          font-spaceGrotesk font-medium text-base text-blueSilver leading-5"
            >
              <div className="flex items-center py-5 sm:py-0 px-9 sm:px-0 justify-between w-full sm:w-max sm:gap-x-5">
                <div className="hidden sm:block">
                  <SelectFarmType />
                </div>
                <div
                  className="sm:hidden"
                  onClick={() => setPrefModalOpen(true)}
                >
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
          {/* Rendering Farms here */}
          {screenSize === "xs" ? (
            // MOBILE VIEW
            <div className="sm:hidden bg-[#01050D] transition duration-200">
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
            <div className="hidden sm:block bg-[#01050D] transition duration-200">
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
