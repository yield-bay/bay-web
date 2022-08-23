import { useTheme } from "next-themes";
import Button from "./Library/Button";
import { SunIcon, MoonIcon } from "@heroicons/react/solid";

export default function Header() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center justify-between w-full px-6 sm:px-11 lg:px-[120px] pt-12 pb-8 z-10 font-medium text-sm md:text-base text-neutral-800 dark:text-white transition duration-200">
      <div className="flex flex-col items-center cursor-pointer">
        <span className="font-bold font-spaceGrotesk text-white text-2xl">
          yieldbay
        </span>
        <div className="flex bg-white dark:bg-primaryBlue rounded-[10px] -mt-0.5 px-[14px] py-[3px] text-primaryBlue dark:text-white text-sm font-bold tracking-[0.46em] uppercase">
          <span className="-mr-1">List</span>
        </div>
      </div>
      <div className="inline-flex items-center gap-x-1 sm:gap-x-4 mr-2">
        <a
          href="https://discord.gg/AKHuvbz7q4"
          target="_blank"
          rel="noreferrer"
        >
          <Button type="secondary" size="small">
            List your protocol
          </Button>
        </a>
        <button
          className="h-max cursor-pointer"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme == "dark" ? (
            <SunIcon className="w-8 text-white" />
          ) : (
            <MoonIcon className="w-8 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}
