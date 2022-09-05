import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";

export default function AllProtocolsModal({
  open,
  setOpen,
  protocols,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  protocols: string[];
}) {
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
            <div className="relative inline-block font-spaceGrotesk bg-white dark:bg-baseBlue rounded-t-lg sm:rounded-2xl text-left max-h-[600px] overflow-y-auto shadow-xl px-4 py-5 align-bottom sm:align-middle w-full sm:max-w-[640px] sm:w-full sm:px-0 sm:pt-6 sm:pb-0 transform transition-all">
              <div className="absolute top-0 right-0 pt-2 pr-2 sm:block">
                <div className="flex items-center p-2 group rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer">
                  <button
                    type="button"
                    className="text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white focus:outline-none"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 w-full">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl leading-8 px-4 sm:px-8 my-[10px] text-left font-bold"
                  >
                    All Listed Protocols
                  </Dialog.Title>
                  <div>
                    {protocols.map((protocol, index) => (
                      <p
                        key={index}
                        className="font-normal text-2xl px-4 sm:px-8 leading-[70.28px] text-left py-4 border-b border-blueSilver dark:border-gray-800"
                      >
                        {index + 1}. {protocol}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
