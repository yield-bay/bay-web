import { useEffect, useState } from "react";
import Image from "next/image";
import { useAtom } from "jotai";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import {
  farmsAtom,
  lpTokenPricesAtom,
  positionsAtom,
  selectedPositionAtom,
  tokenPricesAtom,
} from "@store/atoms";
import {
  accountInitAtom,
  claimModalOpenAtom,
  isInitialisedAtom,
  lpUpdatedAtom,
  mangataAddressAtom,
  mangataPoolsAtom,
  subPosLoadingAtom,
} from "@store/commonAtoms";
import { Spinner } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import ToastWrapper from "../ToastWrapper";
import MButton from "../MButton";
import { dotAccountAtom } from "@store/accountAtoms";
import { mangataHelperAtom } from "@store/commonAtoms";
import { MangataPool } from "@utils/types/common";
import { delay } from "@utils/xcm/common/utils";
import { formatTokenSymbols } from "@utils/farmListMethods";
import Link from "next/link";
import { MANGATA_EXPLORER_URL } from "@utils/constants";
import toUnits from "@utils/toUnits";
import {
  fetchSubstratePositions,
  updateSubstratePositions,
} from "@utils/position-utils/substratePositions";
import { handleClaimRewardsEvent } from "@utils/tracking";
import getTimestamp from "@utils/getTimestamp";

