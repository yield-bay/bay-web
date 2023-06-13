import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";

type AllProtocolsModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  protocols: string[];
};

export default function AllProtocolsModal({
  open,
  setOpen,
  protocols,
}: AllProtocolsModalProps) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={setOpen}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 sm:p-0 text-center sm:block">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-zinc-500 bg-opacity-60 transition-opacity duration-300" />
          </Transition.Child>
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="relative inline-block font-inter bg-white text-[#101828] rounded-t-lg sm:rounded-2xl text-left overflow-y-auto max-h-[600px] scroll-bar shadow-xl p-4 sm:p-6 align-bottom sm:align-middle w-full sm:max-w-[600px] sm:w-full transform transition-all">
              <div className="absolute top-0 right-0 pt-5 pr-8 sm:block">
                <div className="flex items-center cursor-pointer">
                  <button
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="text-center p-0 w-full">
                <Dialog.Title
                  as="h3"
                  className="text-xl leading-5 text-center font-medium mb-6"
                >
                  All Listed Protocols
                </Dialog.Title>
                <div className="flex flex-col text-left gap-y-6 text-base font-medium leading-5">
                  {protocols.map((protocol, index) => (
                    <div
                      className="bg-[#FBFBFB] p-6 border border-[#EAECF0] w-full rounded-xl"
                      key={index}
                    >
                      {index + 1}. {protocol}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
