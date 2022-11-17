import { SearchIcon } from "@heroicons/react/solid";
import { MutableRefObject, useRef, useState } from "react";
import { trackEventWithProperty } from "@utils/analytics";
import useKeyPress from "@hooks/useKeyPress";

type SearchInputProps = {
  term: string;
  setTerm(newTerm: string): void;
};

export default function SearchInput({ term, setTerm }: SearchInputProps) {
  const [inputFocus, setInputFocus] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useKeyPress(["/"], (event: any) => {
    if (ref.current != null) {
      ref.current.focus();
    }
  });

  useKeyPress(["Escape"], (event: any) => {
    if (ref.current != null) {
      ref.current.blur();
    }
  });

  return (
    <div className="relative flex w-full max-w-sm sm:max-w-md lg:max-w-[482px] text-primaryWhite sm:rounded-md sm:shadow-sm ring-transparent">
      <div className="absolute pl-10 sm:pl-6 lg:pl-6 left-0 inset-y-0 flex items-center pointer-events-none">
        <SearchIcon
          className="w-3 sm:w-[18px] text-gray-300 transition-all duration-200"
          aria-hidden="true"
        />
      </div>
      <input
        type="search"
        id="text"
        value={term}
        onChange={(event) => {
          setTerm(event.target.value == "/" ? "" : event.target.value);
          trackEventWithProperty("farm-search"); // No proprty as none required
        }}
        ref={ref}
        onFocus={() => setInputFocus(true)}
        onBlur={() => setInputFocus(false)}
        className="block w-full pl-20 sm:pl-12 pr-4 lg:pl-[84px] py-6 sm:py-3 sm:ring-[1px] focus:ring-[3px] ring-baseBlueMid placeholder:text-bodyGray text-sm sm:text-base leading-[17px] sm:leading-5 font-semibold bg-transparent border-none outline-none sm:rounded-xl transition duration-200"
        placeholder="Search by token, chain or protocol name"
      />
      <div className="absolute hidden md:flex items-center pr-6 right-0 inset-y-0 pointer-events-none">
        <div className="flex px-[9px] py-[3.5px] max-w-max">
          <span className="text-xs font-medium leading-[14.5px]">
            {!inputFocus ? "/" : "esc"}
          </span>
        </div>
      </div>
    </div>
  );
}
