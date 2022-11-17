import { ArrowUpIcon } from "@heroicons/react/solid";

export default function ScrollToTopBtn() {
  return (
    <button
      className="fixed bottom-20 sm:bottom-[80px] right-12 sm:right-[120px] z-20 p-[10px] rounded-full hover:scale-105 active:scale-100 bg-primaryBlue transition-all ease-in-out duration-200"
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
