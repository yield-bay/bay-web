import MetaTags from "@components/metaTags/MetaTags";
import config from "@components/metaTags/config";
import Link from "next/link";
import { FC } from "react";

const Custom500: FC = () => {
  const { defaultTitle } = config;
  return (
    <div className="flex-col page-center bg-hero-gradient">
      <MetaTags title={`500 • ${defaultTitle}`} />
      <div className="flex flex-col gap-y-6 md:gap-y-8 items-center font-spaceGrotesk font-bold text-[#D9D9D9]">
        <p className="text-7xl sm:text-8xl md:text-[154px] leading-10 sm:leading-[56px] md:leading-[196px]">
          whoops
        </p>
        <p className="px-6 text-center text-lg sm:text-xl md:text-2xl max-w-sm">
          there seems to be an internal server error. please reload, or:
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

export default Custom500;
