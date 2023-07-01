import { UnderlyingAssets } from "@utils/types";
import Image from "next/image";
import { useAccount, useBalance, useNetwork } from "wagmi";

interface TokenInputProps {
  token: UnderlyingAssets;
  index: number;
  handleInput: (token: UnderlyingAssets, value: string) => void;
  inputMap: {
    [address: `0x${string}`]: string;
  };
  selectedFarm: any;
  tokensLength: number;
}

const TokenInput: React.FC<TokenInputProps> = ({
  token,
  index,
  handleInput,
  inputMap,
  selectedFarm,
  tokensLength,
}) => {
  const { address } = useAccount();
  const { chain } = useNetwork();
  // Balance Token
  const { data: balance, isLoading: balanceLoading } = useBalance({
    address: address,
    chainId: chain?.id,
    token: token?.address,
    enabled: !!address && !!selectedFarm,
  });

  return (
    <div>
      <div className="flex flex-col gap-y-3">
        <div className="text-left text-base">
          {balanceLoading ? (
            <p>loading...</p>
          ) : !!balance ? (
            <p>
              Balance: {balance?.formatted} {token?.symbol}
            </p>
          ) : (
            <p className="text-red-500">
              ⚠️ Unable to fetch balance of {token.symbol}
            </p>
          )}
        </div>
        <div className="flex flex-row justify-between p-4 border border-[#727272] rounded-lg">
          <div className="flex flex-row gap-x-5 items-center">
            <div className="z-10 flex overflow-hidden rounded-full">
              <Image
                src={selectedFarm?.asset.logos[index]!}
                alt={selectedFarm?.asset.symbol as string}
                width={32}
                height={32}
              />
            </div>
            <span>{token?.symbol}</span>
          </div>
          <div className="flex flex-col gap-y-3">
            <div className="flex flex-row justify-end items-center gap-x-3">
              <p className="flex flex-col items-end text-sm leading-[19px] opacity-50">
                <span>Balance</span>
              </p>
            </div>
            <div className="text-right">
              <input
                placeholder="0"
                className="text-xl leading-[27px] bg-transparent text-right focus:outline-none"
                min={0}
                value={inputMap[token?.address] ?? ""}
                onChange={(event) => {
                  event.preventDefault();
                  handleInput(token, event.target.value);
                }}
              />
            </div>
          </div>
        </div>
      </div>
      {index !== tokensLength - 1 && (
        <div className="py-3 px-4 mt-4 bg-[#E0DCDC] rounded-full max-w-fit mx-auto select-none">
          +
        </div>
      )}
    </div>
  );
};

export default TokenInput;
