import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import Button from "@components/Library/Button";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import { XIcon } from "@heroicons/react/solid";

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const [darkSide, setDarkSide] = useState(false);
  const [banner, setBanner] = useState(true);

  useEffect(() => {
    setDarkSide(resolvedTheme === "dark");
  }, [resolvedTheme]);

  return (
    <div className="flex items-center justify-between w-full px-9 sm:px-11 lg:px-[120px] pt-8 sm:pt-12 pb-8 z-10 font-medium text-sm md:text-base text-neutral-800 dark:text-white transition duration-200">
      <div className="flex flex-col items-center cursor-pointer">
        <span className="font-bold font-spaceGrotesk text-white text-lg leading-[23px] sm:text-2xl sm:leading-8">
          yieldbay
        </span>
        <div className="flex bg-white dark:bg-primaryBlue rounded-[10px] -mt-0.5 px-[11px] sm:px-[14px] py-[3px] text-primaryBlue dark:text-white text-[8px] leading-[10px] sm:text-sm sm:leading-[17px] font-bold tracking-[0.46em] uppercase transition duration-200">
          <span className="-mr-1">List</span>
        </div>
      </div>
      {banner && (
        <div className="hidden md:flex flex-row items-center bg-opacity-20 dark:bg-opacity-100 bg-[#010813] text-white select-none text-xs rounded-xl py-[14px] px-[19px] gap-x-6 font-spaceGrotesk max-w-[340px] transition duration-200">
          <span>
            We’ve currently de-listed Mangata X farms due to their Subscan being
            down.
          </span>
          <XIcon
            onClick={() => setBanner(false)}
            className="text-[#999999] w-[28px]"
          />
        </div>
      )}
      <div className="inline-flex items-center gap-x-4 sm:mr-2">
        <a
          href="https://discord.gg/AKHuvbz7q4"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:block"
        >
          <Button type="primary" size="small">
            List your protocol
          </Button>
        </a>
        <DarkModeSwitch
          checked={darkSide}
          onChange={(checked) => setTheme(checked ? "dark" : "light")}
          size={24}
          moonColor="white"
          sunColor="white"
        />
      </div>
    </div>
  );
}
