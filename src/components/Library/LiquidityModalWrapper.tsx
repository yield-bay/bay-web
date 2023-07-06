import { Fragment, ReactNode, FC } from "react";
import { Transition, Dialog } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  title: string;
  children: ReactNode | ReactNode[];
}

const LiquidityModalWrapper: FC<Props> = ({
  open,
  setOpen,
  title,
  children,
}) => {
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
      <Dialog as="div" className="relative z-10" onClose={() => setOpen(false)}>
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
          <div className="min-h-full flex items-center py-[72px] justify-center text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="flex flex-col overflow-hidden w-full max-w-[600px] font-inter font-medium text-xl leading-5 bg-white text-[#101828] rounded-lg align-middle shadow transform transition-all">
                <div className="w-full py-[17px] px-6 text-left border border-[#99F] bg-[#F9F9FF]">
                  <span className=" text-[#1d2939] font-bold leading-5 text-base">
                    {title}
                  </span>
                </div>
                <div className="absolute top-0 right-0 pt-4 pr-6">
                  <div className="flex items-center">
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
                <div className="border border-[#99F] px-6 pb-6 pt-[80px] -mt-[7px] rounded-lg bg-white">
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LiquidityModalWrapper;
