import { useConnect } from "wagmi";
import { useState } from "react";
import Button from "./Button";
import ClientOnly from "./ClientOnly";
import { Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Dialog } from "@headlessui/react";

export default function ConnectWallet() {
  const { connect, connectors } = useConnect();
  let [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  return (
    <ClientOnly>
      <div className="items-center justify-center">
        <button
          onClick={openModal}
          className="flex flex-row items-center justify-center ring-1 text-base ring-[#314584] hover:ring-[#455b9c] text-white font-semibold rounded-xl leading-5 transition duration-200 py-[10.5px] px-4 sm:py-[12px] sm:px-[33px]"
        >
          Connect Wallet
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
                {/* 
                  font-family: Inter;
                  font-size: 16px;
                  font-weight: 600;
                  line-height: 19px;
                  letter-spacing: 0em;
                  text-align: left;
                */}
                <Dialog.Panel className="border font-inter border-[#314584] w-full max-w-md text-base font-bold text-white leading-5 transform overflow-hidden rounded-2xl bg-[#010C1D] px-12 py-16 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-white border">
                    Select Wallet
                  </Dialog.Title>

                  <div className="mt-8 grid grid-cols-2 gap-0 place-items-center space-y-7 border">
                    {connectors.map((c) => (
                      <button
                        key={c.id}
                        className="border border-[#314584] bg-[#010710] px-6 py-[10.5px] rounded-full"
                        onClick={() => connect({ connector: c })}
                      >
                        {c.name}
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
