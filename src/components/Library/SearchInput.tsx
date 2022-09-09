import { SearchIcon } from "@heroicons/react/solid";
import { useRef, useState } from "react";
import { trackEventWithProperty } from "@utils/analytics";

type SearchInputProps = {
  term: string;
  setTerm(newTerm: string): void;
};

export default function SearchInput({ term, setTerm }: SearchInputProps) {
  // const [inputFocus, setInputFocus] = useState(false);

  return (
    <div className="relative flex w-full max-w-sm sm:max-w-md lg:max-w-[482px] text-primaryBlue dark:text-primaryWhite rounded-md shadow-sm ring-transparent">
      <div className="absolute sm:pl-6 lg:pl-9 left-0 inset-y-0 flex items-center pointer-events-none">
        <SearchIcon
          className="w-[18px] text-primaryBlue dark:text-gray-300 transition-all duration-200"
          aria-hidden="true"
        />
      </div>
      <input
        type="search"
        id="text"
        value={term}
        onChange={(event) => {
          setTerm(event.target.value);
          trackEventWithProperty("farm-search"); // No proprty as none required
        }}
        // onFocus={() => setInputFocus(true)}
        // onBlur={() => setInputFocus(false)}
        className="block w-full pl-12 pr-4 lg:pl-[84px] py-3 focus:ring-[3px] ring-[#8EB8FF] dark:ring-baseBlueMid placeholder:text-primaryBlue dark:placeholder:text-primaryWhite text-xs sm:text-base leading-4 sm:leading-5 font-semibold bg-bodyGray dark:bg-baseBlueDark border-none outline-none rounded-xl transition duration-200"
        placeholder="Search by token, chain or protocol name"
      />
      {/* {!inputFocus && (
        <div className="absolute hidden md:flex items-center pr-9 right-0 inset-y-0 pointer-events-none">
          <div className="flex px-[9px] py-[3.5px] max-w-max border-[0.5px] border-primaryBlue dark:border-primaryWhite rounded-[3px] transition duration-200">
            <span className="text-xs font-medium leading-[14.5px]">/</span>
          </div>
        </div>
      )} */}
    </div>
  );
}
