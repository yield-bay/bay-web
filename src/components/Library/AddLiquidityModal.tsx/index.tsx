import { FC, PropsWithChildren, useEffect, useState } from "react";
import ModalWrapper from "../ModalWrapper";
import { addLiqModalOpenAtom } from "@store/commonAtoms";
import { useAtom } from "jotai";
import MButton from "../MButton";
import clsx from "clsx";
import Image from "next/image";
import { selectedFarmAtom } from "@store/atoms";

const AddLiquidityModal: FC<PropsWithChildren> = () => {
  const [isOpen, setIsOpen] = useAtom(addLiqModalOpenAtom);
  const [selectedFarm, setSelectedFarm] = useAtom(selectedFarmAtom);
  // Amount States
  const [firstTokenAmount, setFirstTokenAmount] = useState("");
  const [secondTokenAmount, setSecondTokenAmount] = useState("");

  const [isToken0Approved, setIsToken0Approved] = useState(false);
  const [isToken1Approved, setIsToken1Approved] = useState(false);

  useEffect(() => {
    console.log("selectedFarm", selectedFarm);
  }, [selectedFarm]);

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

  return (
    <ModalWrapper open={isOpen} setOpen={setIsOpen}>
      <p className="font-semibold text-lg text-left">Add Liquidity</p>
      <div className="w-full flex flex-col gap-y-10">
        {/* Token0 Container */}
        <div className="flex flex-col gap-y-3">
          <div
            className={clsx(
              "flex flex-row justify-between p-4 border border-[#727272] rounded-lg"
            )}
          >
            <div className="flex flex-row gap-x-5 items-center">
              <div className="bg-gray-300 w-8 h-8 rounded-full" />
              <span>{"KSM"}</span>
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
        {/* TUR Container */}
        <div className="flex flex-col gap-y-3">
          <div
            className={clsx(
              "flex flex-row justify-between p-4 border border-[#727272] rounded-lg"
            )}
          >
            <div className="flex flex-row gap-x-5 items-center">
              <div className="bg-gray-300 w-8 h-8 rounded-full" />
              <span>{"MGX"}</span>
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
            <MButton type="secondary" text="Confirm" onClick={() => {}} />
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
