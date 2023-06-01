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
import Toggle from "./Toggle";
import Image from "next/image";

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
              <div className="w-full font-medium text-base leading-5">
                <FarmTypeFilter setOpen={setOpen} />
                <div className="mt-6 flex flex-row items-center gap-x-3 rounded-lg p-3 shadow-md">
                  <Toggle label="show supported farms" />
                  <p className="font-medium text-xs leading-5 text-[#66686B]">
                    Show only supported farms
                  </p>
                  <Image
                    src="/icons/umbrella.svg"
                    alt="supported farm"
                    height={16}
                    width={16}
                  />
                </div>
                {/* <SortingFilter setOpen={setOpen} handleSort={handleSort} /> */}
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
    <div className="flex flex-col gap-y-4 font-semibold text-sm leading-5 text-[#344054]">
      {farmTypes.map((item) => (
        <p
          className={filterFarmType === item.id ? "opacity-100" : "opacity-50"}
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

// const SortingFilter = ({ setOpen, handleSort }: SortingFilterProps) => {
//   const [sortStatus] = useAtom(sortStatusAtom);
//   return (
//     <div>
//       {/* Depends on the "Key" of Sorting */}
//       <div className="px-9 py-6 inline-flex gap-x-[15px] w-full">
//         <p className="font-bold">Sort By:</p>
//         <p
//           className={
//             sortStatus.key == "tvl" ? "text-primaryBlue font-bold" : ""
//           }
//           onClick={() => {
//             if (sortStatus.key != "tvl") {
//               handleSort(true, false);
//               trackEventWithProperty("table-sorting", {
//                 sortingType: "tvl",
//               });
//               setOpen(false);
//             }
//           }}
//         >
//           TVL
//         </p>
//         <p
//           className={
//             sortStatus.key == "yield" ? "text-primaryBlue font-bold" : ""
//           }
//           onClick={() => {
//             if (sortStatus.key != "yield") {
//               handleSort(true, false);
//               trackEventWithProperty("table-sorting", {
//                 sortingType: "yield",
//               });
//               setOpen(false);
//             }
//           }}
//         >
//           APR
//         </p>
//       </div>
//       {/* Depends on "ORDER" of sorting */}
//       <div className="px-9 py-6 inline-flex gap-x-[15px]">
//         <p className="font-bold">Order:</p>
//         <p
//           className={sortStatus.order === 1 ? "text-primaryBlue font-bold" : ""}
//           onClick={() => {
//             if (sortStatus.order != 1) {
//               handleSort(false, true);
//               trackEventWithProperty("table-sorting", {
//                 sortingType: sortStatus.key,
//               });
//               setOpen(false);
//             }
//           }}
//         >
//           Descending
//         </p>
//         <p
//           className={sortStatus.order === 0 ? "text-[#101828] font-bold" : ""}
//           onClick={() => {
//             if (sortStatus.order != 0) {
//               handleSort(false, true);
//               trackEventWithProperty("table-sorting", {
//                 sortingType: sortStatus.key,
//               });
//               setOpen(false);
//             }
//           }}
//         >
//           Ascending
//         </p>
//       </div>
//     </div>
//   );
// };
