import type { FC } from "react";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { Popover } from "@headlessui/react";
import { useWalletState } from "@hooks/useWalletState";
import { useConnect, useNetwork, useSwitchNetwork } from "wagmi";
import clsx from "clsx";
import { getSupportedChains } from "@utils/network";
import ClientOnly from "@components/Common/ClientOnly";

export const NetworkSelector: FC = () => {
  const { chain: evmChain } = useNetwork();
  const { pendingConnector } = useConnect();
  const { notConnected } = useWalletState(!!pendingConnector);
  const { switchNetwork } = useSwitchNetwork();

  const panel = (
    <Popover.Panel className="flex flex-col w-full sm:w-[320px] fixed bottom-0 left-0 right-0 sm:absolute sm:bottom-[unset] sm:left-[unset] mt-4 sm:rounded-xl rounded-b-none shadow-sm overflow-hidden shadow-black/[0.3] bg-white dark:bg-slate-800 border border-slate-500/20 dark:border-slate-200/20">
      <div className="text-white p-2 border-b border-b-gray-600 bg-white bg-opacity-10">
        Select Chain
      </div>
      <div className="p-2 max-h-[300px] scroll">
        {getSupportedChains().map((chain) => (
          <div
            onClick={() => {
              switchNetwork?.(chain.id);
            }}
            key={chain.id}
            className="hover:bg-gray-200 hover:dark:bg-slate-700 px-2 h-[40px] flex rounded-lg gap-2 items-center cursor-pointer transform-all"
          >
            <div className="flex items-center gap-2">
              <p className="text-gray-700 dark:text-slate-300">{chain?.name}</p>
            </div>
            {!!evmChain && evmChain.id == chain.id && (
              <div className="w-2 h-2 mr-1 rounded-full bg-green-500" />
            )}
          </div>
        ))}
      </div>
    </Popover.Panel>
  );

  return (
    <Popover className="relative">
      {({ open }) => {
        return (
          <ClientOnly>
            <Popover.Button
              className={clsx(
                "flex items-center gap-1 md:gap-2 !bg-black/[0.04] dark:!bg-white/[0.04] hover:!bg-black/[0.08] hover:!dark:bg-white/[0.08] hover:text-black hover:dark:text-white h-[38px] rounded-xl px-2 !font-semibold !text-sm text-slate-800 dark:text-slate-200"
              )}
            >
              <div className="hidden sm:block">{evmChain?.name}</div>
              <ChevronDownIcon
                width={20}
                height={20}
                className={clsx(
                  open ? "rotate-180" : "rotate-0",
                  "transition-transform"
                )}
              />
            </Popover.Button>
            {panel}
          </ClientOnly>
        );
      }}
    </Popover>
  );
};
