import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { useAtom } from "jotai";
import { filterFarmTypeAtom, farmTypesAtom } from "@store/atoms";

type PreferencesModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
};

type FarmTypeFilterProps = {
  setOpen: (value: boolean) => void;
};

export default function PreferencesModal({
  open,
  setOpen,
}: PreferencesModalProps) {
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
                <div className="flex items-center group rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer">
                  <button
                    type="button"
                    className="text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white focus:outline-none"
                    onClick={() => setOpen(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XIcon className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="w-full">
                <Dialog.Title
                  as="h3"
                  className="text-lg leading-6 font-bold pl-9 py-4 border-b-[1.5px] border-[#181E27]"
                >
                  All Listed Protocols
                </Dialog.Title>
                <div className="mt-[10px]">
                  <FarmTypeFilter setOpen={setOpen} />
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

const FarmTypeFilter = ({ setOpen }: FarmTypeFilterProps) => {
  const [farmTypes] = useAtom(farmTypesAtom);
  const [filterFarmType, filterFarmTypeSet] = useAtom(filterFarmTypeAtom);

  return (
    <div className="px-9 py-[18px] flex flex-col gap-y-[15px] border-b-[1.5px] border-[#181E27]">
      {farmTypes.map((item) => (
        <p
          className={`font-medium text-base leading-5 ${
            filterFarmType === item.id && "text-primaryBlue"
          }`}
          onClick={() => {
            filterFarmTypeSet(item.id);
            setOpen(false);
          }}
          key={item.id}
        >
          {item.name}
        </p>
      ))}
    </div>
  );
};
