import { NextPage } from "next";
import Link from "next/link";
import MetaTags from "@components/Common/metaTags/MetaTags";
import { APP_NAME } from "@utils/constants";

const Custom500: NextPage = () => {
  return (
    <div className="flex-col page-center z-10">
      <MetaTags title={`500 • ${APP_NAME}`} />
      <div className="flex flex-col gap-y-8 md:gap-y-8 mt-[72px] items-center font-bold text-[#DADADA]">
        <div className="font-satoshi px-6 text-center text-[32px] leading-[38.4px]">
          <p>something went wrong.</p>
          <p>apologies for the inconvienience</p>
        </div>
        <Link href="/">
          <button className="px-4 py-[10px] bg-[#D0D5DD] text-[#1D2939] rounded-lg text-base font-semibold leading-5">
            Explore yield farms on yieldbay
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Custom500;
