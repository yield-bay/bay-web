import { SearchIcon } from "@heroicons/react/solid";
import { useRef } from "react";
// import { trackEventWithProperty } from "@utils/analytics";

type SearchInputProps = {
  term: string;
  setTerm(newTerm: string): void;
};

export default function SearchInput({ term, setTerm }: SearchInputProps) {
  const ref = useRef<any>(null);

  return (
    <div className="relative flex w-full max-w-sm sm:max-w-md lg:max-w-[482px] text-primaryBlue rounded-md shadow-sm ring-transparent">
      <div className="absolute pl-4 sm:pl-6 lg:pl-9 left-0 inset-y-0 flex items-center pointer-events-none">
        <SearchIcon
          className="w-[18px] text-primaryBlue dark:text-gray-300 transition-all duration-200"
          aria-hidden="true"
        />
      </div>
      <input
        type="search"
        id="text"
        value={term}
        ref={ref}
        onChange={(event) => {
          setTerm(event.target.value);
          // trackEventWithProperty("farm-search"); // No proprty as none required
        }}
        className="block w-full pl-12 lg:pl-[84px] py-3 focus:ring-[3px] ring-[#8EB8FF] dark:ring-neutral-500 placeholder:text-primaryBlue text-primaryBlue text-xs sm:text-base leading-4 sm:leading-5 font-semibold dark:text-neutral-400 bg-bodyGray border-none outline-none rounded-xl dark:bg-gray-700 transition duration-200"
        placeholder="Search by token, chain or protocol name"
      />
      <div className="absolute hidden md:flex items-center pr-9 right-0 inset-y-0 pointer-events-none">
        <div className="flex px-[9px] py-[3.5px] max-w-max border border-primaryBlue rounded-[3px]">
          <span className="text-xs font-medium leading-[14.5px]">/</span>
        </div>
      </div>
    </div>
  );
}
