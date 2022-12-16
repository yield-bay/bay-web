import { useConnect } from "wagmi";
import { useState } from "react";
import Button from "./Button";
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
    <>
      <div className="items-center justify-center">
        <button
          onClick={openModal}
          className="ex flex-row items-center justify-center ring-1 text-base ring-[#314584] hover:ring-[#455b9c] text-white font-semibold rounded-xl leading-5 transition duration-200 py-2 px-[18px] sm:py-[12px] sm:px-[33px]"
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#010C1D] p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-white"
                  >
                    Select Wallet
                  </Dialog.Title>

                  <div className="mt-4 grid place-items-center space-y-7">
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
