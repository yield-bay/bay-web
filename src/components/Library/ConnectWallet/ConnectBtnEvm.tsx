import { type FC, Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Transition, Menu } from "@headlessui/react";
import { useAccount, useDisconnect } from "wagmi";
import { CheckCircleIcon, ChevronDownIcon } from "@heroicons/react/outline";
import ClientOnly from "../../Common/ClientOnly";
import clsx from "clsx";

interface Props {
  address: `0x${string}` | undefined;
}

const ConnectBtnEvm: FC<Props> = ({ address }) => {
  const { connector } = useAccount();
  const { disconnect } = useDisconnect();
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    // Clear timeout when component unmounts;
    return () => {
      clearTimeout(timerRef.current as ReturnType<typeof setTimeout>);
    };
  }, []);

  return (
    <ClientOnly>
      <Menu as="div" className="relative inline-block text-left">
        {({ open }) => (
          <>
            <div className="relative group">
              <Menu.Button className="inline-flex items-center font-semibold cursor-pointer text-sm leading-[16.94px] bg-[#36364D] text-white rounded-lg transition duration-200 py-[10px] px-4 sm:py-[10px] sm:px-4 focus:outline-none">
                <span>
                  {address?.slice(0, 4)}...{address?.slice(-4)}
                </span>
                <ChevronDownIcon
                  className="ml-2 -mr-1 h-5 w-5 text-white"
                  aria-hidden="true"
                />
              </Menu.Button>
              <div
                className={clsx(
                  "absolute bottom-0 group-hover:translate-y-[18px] transition-all w-full rounded-b-lg bg-[#707088] text-white text-center pt-2 pb-1 text-[10px] leading-3 font-semibold -z-10",
                  open && "group-hover:-translate-y-[0px]"
                )}
              >
                EVM
              </div>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="w-[240px] absolute border border-[#EAECF0] right-0 mt-2 origin-top-right rounded-lg bg-white shadow-lg focus:outline-none">
                <div className="inline-flex border-b border-[#EAECF0] justify-between items-center rounded-t-lg w-full py-3 px-4">
                  <div className="inline-flex items-center gap-x-3">
                    <div className="relative">
                      <div className="rounded-full overflow-hidden">
                        <Image
                          src={`/icons/${connector?.name.toLowerCase()}.svg`}
                          alt="Wallet icon"
                          width={40}
                          height={40}
                        />
                      </div>
                      <div className="absolute right-0 bottom-0 h-[13px] w-[13px] bg-[#12B76A] rounded-full border-2 border-white" />
                    </div>
                    <p className="font-bold text-sm leading-5 text-[#475467]">
                      {address?.slice(0, 4)}......{address?.slice(-4)}
                    </p>
                  </div>
                  <div
                    className="ml-6 cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(address as string);
                      setIsCopied(true);
                      timerRef.current = setTimeout(() => {
                        setIsCopied(false);
                      }, 500);
                    }}
                  >
                    {isCopied ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    ) : (
                      <Image
                        src="/icons/CopyIcon.svg"
                        alt="Copy address"
                        width={24}
                        height={24}
                      />
                    )}
                  </div>
                </div>
                <Menu.Item>
                  <button
                    className="inline-flex rounded-lg w-full items-center p-4 text-[#344054] text-sm leading-5 font-medium text-left rounded-t-xl hover:bg-[#FAFAFD]"
                    onClick={() => {
                      disconnect();
                    }}
                  >
                    <Image
                      src="/icons/LogOutIcon.svg"
                      alt="Disconnect"
                      height={16}
                      width={16}
                      className="mr-2"
                    />
                    Disconnect
                  </button>
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </ClientOnly>
  );
};

export default ConnectBtnEvm;
