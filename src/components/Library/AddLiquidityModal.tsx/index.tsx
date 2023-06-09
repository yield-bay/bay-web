import { FC, PropsWithChildren, useEffect, useState } from "react";
import { useBalance } from "wagmi";
import ModalWrapper from "../ModalWrapper";
import { addLiqModalOpenAtom } from "@store/commonAtoms";
import { useAtom } from "jotai";
import MButton from "../MButton";
import clsx from "clsx";
import Image from "next/image";
import { selectedFarmAtom } from "@store/atoms";
import { formatTokenSymbols } from "@utils/farmListMethods";
import { useAccount, useNetwork } from "wagmi";
import getTimestamp from "@utils/getTimestamp";

const AddLiquidityModal: FC<PropsWithChildren> = () => {
  const [isOpen, setIsOpen] = useAtom(addLiqModalOpenAtom);
  const [selectedFarm, setSelectedFarm] = useAtom(selectedFarmAtom);
  const { address } = useAccount();
  const { chain } = useNetwork();
  const {
    data: balanceData,
    isLoading,
    isError,
  } = useBalance({
    address,
    chainId: chain?.id,
    // token: tokenAddress
  });

  // Amount States
  const [firstTokenAmount, setFirstTokenAmount] = useState("");
  const [secondTokenAmount, setSecondTokenAmount] = useState("");

  const [isToken0Approved, setIsToken0Approved] = useState(false);
  const [isToken1Approved, setIsToken1Approved] = useState(false);

  useEffect(() => console.log("farm", selectedFarm), [selectedFarm]);

  // Method to update token values and fetch fees based on firstToken Input
  const handleChangeFirstTokenAmount = async (e: any) => {
    setFirstTokenAmount(e.target.value);
    // const firstTokenAmount = parseFloat(e.target.value);
    // if (e.target.value == "") {
    //   setFees(null);
    // }
    // const expectedSecondTokenAmount = updateSecondTokenAmount(firstTokenAmount);
    // await handleFees(firstTokenAmount, expectedSecondTokenAmount);
  };

  // Method to update token values and fetch fees based on secondToken Input
  const handleChangeSecondTokenAmount = async (e: any) => {
    setSecondTokenAmount(e.target.value);
    // if (e.target.value == "") {
    //   setFees(null);
    // }

    // // Calculate first token amount
    // const secondTokenAmount = parseFloat(e.target.value);
    // const expectedFirstTokenAmount = updateFirstTokenAmount(secondTokenAmount);
    // // Calculate Fees
    // await handleFees(secondTokenAmount, expectedFirstTokenAmount);
  };

  const [token0, token1] = formatTokenSymbols(selectedFarm?.asset.symbol ?? "");

  return (
    <ModalWrapper open={isOpen} setOpen={setIsOpen}>
      <p className="font-semibold text-lg text-left">Add Liquidity</p>
      <div className="text-left text-base">
        {isLoading ? (
          <p>loading...</p>
        ) : !!balanceData && !isError ? (
          <p>
            Balance: {balanceData?.formatted} {balanceData?.symbol}
          </p>
        ) : (
          <p>error</p>
        )}
      </div>
      <div className="w-full flex flex-col gap-y-10">
        {/* First token Container */}
        <div className="flex flex-col gap-y-3">
          <div
            className={clsx(
              "flex flex-row justify-between p-4 border border-[#727272] rounded-lg"
            )}
          >
            <div className="flex flex-row gap-x-5 items-center">
              <div className="z-10 flex overflow-hidden rounded-full">
                <Image
                  src={selectedFarm?.asset.logos[0] as string}
                  alt={selectedFarm?.asset.symbol as string}
                  width={32}
                  height={32}
                />
              </div>
              <span>{token0}</span>
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
                  onChange={handleChangeFirstTokenAmount}
                  value={firstTokenAmount}
                  autoFocus
                />
              </div>
            </div>
          </div>
        </div>
        <div className="py-3 px-4 bg-[#E0DCDC] rounded-full max-w-fit mx-auto select-none">
          +
        </div>
        {/* Second token container */}
        <div className="flex flex-col gap-y-3">
          <div
            className={clsx(
              "flex flex-row justify-between p-4 border border-[#727272] rounded-lg"
            )}
          >
            <div className="flex flex-row gap-x-5 items-center">
              <div className="z-10 flex overflow-hidden rounded-full">
                <Image
                  src={selectedFarm?.asset.logos[1] as string}
                  alt={selectedFarm?.asset.symbol as string}
                  width={32}
                  height={32}
                />
              </div>

              <span>{token1}</span>
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
                    // token1BalNotAvailable && "text-[#FF8787]"
                  )}
                  min={0}
                  onChange={handleChangeSecondTokenAmount}
                  value={secondTokenAmount}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-y-2">
          {!isToken0Approved || !isToken1Approved ? (
            <>
              <MButton
                type="secondary"
                text="Approve First Token"
                disabled={isToken0Approved}
                onClick={() => {
                  setIsToken0Approved(true);
                }}
              />
              <MButton
                type="secondary"
                text="Approve Second Token"
                disabled={isToken1Approved}
                onClick={() => {
                  setIsToken1Approved(true);
                }}
              />
            </>
          ) : (
            <MButton
              type="secondary"
              disabled={
                // Atleast one token must be more than zero
                firstTokenAmount == "" ||
                secondTokenAmount == "" ||
                (parseFloat(firstTokenAmount) <= 0 &&
                  parseFloat(secondTokenAmount) <= 0)
              }
              text="Confirm"
              onClick={() => {
                console.log("router.addLiquidity @params", {
                  address_token0: selectedFarm?.chef,
                  address_token1: selectedFarm?.chef,
                  token0Amount: parseFloat(firstTokenAmount) ?? 0,
                  token1Amount: parseFloat(secondTokenAmount) ?? 0,
                  minToken0Amount: 1,
                  minToken1Amount: 1,
                  msg_sender: address,
                  block_timestamp: getTimestamp(),
                });
                // console.log(
                //   "balance",
                //   publicClient.getBalance({
                //     address,
                //   })
                // );
              }}
            />
          )}
          <MButton
            type="transparent"
            text="Go Back"
            onClick={() => {
              setIsOpen(false);
            }}
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default AddLiquidityModal;
