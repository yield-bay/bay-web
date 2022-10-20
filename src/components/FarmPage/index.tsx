import FarmAssetBreakdown from "@components/Library/FarmAssetBreakdown";
import FarmTypeDescription from "@components/Library/FarmTypeDescription";
import { fetchListicleFarms } from "@utils/api";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/solid";

export default function FarmPage(props: any) {
  function capitalize(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1);
  }

  return (
    <div className="flex gap-16 border px-[120px]">
      {/* Back Arrow Icon */}
      <div className="border opacity-70">
        <Link href="/">
          <div className="flex flex-row gap-x-[14px]">
            <ArrowLeftIcon className="w-[18px]" />
            <span className=" font-semibold text-xl leading-6">back</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
