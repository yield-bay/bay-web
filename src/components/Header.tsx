import Link from "next/link";
import Button from "./Library/Button";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Fragment, useEffect, useState } from "react";
import { hashAtom } from "@store/atoms";
import { useAtom } from "jotai";
import { Dialog, Transition } from "@headlessui/react";

async function fetchUserHash(address: `0x${string}` | undefined) {
  const query = { address };
  let data = await (
    await fetch("https://leaderboard-api-dev.onrender.com/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    })
  ).json();
  console.log(data.hash);
  return data.hash;
}

function Modal() {
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <div className="items-center justify-center">
        <Button onButtonClick={openModal} size="small">
          Connect Wallet
        </Button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#010C1D] p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white"
                  >
                    Select Wallet
                  </Dialog.Title>

                  <div className="mt-4 grid place-items-center space-y-7">
                    <Profile />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

function Profile() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const [_, setHash] = useAtom(hashAtom);
  useEffect(() => {
    if (isConnected) {
      fetchUserHash(address).then((_hash) => {
        setHash(_hash);
      });
    }
  }, [isConnected]);
  if (isConnected) {
    return (
      <div>
        <Button size="small" onButtonClick={() => disconnect()}>
          {address?.slice(0, 4)}...{address?.slice(-4)}
        </Button>
      </div>
    );
  }
  return (
    <>
      {connectors.map((c) => (
        <Button
          key={c.id}
          size="small"
          onButtonClick={() => connect({ connector: c })}
        >
          Connect to {c.name}
        </Button>
      ))}
    </>
  );
}

export default function Header() {
  return (
    <div className="relative flex justify-center sm:justify-between w-full px-9 sm:px-11 lg:px-[120px] py-[42px] sm:py-12 z-10 font-bold text-base leading-6 sm:leading-8 text-white transition duration-200">
      <Link href="/">
        <div className="flex flex-col justify-center cursor-pointer">
          <span className="font-bold font-spaceGrotesk text-white text-lg sm:text-2xl leading-[23px] sm:leading-[30px]">
            yieldbay
          </span>
        </div>
      </Link>
      <div className="hidden sm:inline-flex items-center gap-x-4 sm:mr-2">
        <a
          href="https://discord.gg/AKHuvbz7q4"
          target="_blank"
          rel="noreferrer"
        >
          <Button size="small">List your protocol</Button>
        </a>
        <Modal />
      </div>
    </div>
  );
}
