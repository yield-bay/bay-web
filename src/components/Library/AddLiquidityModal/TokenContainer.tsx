import { fixedAmtNum } from "@utils/abis/contract-helper-methods";
import { FarmType } from "@utils/types/common";
import clsx from "clsx";
import Image from "next/image";
import { RefObject } from "react";

interface TokenContainerProps {
  handleChangeTokenAmount: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inputToFocus: any; // replace with the actual type
  focusedInput: any; // replace with the actual type
  setFocusedInput: (input: any) => void; // replace with the actual type
  farm: FarmType;
  tokenSymbol: string;
  tokenAmount: string;
  inputRef: RefObject<HTMLInputElement>;
  setTokenAmount: (amount: string) => void;
  updateAnotherTokenAmount: (amount: number) => void;
  tokenBalanceLoading: boolean;
  tokenBalance:
    | {
        decimals: number;
        formatted: string;
        symbol: string;
        value: bigint;
      }
    | undefined;
  otherTokenAmount: string;
  otherTokenSymbol: string;
  disableInput: boolean;
}

const TokenContainer: React.FC<TokenContainerProps> = ({
  handleChangeTokenAmount,
  inputToFocus,
  focusedInput,
  setFocusedInput,
  farm,
  tokenSymbol,
  tokenAmount,
  inputRef,
  setTokenAmount,
  updateAnotherTokenAmount,
  tokenBalanceLoading,
  tokenBalance,
  otherTokenAmount,
  otherTokenSymbol,
  disableInput,
}) => {
  return (
    <>
      <div className="relative flex flex-row justify-between px-6 py-[14px] border border-[#D0D5DD] rounded-lg">
        <div className="absolute left-0 -top-9 flex flex-row gap-x-[6px] items-center">
          <div className="z-10 flex overflow-hidden rounded-full">
            <Image
              src={farm?.asset.logos[0] as string}
              alt={farm?.asset.logos[0] as string}
              width={24}
              height={24}
            />
          </div>
          <span className="text-[#344054 text-[14px] font-medium leading-5">
            {tokenSymbol}
          </span>
        </div>
        <input
          placeholder="0"
          className={clsx(
            "text-base text-[#4E4C4C] font-bold leading-6 text-left bg-transparent focus:outline-none"
          )}
          disabled={disableInput}
          onChange={handleChangeTokenAmount}
          value={tokenAmount}
          name="firstTokenAmount"
          id="firstTokenAmount"
          ref={inputRef}
          // onBlur={() => setFocusedInput(InputType.Off)}
          onFocus={() => setFocusedInput(inputToFocus)}
          autoFocus={focusedInput === inputToFocus}
        />
        <div className="inline-flex items-center gap-x-2">
          <div className="flex flex-col items-end text-sm leading-5 opacity-50">
            {tokenBalanceLoading ? (
              <span>loading...</span>
            ) : (
              !!tokenBalance && (
                <div className="flex flex-col items-end">
                  <span>Balance</span>
                  <span>
                    {parseFloat(tokenBalance?.formatted).toLocaleString(
                      "en-US"
                    )}
                  </span>
                </div>
              )
            )}
          </div>
          <button
            className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5"
            onClick={() => {
              setTokenAmount(tokenBalance?.formatted ?? "0");
              updateAnotherTokenAmount(
                parseFloat(tokenBalance?.formatted ?? "0")
              );
            }}
          >
            MAX
          </button>
        </div>
      </div>
      {fixedAmtNum(tokenAmount) > fixedAmtNum(tokenBalance?.formatted) && (
        <div className="text-[#FF9999] leading-6 font-semibold text-base text-left">
          {focusedInput == inputToFocus
            ? "Insufficient Balance"
            : `You need ${
                fixedAmtNum(tokenAmount) - fixedAmtNum(tokenBalance?.formatted)
              } ${tokenSymbol} for creating an LP token with ${fixedAmtNum(
                otherTokenAmount
              )} ${otherTokenSymbol}`}
        </div>
      )}
    </>
  );
};

export default TokenContainer;
