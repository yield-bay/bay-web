import { XIcon } from "@heroicons/react/solid";
import Link from "next/link";
import { useWindowSize } from "usehooks-ts";

const Banner = ({
  message = "This is a banner",
  onClose,
}: {
  message?: string;
  onClose: () => void;
}) => {
  const { width } = useWindowSize();
  console.log("width", width);

  return (
    <div className="sm:mb-12 mb-48">
      <div className="bg-[#E0E0FF] text-[#080814] py-6 sm:py-2 px-6 font-semibold fixed w-full top-0 z-50 flex sm:flex-row flex-col text-justify justify-center items-center">
        <span>
          GM! If you like using yieldbay, we are up for vite on Polkassembly to
          onboard the next 3B Users to Polkadot. Please Vote!
        </span>
        <div className="sm:ml-6 flex sm:flex-row flex-col justify-center items-center sm:mt-0 mt-4">
          <Link
            href="https://polkadot.subsquare.io/referenda/referendum/97"
            target="_blank"
            className="text-sm px-12 py-3 font-bold rounded-lg bg-[#5C5CFF] text-white"
          >
            Vote
          </Link>
          {width > 640 ? (
            <button onClick={onClose} className="ml-12">
              <XIcon height={24} width={24} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="mt-4 text-[#080814] opacity-50 underline underline-offset-4"
            >
              I don&apos;t believe in the future of Defi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Banner;
