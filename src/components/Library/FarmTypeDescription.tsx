import React from "react";

type FarmTypeProps = {
  farmType?: string;
};

const FarmTypeDescription = ({ farmType }: FarmTypeProps) => {
  return (
    <div className="flex flex-col gap-6">
      <div className="opacity-50 font-bold">Type</div>
      <div className="font-bold">{farmType}</div>
      <div className="w-60">
        {farmType === "StableAmm"
          ? "The stable swap is a kind of automated market maker (AMM) dedicated to swapping tokens with stable values. Its goal is to facilitate swaps as efficiently as possible and allow users to trade stablecoins with minimal loss.  Know More about them here."
          : farmType === "StandardAmm"
          ? "Standard Amm"
          : "Single Staking"}
      </div>
    </div>
  );
};

export default FarmTypeDescription;
