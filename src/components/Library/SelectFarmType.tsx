import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { useAtom } from "jotai";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { filterFarmTypeAtom, farmTypesAtom } from "@store/atoms";
import clsx from "clsx";

export default function SelectFarmType() {
  // Store
  const [farmTypes, farmTypesSet] = useAtom(farmTypesAtom);
  const [filterFarmType, filterFarmTypeSet] = useAtom(filterFarmTypeAtom);
  // State
  const [selectedFarmType, setSelectedFarmType] = useState(
    farmTypes[filterFarmType - 1]
  );

  return (
    <Listbox
      value={selectedFarmType}
      onChange={(value) => {
        setSelectedFarmType(value);
        filterFarmTypeSet(value.id);
      }}
    >
      {({ open }) => (
        <>
          <Listbox.Button className="ring-1 ring-[#D0D5DD] text-[#344054] rounded-lg flex items-center gap-x-2 w-full cursor-pointer focus:outline-none text-sm py-[10px] px-4 leading-5 font-semibold">
            <span className="block truncate">{selectedFarmType.name}</span>
            <span className="pointer-events-none flex items-center">
              <ChevronDownIcon
                className={clsx(
                  "h-5 w-5 text-[#344054] transform origin-center transition-all duration-300",
                  open ? "rotate-180" : "rotate-0"
                )}
                aria-hidden="true"
              />
            </span>
          </Listbox.Button>
          <Transition
            show={open}
            as={Fragment}
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Listbox.Options className="absolute z-20 mt-2 bg-white border border-[#EAECF0] overflow-auto rounded-lg py-2 text-[#344054] text-sm px-1 font-semibold leading-5 shadow-lg focus:outline-none">
              {farmTypes.map((farmType) => (
                <Listbox.Option
                  key={farmType.id}
                  className={({ active }) =>
                    clsx(
                      active && "bg-gray-50",
                      "relative cursor-pointer select-none px-3 py-2 rounded-md"
                    )
                  }
                  value={farmType}
                >
                  {({ selected }) => (
                    <span
                      className={clsx(
                        !selected && "opacity-50",
                        "block truncate"
                      )}
                    >
                      {farmType.name}
                    </span>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </>
      )}
    </Listbox>
  );
}
