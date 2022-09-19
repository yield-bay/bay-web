import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";

export default function PreferencesModal({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={setOpen}
      >
        <div className="flex items-center justify-center min-h-screen px-7 text-center">
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
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-4"
            enterTo="opacity-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-4"
          >
            <div className="relative inline-block font-spaceGrotesk bg-white dark:bg-baseBlue rounded-lg text-left shadow-xl py-3 align-bottom w-full transform transition-all">
              <div className="absolute top-0 right-0 pt-7 pr-7">
                <div className="flex items-center group rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer">
                  <button
                    type="button"
                    className="text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white focus:outline-none"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="w-full">
                <Dialog.Title
                  as="h3"
                  className="text-lg leading-6 font-bold pl-9 py-4"
                >
                  All Listed Protocols
                </Dialog.Title>
                <div>Testing</div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
