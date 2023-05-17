import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { useAtom } from "jotai";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { filterFarmTypeAtom, farmTypesAtom } from "@store/atoms";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

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
          <Listbox.Button className="flex items-center gap-x-2 w-full cursor-pointer focus:outline-none focus:ring-0 text-base leading-5 font-medium">
            <span className="block truncate">{selectedFarmType.name}</span>
            <span className="pointer-events-none flex items-center">
              <ChevronDownIcon
                className={classNames(
                  "h-4 w-4 text-white",
                  open ? "rotate-180" : "rotate-0",
                  "transition-all duration-300"
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
            <Listbox.Options className="absolute z-20 mt-4 max-h-60 max-w-max overflow-auto rounded-lg py-[7px] bg-baseBlue text-white text-base font-medium leading-5 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {farmTypes.map((farmType) => (
                <Listbox.Option
                  key={farmType.id}
                  className={({ active }) =>
                    classNames(
                      active ? "bg-baseBlueMid" : "",
                      "relative cursor-pointer select-none py-[9px] px-6"
                    )
                  }
                  value={farmType}
                >
                  {({ selected, active }) => (
                    <span
                      className={classNames(
                        selected ? "text-primaryBlue" : "text-white",
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
