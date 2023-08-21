import { XIcon } from "@heroicons/react/solid";
import Link from "next/link";

const Banner = ({
  message = "This is a banner",
  onClose,
}: {
  message?: string;
  onClose: () => void;
}) => {
  return (
    <div className="mb-12">
      <div className="bg-[#E0E0FF] text-[#080814] py-2 px-4 font-semibold fixed w-full top-0 left-0 z-50 flex justify-center items-center">
        <div className="flex flex-row w-full justify-center items-center">
          <span>
            GM! If you like using yieldbay, we are up for vite on Polkassembly
            to onboard the next 3B Users to Polkadot. Please Vote!
          </span>
          <Link
            href="https://polkadot.subsquare.io/referenda/referendum/97"
            target="_blank"
            className="ml-4 text-sm px-12 py-3 font-bold rounded-lg bg-[#5C5CFF] text-white"
          >
            Vote
          </Link>
        </div>
        <button onClick={onClose} className="mr-12">
          <XIcon height={24} width={24} />
        </button>
      </div>
    </div>
  );
};

export default Banner;
