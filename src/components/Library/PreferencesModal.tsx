import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { useAtom } from "jotai";
import {
  filterFarmTypeAtom,
  farmTypesAtom,
  sortStatusAtom,
} from "@store/atoms";
import { trackEventWithProperty } from "@utils/analytics";

type PreferencesModalProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  handleSort: (toggleKey: boolean, toggleOrder: boolean) => void;
};

type FarmTypeFilterProps = {
  setOpen: (value: boolean) => void;
};

type SortingFilterProps = {
  setOpen: (value: boolean) => void;
  handleSort: (toggleKey: boolean, toggleOrder: boolean) => void;
};

export default function PreferencesModal({
  open,
  setOpen,
  handleSort,
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
                <div className="flex items-center group rounded-full p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700">
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
                  className="text-lg leading-6 font-bold pl-9 py-4 border-b-[1.5px] border-bodyGray dark:border-[#181E27]"
                >
                  All Listed Protocols
                </Dialog.Title>
                <div className="mt-[10px] font-medium text-base leading-5">
                  <FarmTypeFilter setOpen={setOpen} />
                  <SortingFilter setOpen={setOpen} handleSort={handleSort} />
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
    <div className="px-9 py-[18px] flex flex-col gap-y-[15px] border-b-[1.5px] border-bodyGray dark:border-[#181E27]">
      {farmTypes.map((item) => (
        <p
          className={
            filterFarmType === item.id ? "text-primaryBlue font-bold" : ""
          }
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

const SortingFilter = ({ setOpen, handleSort }: SortingFilterProps) => {
  const [sortStatus] = useAtom(sortStatusAtom);
  return (
    <div>
      {/* Depends on the "Key" of Sorting */}
      <div className="px-9 py-6 inline-flex gap-x-[15px] w-full border-b-[1.5px] border-bodyGray dark:border-[#181E27]">
        <p className="font-bold">Sort By:</p>
        <p
          className={
            sortStatus.key == "tvl" ? "text-primaryBlue font-bold" : ""
          }
          onClick={() => {
            handleSort(true, false);
            trackEventWithProperty("table-sorting", {
              sortingType: "tvl",
            });
            setOpen(false);
          }}
        >
          TVL
        </p>
        <p
          className={
            sortStatus.key == "yield" ? "text-primaryBlue font-bold" : ""
          }
          onClick={() => {
            handleSort(true, false);
            trackEventWithProperty("table-sorting", {
              sortingType: "yield",
            });
            setOpen(false);
          }}
        >
          APR
        </p>
      </div>
      {/* Depends on "ORDER" of sorting */}
      <div className="px-9 py-6 inline-flex gap-x-[15px]">
        <p className="font-bold">Order:</p>
        <p
          className={sortStatus.order === 1 ? "text-primaryBlue font-bold" : ""}
          onClick={() => {
            handleSort(false, true);
            trackEventWithProperty("table-sorting", {
              sortingType: sortStatus.key,
            });
            setOpen(false);
          }}
        >
          Descending
        </p>
        <p
          className={sortStatus.order === 0 ? "text-primaryBlue font-bold" : ""}
          onClick={() => {
            handleSort(false, true);
            trackEventWithProperty("table-sorting", {
              sortingType: sortStatus.key,
            });
            setOpen(false);
          }}
        >
          Ascending
        </p>
      </div>
    </div>
  );
};
