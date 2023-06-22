import { useState } from "react";
import { useAtom } from "jotai";
import { removeLiqModalOpenAtom } from "@store/commonAtoms";
import { selectedFarmAtom } from "@store/atoms";
import MButton from "../MButton";
import ModalWrapper from "../ModalWrapper";

const RemoveLiquidityModal = () => {
  const [isOpen, setIsOpen] = useAtom(removeLiqModalOpenAtom);
  const [selectedFarm, setSelectedFarm] = useAtom(selectedFarmAtom);
  // Amount States
  const [lpTokenAmount, setLpTokenAmount] = useState("");
  const [isTokenApproved, setIsTokenApproved] = useState(false);

  const handleLpTokensChange = (event: any) => {
    event.preventDefault();
    setLpTokenAmount(event.target.value);
  };

  return (
    <ModalWrapper open={isOpen} setOpen={setIsOpen}>
      <p className="font-semibold text-lg text-left">Remove Liquidity</p>
      <div className="w-full flex flex-col gap-y-10">
        <div className="flex flex-col gap-y-5">
          <div className="relative flex flex-col gap-y-5">
            <input
              className="text-2xl bg-transparent text-left pb-12 focus:outline-none w-full border-0 ring-1 ring-[#727272] focus:ring-primaryGreen rounded-lg p-4 number-input"
              autoFocus={true}
              value={lpTokenAmount}
              placeholder={"0"}
              onChange={handleLpTokensChange}
              type="number"
            />
            <div className="absolute right-4 top-[21px] bottom-0 text-base leading-[21.6px] text-[#727272]">
              Tokens
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-y-2">
          <MButton
            type="secondary"
            text="Confirm"
            // disabled={lpTokensDisabled || percentageDisabled}
            onClick={() => {}}
          />
          <MButton type="transparent" text="Go Back" onClick={() => {}} />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default RemoveLiquidityModal;
