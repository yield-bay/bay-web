import { FC, Fragment } from "react";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import ConnectWallet from "@components/Library/ConnectWallet";
import { Popover, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";

interface MenuProps {
  currentPath: string;
  children: React.ReactNode;
}

const MobileMenu: FC<MenuProps> = ({ currentPath, children }) => {
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
export default MobileMenu;
