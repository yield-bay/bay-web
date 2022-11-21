import { useState } from "react";
import Link from "next/link";
import Button from "./Library/Button";
import HeaderBanner from "./Library/HeaderBanner";

export default function Header() {
  const [isBanner, setIsBanner] = useState(true);

  return (
    <div className="relative flex justify-center sm:justify-between w-full px-9 sm:px-11 lg:px-[120px] py-[42px] sm:py-12 z-10 font-bold text-base leading-6 sm:leading-8 text-white transition duration-200">
      <Link href="/">
        <div className="flex flex-col justify-center cursor-pointer">
          <span className="font-bold font-spaceGrotesk text-white text-lg sm:text-2xl leading-[23px] sm:leading-[30px]">
            yieldbay
          </span>
        </div>
      </Link>
      <HeaderBanner
        note="We’ve currently de-listed Mangata X farms due to their Subscan being down."
        isBanner={isBanner}
        setIsBanner={setIsBanner}
      />
      <div className="hidden sm:inline-flex items-center gap-x-4 sm:mr-2">
        <a
          href="https://discord.gg/AKHuvbz7q4"
          target="_blank"
          rel="noreferrer"
        >
          <Button size="small">List your protocol</Button>
        </a>
      </div>
    </div>
  );
}
