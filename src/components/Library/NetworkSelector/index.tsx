import { Menu, Transition } from "@headlessui/react";
import { FC, Fragment, memo } from "react";
import Image from "next/image";
import clsx from "clsx";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { getSupportedChains } from "@utils/network";
import { formatFirstLetter } from "@utils/farmListMethods";

const NetworkSelector: FC = () => {
  const { chain: evmChain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  return (
    <Menu
      as="div"
      className="relative w-full sm:w-fit inline-block text-left text-[#344054]"
    >
      <Menu.Button className="flex flex-row justify-center sm:justify-start items-center gap-x-2 font-semibold bg-[#36364D] rounded-lg p-3 px-4 sm:py-[10px] sm:px-4 focus:outline-none transition-all duration-300">
        <Image
          src={`/icons/${evmChain?.name.toLowerCase()}.svg`}
          alt={`${evmChain?.name}`}
          height={24}
          width={24}
        />
        {/* <div className="hidden sm:block">{evmChain?.name}</div> */}
        <Image
          src="/icons/ArrowsLeftRight.svg"
          width={20}
          height={20}
          alt="Network"
        />
      </Menu.Button>
      <Transition
        as={Fragment}
        // show={show}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute z-20 flex flex-col w-full overflow-hidden sm:w-60 -right-px top-14 sm:top-12 origin-top-right rounded-lg bg-white text-[##344054] border border-[#EAECF0] font-medium text-sm leading-5 focus:outline-none">
          <div className="px-4 bg-white text-[#7E899C] text-[11px] font-medium leading-4 pt-3 pb-2 text-left">
            <span>Select Chain</span>
          </div>
          {getSupportedChains().map((chain) => (
            <Menu.Item key={chain.id}>
              <button
                onClick={() => {
                  switchNetwork?.(chain.id);
                }}
                key={chain.id}
                className={clsx(
                  "inline-flex items-center p-4 gap-x-2",
                  evmChain?.id == chain.id && "bg-[#EBEBEC]"
                )}
              >
                <Image
                  src={`/icons/${chain?.name.toLowerCase()}.svg`}
                  alt={`${chain?.name}`}
                  height={24}
                  width={24}
                />
                <p>{formatFirstLetter(chain?.name)}</p>
              </button>
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default memo(NetworkSelector);