const ClaimSectionDot = () => {
  const [isOpen, setIsOpen] = useAtom(claimModalOpenAtom);
  const [account] = useAtom(dotAccountAtom);
  const [position] = useAtom(selectedPositionAtom);

  const [lpUpdated, setLpUpdated] = useAtom(lpUpdatedAtom);

  useEffect(() => console.log("selected position @claimrewards"), [position]);

  const [isProcessStep, setIsProcessStep] = useState(false);
  const isOpenModalCondition = false; // Conditions to be written
  const [txnHash, setTxnHash] = useState<string>("");

  // Process states
  const [isInProcess, setIsInProcess] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [mangataHelper] = useAtom(mangataHelperAtom);
  const [account1] = useAtom(accountInitAtom);
  const [pools] = useAtom(mangataPoolsAtom);
  const [pool, setPool] = useState<MangataPool>();
  const [mangataAddress] = useAtom(mangataAddressAtom);
  const [isInitialised] = useAtom(isInitialisedAtom);
  const [mgxBalance, setMgxBalance] = useState<number>(0);

  const [farms] = useAtom(farmsAtom);
  const [positions, setPositions] = useAtom(positionsAtom);
  const [lpTokenPricesMap, setLpTokenPricesMap] = useAtom(lpTokenPricesAtom);
  const [tokenPricesMap] = useAtom(tokenPricesAtom);
  const [, setIsSubPosLoading] = useAtom(subPosLoadingAtom);

  const [token0, token1] = formatTokenSymbols(position?.lpSymbol ?? "");

  const toast = useToast();

  useEffect(() => {
    // Resetting all states to default on open/close
    setIsInProcess(false);
    setIsSigning(false);
    setIsSuccess(false);
  }, [isOpen]);

  // MGX Balance
  // fetchMGXBalance();

  const handleClaimRewards = async () => {
    setIsInProcess(true);
    try {
      setIsSigning(true);
      console.log("clpool", pool, position);
      const signer = account?.wallet?.signer;
      const claimRewardsTxn = await mangataHelper.claimRewardsAll(position?.id);
      claimRewardsTxn
        .signAndSend(
          account1?.address,
          { signer: signer },
          async ({ status }: any) => {
            if (status.isInBlock) {
              console.log("claimrew in block now!");
              // unsub();
              // resolve();
            } else if (status.isFinalized) {
              (async () => {
                const tranHash = status.asFinalized.toString();
                setTxnHash(tranHash);
                console.log(
                  `Batch Tx finalized with hash ${tranHash}\n\nbefore delay\n`
                );
                await delay(20000);
                console.log("after delay");
                const block = await mangataHelper.api.rpc.chain.getBlock(
                  tranHash
                );
                console.log("block", block);
                console.log("block", JSON.stringify(block));
                const bhn = parseInt(block.block.header.number) + 1;
                console.log("num", bhn);
                const blockHash =
                  await mangataHelper.api.rpc.chain.getBlockHash(bhn);
                console.log(`blockHash ${blockHash}`);
                console.log("bhjs", JSON.stringify(blockHash) ?? "nothing");
                // const blockEvents =
                //   await mangataHelper.api.query.system.events.at(tranHash);
                const at = await mangataHelper.api.at(blockHash);
                const blockEvents = await at.query.system.events();
                console.log("blockEvents", blockEvents);
                let allSuccess = true;
                blockEvents.forEach((d: any) => {
                  const {
                    phase,
                    event: { data, method, section },
                  } = d;
                  console.info("method");
                  console.info(method);
                  if (
                    method === "BatchInterrupted" ||
                    method === "ExtrinsicFailed"
                  ) {
                    console.log("failed is true");
                    // failed = true;
                    console.log("Error in addliq Tx:");
                    allSuccess = false;
                    setIsSuccess(false);
                    setIsSigning(false);
                    setIsInProcess(false);
                    toast({
                      position: "top",
                      duration: 3000,
                      render: () => (
                        <ToastWrapper
                          title="Error while minting Liquidity!"
                          status="error"
                        />
                      ),
                    });
                  }
                });
                if (allSuccess) {
                  console.log("allSuccess", allSuccess);
                  setIsSuccess(true);
                  setIsInProcess(false);
                  setIsSigning(false);
                  // setLpUpdated(lpUpdated + 1);
                  console.log(
                    `Rewards Successfully claimed from ${token0}-${token1} with hash ${status.asFinalized.toHex()}`
                  );
                  toast({
                    position: "top",
                    duration: 3000,
                    render: () => (
                      <ToastWrapper
                        title={`Rewards successfully claimed from ${token0}-${token1} pool.`}
                        status="success"
                      />
                    ),
                  });
                  fetchSubstratePositions({
                    farms,
                    positions,
                    setPositions,
                    setIsSubPosLoading,
                    account,
                  });
                  // unsub();
                  // resolve();
                }
              })();
            } else {
              setIsSigning(false);
              console.log(`Status: ${status.type}`);
            }
          }
        )
        .catch((e: any) => {
          console.log("Error in burnLiquidityTx", e);
          setIsInProcess(false);
          setIsSigning(false);
          setIsSuccess(false);
          toast({
            position: "top",
            duration: 3000,
            render: () => (
              <ToastWrapper
                title="Error while removing Liquidity. Please try again later."
                status="error"
              />
            ),
          });
        });
      console.log("called claim rewards method");
    } catch (error) {
      let errorString = `${error}`;
      console.error("error while claiming rewards:", error);
      toast({
        position: "top",
        duration: 3000,
        render: () => <ToastWrapper title={errorString} status="error" />,
      });
      setIsInProcess(false);
      setIsSigning(false);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      console.log("claimrewards txn success!");
      // Tracking
      handleClaimRewardsEvent({
        userAddress: account?.address!,
        walletType: "DOT",
        walletProvider: account?.wallet?.extensionName!,
        timestamp: getTimestamp(),
        farm: {
          id: position?.id!,
          chef: position?.chef!,
          chain: position?.chain!,
          protocol: position?.protocol!,
          assetSymbol: position?.lpSymbol!,
        },
        rewards: position?.unclaimedRewards.map((reward) => {
          return {
            amount: reward?.amount,
            asset: reward?.token,
            valueUSD: reward?.amountUSD,
          };
        })!,
      });
      (async () => {
        console.log("beforeuepos", position?.chain!, position?.protocol!);

        const a = await updateSubstratePositions({
          farm: {
            id: position?.id!,
            chef: position?.chef!,
            chain: position?.chain!,
            protocol: position?.protocol!,
            asset: {
              symbol: position?.lpSymbol!,
              address: position?.lpAddress!,
            },
          },
          positions,
          account,
        });
        console.log("npos", a?.name, a?.position);
        const tempPositions = { ...positions };
        tempPositions[a?.name!] = a?.position;
        setPositions((prevState: any) => ({
          ...prevState,
          ...tempPositions,
        }));
      })();
    }
  }, [isSuccess]);

  const InputStep = () => {
    return (
      <div className="w-full flex flex-col gap-y-8">
        {/* Tokens to receive */}
        <div className="text-[#344054] text-left">
          <p className="text-base font-medium leading-5">You receive:</p>
          <div className="inline-flex gap-x-4 mt-3">
            {position?.unclaimedRewards.map((reward, index) => (
              <div
                key={index}
                className="inline-flex items-center space-x-3 rounded-xl bg-[#F1F1F1] px-6 py-3"
              >
                <Image
                  src={`https://raw.githubusercontent.com/yield-bay/assets/main/list/${reward.token.toUpperCase()}.png`}
                  alt={reward.token + "_logo"}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="inline-flex text-lg font-medium leading-5 gap-x-2">
                  {reward.amount >= 0.01
                    ? parseFloat(reward.amount.toFixed(2)).toLocaleString(
                        "en-US"
                      )
                    : "<0.01"}{" "}
                  {reward.token}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Estimate Gas */}
        {/* <div
          className={clsx(
            "rounded-xl",
            // parseFloat(nativeBal?.formatted ?? "0") > GAS_FEES
            "bg-[#C0F9C9]"
            // : "bg-[#FFB7B7]"
          )}
        >
          <div
            className={clsx(
              "flex flex-col gap-y-3 rounded-xl px-6 py-3 bg-[#ECFFEF]",
              // parseFloat(nativeBal?.formatted ?? "0") > GAS_FEES
              "bg-[#ECFFEF]"
              // : "bg-[#FFE8E8]"
            )}
          >
            <div className="inline-flex justify-between text-[#4E4C4C] font-bold leading-5 text-base">
              <span>Estimated Gas Fees:</span>
              <p>
                <span className="opacity-40 mr-2 font-semibold">
                  {GAS_FEES} MGX
                </span>
                <span>$1234</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-y-2 items-center rounded-b-xl pt-[14px] pb-2 text-center">
            <h3 className="text-[#4E4C4C] text-base font-bold">
              {parseFloat(nativeBal?.formatted ?? "0") > GAS_FEES
                ? "Sufficient"
                : "Insufficient"}{" "}
              Wallet Balance
            </h3>
            {false ? (
              <span className="text-[#344054] opacity-50 text-sm font-medium leading-5">
                loading balance...
              </span>
            ) : (
              <span className="text-[#344054] opacity-50 text-sm font-medium leading-5">
                {"24"} {"MGX"}
              </span>
            )}
          </div>
        </div> */}
        <MButton
          type="primary"
          className="mt-4"
          isLoading={false}
          text="Claim Rewards"
          onClick={() => {
            setIsProcessStep(true);
            handleClaimRewards();
          }}
        />
      </div>
    );
  };

  const ProcessStep = () => {
    return (
      <div className="flex flex-col items-center gap-y-8 text-left font-semibold leading-5">
        {isSuccess ? (
          <>
            <Image
              src="/icons/ArrowCircleUp.svg"
              alt="Transaciton Submitted"
              width={32}
              height={32}
              className="select-none"
            />
            <h1 className="text-[#1D2939] text-xl leading-5 font-semibold">
              Transaction Submitted
            </h1>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <div className="inline-flex gap-x-8 text-base font-semibold leading-5">
              <Link
                href={`${MANGATA_EXPLORER_URL}/${txnHash}`}
                className="text-[#9999FF] underline underline-offset-4"
                target="_blank"
                rel="noreferrer"
              >
                View on Explorer
              </Link>
              <button
                className="text-[#A3A3A3]"
                onClick={() => setIsOpen(false)}
              >
                Go Back
              </button>
            </div>
          </>
        ) : isInProcess || isSigning ? (
          <>
            <h3 className="text-base">Waiting For Confirmation</h3>
            <p className="inline-flex items-center text-xl">
              Claiming{" "}
              {position?.unclaimedRewards.map((reward, index) => (
                <span className="mr-1" key={index}>
                  {toUnits(reward.amount, 2)} {reward.token}
                  {index == position?.unclaimedRewards.length - 1 ? "" : " and"}
                </span>
              ))}
            </p>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <p className="text-base leading-5 font-semibold text-[##AAABAD]">
              {!isSigning && isInProcess
                ? "Waiting for Transaction to Complete"
                : isSigning
                ? "Confirm Transaction in your Wallet"
                : ""}
            </p>
            <Spinner />
          </>
        ) : (
          <>
            <h3 className="text-base">Something is Wrong</h3>
            <h2 className="text-xl">Transaction Failed!</h2>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <p className="text-base text-[#AAABAD]">Redirecting in 3s</p>
          </>
        )}
      </div>
    );
  };

  return !!position ? (
    <LiquidityModalWrapper
      open={isOpen || isOpenModalCondition}
      setOpen={isOpenModalCondition ? () => {} : setIsOpen}
      title="Claim Rewards"
    >
      <div>{isProcessStep ? <ProcessStep /> : <InputStep />}</div>
    </LiquidityModalWrapper>
  ) : (
    <></>
  );
};

export default ClaimSectionDot;
