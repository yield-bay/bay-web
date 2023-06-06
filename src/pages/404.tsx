import { NextPage } from "next";
import Link from "next/link";
import MetaTags from "@components/Common/metaTags/MetaTags";
import { APP_NAME } from "@utils/constants";

const Custom404: NextPage = () => {
  return (
    <div className="flex-col page-center z-10">
      <MetaTags title={`404 • ${APP_NAME}`} />
      <div className="flex flex-col gap-y-8 md:gap-y-8 items-center font-bold text-[#DADADA]">
        <p className="font-satoshi text-7xl sm:text-9xl leading-[80px] sm:leading-[153px]">
          ____
        </p>
        <p className="font-satoshi px-6 text-center text-[32px] leading-[38.4px]">
          sorry, this page doesn’t exist.
        </p>
        <Link href="/">
          <button className="px-4 py-[10px] bg-[#D0D5DD] text-[#1D2939] rounded-lg text-base font-semibold leading-5">
            Explore yield farms on yieldbay
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Custom404;
