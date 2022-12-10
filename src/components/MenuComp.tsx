import { Menu } from "@headlessui/react";
import { useRouter } from "next/router";
import { useDisconnect } from "wagmi";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { Transition } from "@headlessui/react";
import { Fragment } from "react";

export default function MenuComp({
  address,
}: {
  address: `0x${string}` | undefined;
}) {
  const router = useRouter();
  const { disconnect } = useDisconnect();
  return (
    <div>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="flex flex-row items-center justify-center ring-2 text-base ring-[#314584] hover:ring-[#455b9c] text-white font-semibold rounded-xl leading-5 transition duration-200 py-2 px-[18px] sm:py-3 sm:px-6">
            {address?.slice(0, 4)}...{address?.slice(-4)}
            <ChevronDownIcon
              className="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100"
              aria-hidden="true"
            />
          </Menu.Button>
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
          <Menu.Items className="w-[10.3rem] border-2 border-[#314584] absolute right-0 mt-2 w-56 origin-top-right divide-y divide-[#314584] rounded-md bg-[#010C1D] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="px-1 py-1 ">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "text-gray-200" : "text-white"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    onClick={() => {
                      disconnect();
                    }}
                  >
                    Disconnect
                  </button>
                )}
              </Menu.Item>
            </div>
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "text-gray-200" : "text-white"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    My Rewards
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active ? "text-gray-200" : "text-white"
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    onClick={() => {
                      router.push(`/leaderboard`);
                    }}
                  >
                    Leaderboard
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
