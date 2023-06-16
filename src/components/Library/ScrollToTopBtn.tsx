import { ArrowUpIcon } from "@heroicons/react/solid";
import clsx from "clsx";

export default function ScrollToTopBtn() {
  return (
    <button
      className={clsx(
        "fixed bottom-20 sm:bottom-[80px] right-12 sm:right-20 z-20 p-[10px] rounded-full",
        "hover:scale-105 hover:shadow-lg active:scale-100",
        "bg-[#9C9CFF] active:bg-[#9090f1] transition-all ease-in-out duration-200"
      )}
      onClick={() => {
        if (typeof window !== undefined) {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      }}
    >
      <ArrowUpIcon className="w-5 text-white transition duration-200" />
    </button>
  );
}
