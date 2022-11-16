import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/solid";
import { Fragment } from "react";

type CalculatorModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  apr: number;
};

const CalculatorModal = ({ open, setOpen, apr }: CalculatorModalProps) => {
  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={setOpen}
      >
        <div className="flex items-center justify-center min-h-screen px-9 text-center">
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
            <div className="relative inline-block border-2 border-[#314584] bg-baseBlue rounded-lg text-left py-8 align-bottom w-full transform transition-all">
              <div className="w-full px-8 text-base leading-5">
                <div className="flex justify-between font-bold mb-6">
                  <p>Time Frame</p>
                  <p>ROI</p>
                </div>
                <div className="flex flex-col gap-y-4 font-normal">
                  <div className="flex justify-between">
                    <p>1 day</p>
                    <p>{(apr / 365).toFixed(2)}%</p>
                  </div>
                  <div className="flex justify-between">
                    <p>7 days</p>
                    <p>{(apr / 52).toFixed(2)}%</p>
                  </div>
                  <div className="flex justify-between">
                    <p>30 days</p>
                    <p>{(apr / 12).toFixed(2)}%</p>
                  </div>
                  <div className="flex justify-between">
                    <p>365 days</p>
                    <p>{apr.toFixed(2)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CalculatorModal;
