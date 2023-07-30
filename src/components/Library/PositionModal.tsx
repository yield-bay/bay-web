import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { useAtom } from "jotai";
import { useAccount } from "wagmi";
import { dotAccountAtom } from "@store/accountAtoms";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  position: any;
}

export default function PositionModal({ open, setOpen, position }: Props) {
  const { isConnected } = useAccount();
  const [account] = useAtom(dotAccountAtom);
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
            <Dialog.Overlay className="fixed inset-0 bg-[#11121D]/80 backdrop-blur-[8px]" />
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
            <div className="relative inline-block bg-white rounded-lg text-left shadow-xl p-5 align-bottom w-full transform transition-all">
              <div className="absolute top-0 right-0 p-6">
                <div className="flex items-center rounded-full p-1 hover:bg-gray-100">
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
              <div className="w-full font-semibold text-sm leading-5">
                {!isConnected && account == null ? (
                  <div className="w-1/2 float-left">
                    Please Connect Wallet To View Your Holdings.
                  </div>
                ) : position ? (
                  <div className="flex flex-col text-[#475467]">
                    <p className="text-sm leading-5">You Hold</p>
                    <p className="text-2xl leading-7 font-semibold text-[#101828]">
                      $
                      {(position?.chain.toLowerCase() != "mangata kusama"
                        ? position.unstaked.amountUSD +
                          position.staked.amountUSD
                        : position.staked.amountUSD
                      ).toFixed(2)}
                    </p>
                    <p className="p-2 bg-[#F5F5F5] text-[#475467] rounded-lg text-base leading-5 max-w-fit">
                      <span className="font-bold">
                        {(position?.chain.toLowerCase() != "mangata kusama"
                          ? position.unstaked.amount + position.staked.amount
                          : position.staked.amount
                        ).toFixed(2)}
                      </span>{" "}
                      LP
                    </p>
                    <div className="flex flex-row justify-between gap-x-3 border mt-6 p-3 rounded-xl">
                      <div className="flex flex-col items-start gap-y-1">
                        <p className="inline-flex items-center text-sm leading-5 text-[#475467]">
                          Idle
                        </p>
                        <p className="text-[#4D6089] font-semibold text-xl leading-7">
                          ${position?.unstaked?.amountUSD.toFixed(2)}
                        </p>
                        <p className="p-2 bg-[#F5F5F5] text-[#475467] rounded-lg text-base leading-5">
                          <span className="font-bold">
                            ${position?.unstaked.amount.toFixed(2)}
                          </span>{" "}
                          LP
                        </p>
                      </div>
                      <div className="flex flex-col items-start gap-y-1">
                        <p className="inline-flex items-center text-sm leading-5 text-[#475467]">
                          Staked
                        </p>
                        <p className="text-[#4D6089] font-semibold text-xl leading-7">
                          ${position?.staked.amountUSD.toFixed(2)}
                        </p>
                        <p className="p-2 bg-[#F5F5F5] text-[#475467] rounded-lg text-base leading-5">
                          <span className="font-bold">
                            ${position?.staked.amount.toFixed(2)}
                          </span>{" "}
                          LP
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-1/2 float-left">
                    You don’t have any holdings in this farm.
                  </div>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
