import { NextPage } from "next";
import Link from "next/link";
import MetaTags from "@components/metaTags/MetaTags";
import { APP_NAME } from "@utils/constants";

const Custom404: NextPage = () => {
  return (
    <div className="flex-col page-center bg-hero-gradient">
      <MetaTags title={`404 • ${APP_NAME}`} />
      <div className="flex flex-col gap-y-6 md:gap-y-8 items-center font-spaceGrotesk font-bold text-[#D9D9D9]">
        <p className="text-7xl sm:text-8xl md:text-[154px] leading-10 sm:leading-[56px] md:leading-[196px]">
          404
        </p>
        <p className="px-6 text-center text-lg sm:text-xl md:text-2xl max-w-sm">
          uh oh, seem like this page does not exist.
        </p>
        <Link href="/">
          <p className="underline cursor-pointer text-white opacity-70 font-inter font-semibold text-lg sm:text-xl md:text-2xl">
            go to homepage
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Custom404;
