import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import clsx from "clsx";
import ConnectWallet from "./Library/ConnectWallet";
import { MenuIcon, XIcon } from "@heroicons/react/outline";
import useScreenSize from "@hooks/useScreenSize";
import { Popover, Transition } from "@headlessui/react";

interface MenuProps {
  currentPath: string;
  children: React.ReactNode;
}

const MobileMenu = ({ currentPath, children }: MenuProps) => {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Button>
            {open ? <XIcon className="text-white h-6 w-6" /> : children}
          </Popover.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <Popover.Panel className="absolute -right-[14px] z-50 mt-7 flex h-screen w-screen max-w-screen-sm translate-x-6">
              <div className="w-full flex-auto bg-baseBlue px-6 pt-[14px] text-sm leading-6">
                <div className="flex flex-col items-center gap-y-6">
                  <Popover.Button
                    as={Link}
                    href="/"
                    className={clsx(
                      "relative inline-flex gap-x-2 text-base font-semibold leading-5",
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
                  </Popover.Button>
                  <Popover.Button
                    as={Link}
                    href="/portfolio"
                    className={clsx(
                      "relative inline-flex items-center gap-x-2 text-base font-semibold leading-5",
                      currentPath == "/portfolio"
                        ? "text-white"
                        : "text-[#616180]"
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
                  </Popover.Button>
                  <ConnectWallet />
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};

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
        {screenSize == "xs" ? (
          <MobileMenu currentPath={currentPath}>
            <MenuIcon className="sm:hidden w-6 h-6 text-white" />
          </MobileMenu>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
