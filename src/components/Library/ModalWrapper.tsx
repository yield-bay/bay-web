import { Fragment, ReactNode, FC } from "react";
import { Transition, Dialog } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  children: ReactNode | ReactNode[];
}

const ModalWrapper: FC<Props> = ({ open, setOpen, children }) => {
  return (
    <Transition
      appear
      show={open}
      as={Fragment}
      enter="transition-opacity duration-75"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#11121D]/80 backdrop-blur-[8px]" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="min-h-full flex items-center mt-10 justify-center p-6 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="flex flex-col gap-y-6 w-full max-w-[600px] font-inter font-medium text-xl leading-5 bg-white text-[#101828] rounded-lg p-6 align-middle shadow transform transition-all bg-liquidity-modal">
                <div className="absolute top-0 right-0 pt-6 pr-9">
                  <div className="flex items-center rounded-full p-1 hover:bg-gray-100 transition-all duration-200">
                    <button
                      type="button"
                      className="text-[#101828] focus:outline-none"
                      onClick={() => setOpen(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XIcon className="w-6 h-6" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ModalWrapper;
