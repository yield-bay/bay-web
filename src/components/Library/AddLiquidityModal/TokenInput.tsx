import { useEffect, useRef } from "react";
import { UnderlyingAssets } from "@utils/types/common";
import Image from "next/image";
import { Address, useAccount, useBalance, useNetwork } from "wagmi";
import clsx from "clsx";
import { fixedAmtNum } from "@utils/abis/contract-helper-methods";

interface TokenInputProps {
  token: UnderlyingAssets;
  index: number;
  handleInput: (token: UnderlyingAssets, value: string) => void;
  inputMap: {
    [address: Address]: string;
  };
  balanceMap: { [address: `0x${string}`]: string };
  setBalanceMap: React.Dispatch<
    React.SetStateAction<{
      [address: `0x${string}`]: string;
    }>
  >;
  nativeBal: string;
  logos: string | string[];
  tokensLength: number;
  focusedInput: number;
  setFocusedInput: (input: number) => void;
}

const TokenInput: React.FC<TokenInputProps> = ({
  token,
  index,
  handleInput,
  inputMap,
  balanceMap,
  setBalanceMap,
  nativeBal,
  logos,
  tokensLength,
  focusedInput,
  setFocusedInput,
}) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const inputRef = useRef<HTMLInputElement>(null);
  // Balance Token
  const {
    data: balance,
    isLoading: balanceLoading,
    isSuccess,
  } = useBalance({
    address: address,
    chainId: chain?.id,
    token: token?.address,
    enabled: !!address && !!logos,
  });

  useEffect(() => {
    if (isSuccess && !balanceMap[token?.address]) {
      console.log(
        "pinguu",
        token,
        nativeBal,
        token?.symbol == "ASTR",
        balance?.formatted
      );
      setBalanceMap((prev) => ({
        ...prev,
        [token?.address]:
          token?.symbol == "ASTR" ? nativeBal : balance?.formatted,
      }));
    }
  }, [isSuccess]);

  return (
    <div>
      <div className="relative flex flex-row justify-between px-6 py-[14px] border border-[#D0D5DD] rounded-lg">
        <div className="absolute left-0 -top-9 flex flex-row gap-x-[6px] items-center">
          <div className="flex flex-row items-center justify-center -space-x-2">
            {Array.isArray(logos) ? (
              logos.map((logo: string, index: number) => (
                <div
                  key={index}
                  className="z-10 flex overflow-hidden rounded-full"
                >
                  <Image src={logo} alt={logo} width={24} height={24} />
                </div>
              ))
            ) : (
              <div className="z-10 flex overflow-hidden rounded-full">
                <Image src={logos} alt={logos} width={24} height={24} />
              </div>
            )}
          </div>
          <span className="text-[#344054 text-[14px] font-medium leading-5">
            {token?.symbol}
          </span>
        </div>
        <input
          placeholder="0"
          className={clsx(
            "text-base font-bold leading-6 text-left bg-transparent focus:outline-none",
            fixedAmtNum(inputMap[token.address]) >
              fixedAmtNum(balance?.formatted)
              ? "text-[#FF9999]"
              : "text-[#4E4C4C]"
          )}
          min={0}
          value={inputMap[token?.address] ?? ""}
          onChange={(event) => {
            event.preventDefault();
            handleInput(token, event.target.value);
          }}
          ref={inputRef}
          onFocus={() => setFocusedInput(index)}
          autoFocus={focusedInput === index}
        />
        <div className="inline-flex items-center gap-x-2">
          <div className="flex flex-col items-end text-sm leading-5 opacity-50">
            {balanceLoading ? (
              <span>loading...</span>
            ) : (
              !!balance && (
                <p className="flex flex-col items-end">
                  <span>Balance</span>
                  <span>
                    {token?.symbol == "ASTR"
                      ? nativeBal
                      : parseFloat(balance?.formatted).toLocaleString(
                          "en-US"
                        )}{" "}
                    {token?.symbol == "ASTR" ? "ASTR" : balance?.symbol}
                  </span>
                </p>
              )
            )}
          </div>
          <button
            className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5"
            onClick={() => {
              handleInput(token, balance?.formatted ?? "0");
            }}
          >
            MAX
          </button>
        </div>
      </div>
      <div
        className={clsx(
          "text-left text-base leading-6 font-bold mt-3",
          fixedAmtNum(inputMap[token.address]) > fixedAmtNum(balance?.formatted)
            ? "text-[#FF9999]"
            : "hidden"
        )}
      >
        Insufficient Balance
      </div>
      {index !== tokensLength - 1 && (
        <div className="bg-[#e0dcdc] flex justify-center p-3 mt-3 max-w-fit items-center rounded-full text-base select-none mx-auto">
          <Image src="/icons/PlusIcon.svg" alt="Plus" width={16} height={16} />
        </div>
      )}
    </div>
  );
};

export default TokenInput;
