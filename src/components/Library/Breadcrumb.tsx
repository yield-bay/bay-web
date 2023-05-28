import { ChevronRightIcon } from "@heroicons/react/solid";
import Image from "next/image";
import Link from "next/link";

interface Props {
  tokenNames: string[];
}

export default function Breadcrumb({ tokenNames }: Props) {
  return (
    <nav className="flex max-w-fit mt-2 mb-7" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center gap-x-3">
        <li className="hover:scale-105 active:scale-100 transition duration-200">
          <Link href="/">
            <Image
              src="/icons/HomeIcon.svg"
              alt="Go to home"
              width={20}
              height={20}
              className="flex-shrink-0"
            />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        <li>
          <div className="flex items-center">
            <ChevronRightIcon
              className="h-4 w-4 flex-shrink-0 text-[#D0D5DD]"
              aria-hidden="true"
            />
            <p className="ml-4 text-sm font-medium text-[#A9A9A9]">
              {tokenNames.map((tokenName, index) => (
                <span key={index}>
                  {tokenName}
                  {index !== tokenNames.length - 1 && "-"}
                </span>
              ))}
            </p>
          </div>
        </li>
      </ol>
    </nav>
  );
}
