import { memo } from "react";
import Image from "next/image";
import useScreenSize from "@hooks/useScreenSize";

type FarmAssetsProps = {
  logos: string[];
};

const FarmAssets = ({ logos }: FarmAssetsProps) => {
  const screenSize = useScreenSize();
  return (
    <div className="flex justify-start sm:justify-end">
      {screenSize === "xs" ? (
        <div className="sm:hidden flex flex-row items-center justify-center -space-x-2">
          {logos.map((logo: string, index: number) => (
            <div
              key={index}
              className="z-10 flex overflow-hidden ring-2 ring-white rounded-full bg-neutral-800 transition duration-200"
            >
              <Image src={logo} alt={logo} width={24} height={24} />
            </div>
          ))}
        </div>
      ) : (
        <div className="hidden sm:flex flex-row items-center justify-center -space-x-1">
          {logos.map((logo: string, index: number) => (
            <div
              key={index}
              className="z-10 flex overflow-hidden ring-[1.5px] ring-white rounded-full bg-[#EAEAF1]"
            >
              <Image src={logo} alt={logo} width={24} height={24} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(FarmAssets);
