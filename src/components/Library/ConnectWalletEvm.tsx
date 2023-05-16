import { useState, Fragment } from "react";
import Image from "next/image";
import { useConnect } from "wagmi";
import { Transition, Dialog } from "@headlessui/react";
import ClientOnly from "@components/Library/ClientOnly";

export default function ConnectWalletEvm() {
  const { connect, connectors } = useConnect();
  let [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const formatWalletName = (walletName: string): string => {
    switch (walletName.toLowerCase()) {
      case "metamask":
        return "Metamask";
      case "subwallet":
        return "Subwallet";
      default:
        return walletName;
    }
  };

  return (
    <ClientOnly>
      <div className="items-center justify-center">
        <button
          onClick={openModal}
          className="flex flex-row items-center justify-center ring-1 font-semibold text-sm leading-[16.94px] bg-[#37376A] text-white rounded-lg transition duration-200 py-[10.5px] px-4 sm:py-[10px] sm:px-4"
        >
          Connect EVM Wallet
        </button>
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
                <Dialog.Panel className="font-inter w-full max-w-fit text-base font-bold text-white leading-5 transform overflow-hidden rounded-2xl bg-[#010C1D] px-12 py-8 sm:p-[40px] text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3">Select Wallet</Dialog.Title>

                  <div className="mt-8 flex flex-col gap-y-4">
                    {connectors.map((c) => (
                      <button
                        key={c.id}
                        className="flex flex-row items-center justify-between ring-1 active:ring-2 ring-[#314584] sm:ring-opacity-50 sm:hover:ring-opacity-100 h-10 min-w-full bg-[#010710] px-6 py-[10px] rounded-full"
                        onClick={() => connect({ connector: c })}
                      >
                        {formatWalletName(c.name)}
                        <Image
                          src={`/icons/${c.name.toLowerCase()}.svg`}
                          width={24}
                          height={24}
                          alt="wallet"
                          className="ml-[14px]"
                        />
                      </button>
                    ))}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </ClientOnly>
  );
}
