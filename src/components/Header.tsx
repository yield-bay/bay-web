import Link from "next/link";
import ButtonNew from "./Library/ButtonNew";

export default function Header() {
  return (
    <div className="flex items-center justify-between w-full px-9 sm:px-11 lg:px-[120px] pt-8 sm:pt-12 pb-8 z-10 font-medium text-sm md:text-base text-neutral-800 dark:text-white transition duration-200">
      <Link href="/">
        <div className="flex flex-col items-center cursor-pointer">
          <span className="font-bold font-spaceGrotesk text-white text-lg leading-[23px] sm:text-2xl sm:leading-8">
            yieldbay
          </span>
        </div>
      </Link>
      <div className="inline-flex items-center gap-x-4 sm:mr-2">
        <a
          href="https://discord.gg/AKHuvbz7q4"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:block"
        >
          <ButtonNew size="large">List your protocol</ButtonNew>
        </a>
      </div>
    </div>
  );
}
