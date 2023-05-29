import { FC, Fragment, useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { useAtom } from "jotai";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { filteredChainAtom } from "@store/atoms";
import clsx from "clsx";
import Image from "next/image";
import { formatFirstLetter } from "@utils/farmListMethods";

interface Props {
  availableChains: string[];
}

const SelectChain: FC<Props> = ({ availableChains }) => {
  const chains = ["all", ...availableChains];
  // Store
  const [filteredChainId, setFilteredChainId] = useAtom(filteredChainAtom);
  // State
  const [selectedChain, setSelectedChain] = useState(chains[filteredChainId]);

  useEffect(() => {
    console.log({
      filteredChainId: filteredChainId,
      selectedChain: selectedChain,
    });
  }, [filteredChainId]);

  return (
    <Listbox
      value={{ id: filteredChainId, name: selectedChain }}
      onChange={(value) => {
        setSelectedChain(value.name);
        setFilteredChainId(value.id);
      }}
    >
      {({ open }) => (
        <>
          <Listbox.Button className="ring-1 ring-[#D0D5DD] text-[#344054] rounded-lg flex items-center gap-x-2 w-full max-w-fit cursor-pointer focus:outline-none text-sm py-3 px-4 leading-5 font-semibold">
            <Image
              src="/icons/filterIcon.svg"
              height={20}
              width={20}
              className="mr-2"
              alt="filter by chain"
            />
            <span>Filter by Chain</span>
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
            <Listbox.Options className="absolute z-20 mt-14 bg-white border border-[#EAECF0] overflow-auto rounded-lg py-2 px-1 text-[#344054] text-sm font-semibold leading-5 shadow-lg focus:outline-none">
              {chains.map((chain, index) => {
                return (
                  <Listbox.Option
                    key={index}
                    className={({ active }) =>
                      clsx(
                        index == filteredChainId && "bg-gray-50",
                        "relative cursor-pointer select-none px-3 py-2 rounded-md w-[179px]"
                      )
                    }
                    value={{
                      id: index,
                      name: chain,
                    }}
                  >
                    {({ selected }) => (
                      <div
                        className={clsx(
                          index !== filteredChainId && "opacity-50",
                          "truncate inline-flex justify-between items-center w-full"
                        )}
                      >
                        <span>{formatFirstLetter(chain)}</span>
                        {index !== 0 && (
                          <Image
                            src={`/${chain.toLowerCase()}.svg`}
                            alt="chain logo"
                            width={24}
                            height={24}
                          />
                        )}
                      </div>
                    )}
                  </Listbox.Option>
                );
              })}
            </Listbox.Options>
          </Transition>
        </>
      )}
    </Listbox>
  );
};

export default SelectChain;
