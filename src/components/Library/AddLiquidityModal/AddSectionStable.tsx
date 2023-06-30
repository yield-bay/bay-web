import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/outline";
import { type FC, useState, Fragment, useCallback, useEffect } from "react";
import ModalWrapper from "../ModalWrapper";
import { addLiqModalOpenAtom } from "@store/commonAtoms";
import { useAtom } from "jotai";
import { selectedFarmAtom } from "@store/atoms";
import MButton from "../MButton";
import clsx from "clsx";
import Image from "next/image";

interface Token {
  address: string;
  name: string;
}

const AddSectionStable: FC = () => {
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [isPending, setPending] = useState(false);
  const [isOpen, setIsOpen] = useAtom(addLiqModalOpenAtom);
  const [selectedFarm, setSelectedFarm] = useAtom(selectedFarmAtom);

  const handleInputChange = (token: string, value: string) => {
    setAmounts((prevState) => ({
      ...prevState,
      [token]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);
    // Simulate network request
    setTimeout(() => {
      setPending(false);
      setIsOpen(false);
      console.log(amounts);
    }, 2000);
  };

  // Reset amounts when closing the modal
  useEffect(() => {
    if (!open) setAmounts({});
  }, [open]);

  const tokens = selectedFarm?.asset.underlyingAssets ?? [];

  return (
    <ModalWrapper open={isOpen} setOpen={setIsOpen}>
      <p className="font-semibold text-lg text-left">Add Liquidity</p>
      <div className="w-full flex flex-col gap-y-4">
        {/* First token Container */}
        {tokens.map((token, index) => (
          <div key={index}>
            <div className="flex flex-col gap-y-3">
              {/* <div className="text-left text-base">
                {token0BalanceLoading ? (
                  <p>loading...</p>
                ) : (
                  !!token0Balance && (
                    <p>
                      Balance: {token0Balance?.formatted} {token0Balance?.symbol}
                    </p>
                  )
                )}
              </div> */}
              <div
                className={clsx(
                  "flex flex-row justify-between p-4 border border-[#727272] rounded-lg"
                )}
              >
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
                      className={clsx(
                        "text-xl leading-[27px] bg-transparent text-right focus:outline-none"
                        // token0BalNotAvailable && "text-[#FF8787]"
                      )}
                      min={0}
                      // onChange={handleChangeFirstTokenAmount}
                      // value={firstTokenAmount}
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            </div>
            {index !== tokens.length - 1 && (
              <div className="py-3 px-4 mt-4 bg-[#E0DCDC] rounded-full max-w-fit mx-auto select-none">
                +
              </div>
            )}
          </div>
        ))}
        <div className="flex flex-col gap-y-2 mt-9">
          {tokens.map((token, index) => (
            <MButton
              key={`${token?.symbol}-${index}`}
              type="secondary"
              text={`Approve ${token.symbol} Token`}
              onClick={() => {}}
            />
          ))}
        </div>

        {/* Buttons */}
        {/*
         <div className="flex flex-col gap-y-2">
           {isToken0ApprovedLoading || isToken1ApprovedLoading ? (
            <MButton type="primary" text="Checking if tokens are approved..." />
          ) : (isSuccessApprove0 || !!Number(isToken0Approved)) &&
            (isSuccessApprove1 || !!Number(isToken1Approved)) ? (
            <MButton
              type="secondary"
              disabled={
                firstTokenAmount == "" ||
                secondTokenAmount == "" ||
                (parseFloat(firstTokenAmount) <= 0 &&
                  parseFloat(secondTokenAmount) <= 0) ||
                typeof addLiquidity == "undefined" ||
                isLoadingAddLiq ||
                isSuccessAddLiq
              }
              text={isLoadingAddLiq ? "Processing..." : "Confirm"}
              onClick={async () => {
                if (
                  parseFloat(firstTokenAmount) <= 0 &&
                  parseFloat(secondTokenAmount) <= 0
                ) {
                  console.log("Both token amount can't be zero");
                } else {
                  console.log("router.addLiquidity @params", {
                    address_token0: farmAsset0?.address,
                    address_token1: farmAsset1?.address,
                    token0Amount: parseFloat(firstTokenAmount),
                    token1Amount: parseFloat(secondTokenAmount),
                    minToken0Amount:
                      (parseFloat(firstTokenAmount) * (100 - SLIPPAGE)) / 100, // TODO: Need to multiply it with token amount?
                    minToken1Amount:
                      (parseFloat(secondTokenAmount) * (100 - SLIPPAGE)) / 100,
                    msg_sender: address,
                    block_timestamp: "Calc at runtime",
                  });
                  handleAddLiquidity();
                }
              }}
            />
          ) : (
            <>
              {!isToken0Approved && !isSuccessApprove0 && (
                <MButton
                  type="secondary"
                  text={
                    isLoadingApprove0
                      ? "Approving..."
                      : `Approve ${farmAsset0.symbol} Token`
                  }
                  disabled={
                    isSuccessApprove0 ||
                    isLoadingApprove0 ||
                    typeof approveToken0 == "undefined"
                  }
                  onClick={async () => {
                    const txn = await approveToken0?.({
                      args: [
                        selectedFarm?.router,
                        BigInt(
                          "115792089237316195423570985008687907853269984665640564039457584007913129639935"
                        ),
                      ],
                    });
                    console.log("Approve0 Result", txn);
                  }}
                />
              )}
              {!isToken1Approved && !isSuccessApprove1 && (
                <MButton
                  text={
                    isLoadingApprove1
                      ? "Approving..."
                      : `Approve ${farmAsset1.symbol} Token`
                  }
                  type="secondary"
                  disabled={
                    isSuccessApprove1 ||
                    isLoadingApprove1 ||
                    typeof approveToken1 == "undefined"
                  }
                  onClick={async () => {
                    const txn = await approveToken1?.({
                      args: [
                        selectedFarm?.router,
                        BigInt(
                          "115792089237316195423570985008687907853269984665640564039457584007913129639935"
                        ),
                      ],
                    });
                    console.log("Approve1 Result", txn);
                  }}
                />
              )}
            </>
          )}
          <MButton
            type="transparent"
            text="Go Back"
            onClick={() => {
              setIsOpen(false);
            }}
          />
        </div>
        */}
        {/* {isSuccessAddLiq && <div>Liquidity Added successfully</div>} */}
      </div>
    </ModalWrapper>
  );
};

export default AddSectionStable;
