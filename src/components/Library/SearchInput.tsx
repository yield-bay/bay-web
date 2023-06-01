import { useRef, useState } from "react";
import { trackEventWithProperty } from "@utils/analytics";
import useKeyPress from "@hooks/useKeyPress";
import Image from "next/image";

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
    <div className="relative border flex w-full max-w-xs xl:max-w-[437px] text-[#667085] sm:rounded-lg ring-transparent">
      <div className="absolute pl-10 sm:pl-2 lg:pl-[10px] left-0 inset-y-0 flex items-center pointer-events-none">
        <Image
          src="/icons/SearchIcon.svg"
          alt="search"
          height={20}
          width={20}
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
        className="block w-full pl-20 sm:pl-9 lg:pl-[42px] pr-4 py-6 sm:py-[10px] sm:ring-[1px] focus:ring-[3px] ring-[#D0D5DD] placeholder:text-[#667085] text-sm sm:text-base leading-[17px] sm:leading-6 font-normal bg-transparent border-none outline-none sm:rounded-lg"
        placeholder="Search"
      />
      <div className="absolute hidden lg:flex items-center pr-[14px] right-0 inset-y-0 pointer-events-none">
        <div className="flex px-[9px] py-[3.5px] max-w-max">
          <span className="text-xs font-medium leading-[14.5px]">
            {!inputFocus ? "/" : "esc"}
          </span>
        </div>
      </div>
    </div>
  );
}
