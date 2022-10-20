import Image from "next/image";
import React from "react";

const defaultLogos = [
  "https://raw.githubusercontent.com/yield-bay/assets/main/list/FRAX.png",
  "https://raw.githubusercontent.com/yield-bay/assets/main/list/BUSD.png",
  "https://raw.githubusercontent.com/yield-bay/assets/main/list/FRAX.png",
  "https://raw.githubusercontent.com/yield-bay/assets/main/list/BUSD.png",
];
const defaultNames = ["DAI", "USDC", "KSM", "USDT"];

type FarmAssetBreakdownProps = {
  logos: string[];
  assetNames: string[];
};

const FarmAssetBreakdown = ({
  assetNames = defaultNames,
  logos = defaultLogos,
}: FarmAssetBreakdownProps) => {
  return (
    <div className="flex flex-col gap-3">
      {logos.map((logo: string, index: number) => (
        <div key={index} className="flex flex-row items-center gap-2">
          <Image src={logo} alt={logo} width={48} height={48} />
          <div className="text-base font-bold">{assetNames[index]}</div>
        </div>
      ))}
    </div>
  );
};

export default FarmAssetBreakdown;