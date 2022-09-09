import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { SunIcon, MoonIcon } from "@heroicons/react/solid";
import Button from "@components/Library/Button";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [themeIcon, setThemeIcon] = useState<React.ReactElement>();

  useEffect(() => {
    if (theme == "dark") {
      setThemeIcon(
        <SunIcon
          className="w-6 sm:w-8 text-white"
          fill="currentColor"
          aria-hidden="true"
        />
      );
    } else {
      setThemeIcon(
        <MoonIcon
          className="w-6 sm:w-8 text-white"
          fill="currentColor"
          aria-hidden="true"
        />
      );
    }
  }, [setThemeIcon, theme]);

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
        <button
          className="h-max cursor-pointer"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {themeIcon}
        </button>
      </div>
    </div>
  );
}
