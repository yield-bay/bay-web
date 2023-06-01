import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import clsx from "clsx";
import ConnectWallet from "./Library/ConnectWallet";
import { MenuIcon } from "@heroicons/react/outline";
import useScreenSize from "@hooks/useScreenSize";

export default function Header() {
  const router = useRouter();
  const [currentPath, setCurrentPath] = useState("");
  const screenSize = useScreenSize();

  useEffect(() => {
    setCurrentPath(router.asPath);
  }, [router]);

  return (
    <div className="w-full px-9 sm:px-11 lg:px-[72px] py-6 z-10 font-bold text-base leading-6 sm:leading-8 text-white">
      <div className="w-full flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <div className="flex flex-col justify-center cursor-pointer">
            <span className="font-bold text-white text-lg sm:text-lg leading-[23px] sm:leading-[21.78px]">
              yieldbay
            </span>
          </div>
        </Link>
        <div className="hidden sm:flex gap-x-6">
          <Link
            href="/"
            className={clsx(
              "inline-flex gap-x-2 text-base font-semibold leading-5",
              currentPath == "/" ? "text-white" : "text-[#616180]"
            )}
          >
            <Image
              src={
                currentPath == "/"
                  ? "/icons/CompassActiveIcon.svg"
                  : "/icons/CompassIcon.svg"
              }
              alt="Go to explore"
              height={16}
              width={16}
            />
            <span>explore</span>
          </Link>
          <Link
            href="/portfolio"
            className={clsx(
              "inline-flex items-center gap-x-2 text-base font-semibold leading-5",
              currentPath == "/portfolio" ? "text-white" : "text-[#616180]"
            )}
          >
            <Image
              src={
                currentPath == "/portfolio"
                  ? "/icons/PortfolioActiveIcon.svg"
                  : "/icons/PortfolioIcon.svg"
              }
              alt="Go to explore"
              height={16}
              width={16}
            />
            <span>my portfolio</span>
          </Link>
        </div>
        <div className="hidden sm:inline-flex items-center gap-x-4">
          <ConnectWallet />
        </div>
        {screenSize == "xs" && (
          <button onClick={() => {}}>
            <MenuIcon className="sm:hidden w-6 h-6 text-white" />
          </button>
        )}
      </div>
    </div>
  );
}
