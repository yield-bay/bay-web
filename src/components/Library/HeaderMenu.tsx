import { Fragment, ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import ClientOnly from "./ClientOnly";
import { Menu } from "@headlessui/react";
import { useDisconnect } from "wagmi";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { Transition } from "@headlessui/react";

export default function HeaderMenu({
  address,
}: {
  address: `0x${string}` | undefined;
}) {
  const router = useRouter();
  const { disconnect } = useDisconnect();

  return (
    <ClientOnly>
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="flex flex-row items-center justify-center ring-1 text-base ring-[#314584] hover:ring-[#455b9c] text-white font-semibold rounded-xl leading-5 transition duration-200 py-[10.5px] px-4 sm:py-3 sm:px-8">
          <span>
            {address?.slice(0, 4)}...{address?.slice(-4)}
          </span>
          <ChevronDownIcon
            className="hidden sm:block ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
            aria-hidden="true"
          />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="w-[11.5rem] border border-[#314584] absolute right-0 mt-2 origin-top-right divide-y divide-[#314584] divide-opacity-40 rounded-xl bg-[#010C1D] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "text-gray-200" : "text-white"
                  } group flex p-5 w-full items-center rounded-t-md font-medium text-base leading-5`}
                  onClick={() => {
                    disconnect();
                  }}
                >
                  Disconnect
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  className={`${
                    active ? "text-gray-200" : "text-white"
                  } group flex p-5 w-full items-center rounded-b-md font-medium text-base leading-5`}
                  onClick={() => {
                    router.push(`/leaderboard`);
                  }}
                >
                  Leaderboard
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </ClientOnly>
  );
}
