import { useAtom } from "jotai";
import { QuestionMarkCircleIcon } from "@heroicons/react/outline";
import { slippageModalOpenAtom } from "@store/commonAtoms";
import { slippageAtom } from "@store/atoms";
import ModalWrapper from "./ModalWrapper";
import Image from "next/image";
import { useState } from "react";
import MButton from "./MButton";
import Tooltip from "./Tooltip";
import { ModalType } from "@utils/types/enums";

const SlippageModal = () => {
  const [isOpen, setIsOpen] = useAtom(slippageModalOpenAtom);
  const [slippage, setSlippage] = useAtom(slippageAtom);
  const [inputSlippage, setInputSlippage] = useState<string>(
    slippage.toString(10)
  );

  const submitSlippage = () => {
    const slppg = parseFloat(inputSlippage);
    if (!isNaN(slppg) && slppg > 0 && slppg < 100) {
      setSlippage(slppg);
    } else {
      alert("Invalid slippage value!");
    }
  };

  return (
    <ModalWrapper open={isOpen} setOpen={setIsOpen} type={ModalType.BLUE}>
      <div className="inline-flex items-center justify-start gap-x-4 text-base leading-5 text-[#1D2939]">
        <button
          className="max-w-fit hover:translate-x-1 active:-translate-x-0 transition-all duration-200 ease-in-out"
          onClick={() => setIsOpen(false)}
        >
          <Image
            src="/icons/ArrowLeft.svg"
            alt="Go back"
            height={24}
            width={24}
          />
        </button>
        <h1 className="font-bold">Set Slippage Tolerance</h1>
        <Tooltip label="Update the Slippage" placement="top">
          <QuestionMarkCircleIcon className="-ml-2 h-5 w-5 text-[#C0CBDC]" />
        </Tooltip>
      </div>
      <div className="inline-flex items-center gap-x-3">
        <div className="relative w-full border border-[#BEBEBE] p-6 rounded-lg">
          <input
            autoFocus
            placeholder="0"
            className="text-lg leading-[27px] w-full font-bold text-[#344054] text-left bg-transparent focus:outline-none"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              const value = event.target.value;
              if (/^(\d+\.?\d*|\.\d+)$/.test(value) || value === "") {
                setInputSlippage(event.target.value);
              }
            }}
            value={inputSlippage}
            name="slippage"
            id="slippage"
          />
          <span className="absolute select-none right-6 opacity-50 text-[#344054] text-lg leading-[27px]">
            %
          </span>
        </div>
        <button
          className="px-8 py-[28px] bg-[#F9FAFB] border border-[#D0D5DD] shadow-sm rounded-lg text-base font-semibold leading-5 text-[#1D2939]"
          onClick={() => {
            setInputSlippage("0.05");
            submitSlippage();
          }}
        >
          Auto
        </button>
      </div>
      <MButton
        text="Confirm Slippage Tolerance"
        isLoading={false}
        type="primary"
        className="w-full"
        onClick={() => {
          submitSlippage();
          setIsOpen(false);
        }}
      />
    </ModalWrapper>
  );
};

export default SlippageModal;
