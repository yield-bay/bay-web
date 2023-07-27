import { FC, useEffect, useMemo, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import {
  accountInitAtom,
  isInitialisedAtom,
  lpUpdatedAtom,
  mangataAddressAtom,
  mangataHelperAtom,
  mangataPoolsAtom,
  removeLiqModalOpenAtom,
  slippageModalOpenAtom,
  subPosLoadingAtom,
} from "@store/commonAtoms";
import { formatTokenSymbols } from "@utils/farmListMethods";
import MButton from "../MButton";
import {
  farmsAtom,
  lpTokenPricesAtom,
  positionsAtom,
  selectedFarmAtom,
  slippageAtom,
  tokenPricesAtom,
} from "@store/atoms";
import { FarmType, MangataPool } from "@utils/types/common";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import Image from "next/image";
import Spinner from "../Spinner";
import { CogIcon } from "@heroicons/react/solid";
import { useToast } from "@chakra-ui/react";
import ToastWrapper from "../ToastWrapper";
import { dotAccountAtom } from "@store/accountAtoms";
import _ from "lodash";
import { delay, getDecimalBN } from "@utils/xcm/common/utils";
import { BN } from "bn.js";
import toUnits from "@utils/toUnits";
import Link from "next/link";
import { MANGATA_EXPLORER_URL } from "@utils/constants";
import { fetchSubstratePositions } from "@utils/position-utils/substratePositions";
import { handleRemoveLiquidityEvent } from "@utils/tracking";
import getTimestamp from "@utils/getTimestamp";
import { fixedAmtNum } from "@utils/abis/contract-helper-methods";

interface ChosenMethodProps {
  farm: FarmType;
  percentage: string;
  setPercentage: (value: string) => void;
  handlePercChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  lpBal: string;
  lpBalLoading: boolean;
  lpTokens: string;
  setLpTokens: (value: string) => void;
  handleLpTokensChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  methodId: number;
}

const RemoveSectionMangata = () => {
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useAtom(
    slippageModalOpenAtom
  );
  const [isLoading, setIsLoading] = useState(true);
  const [lpBalance, setLpBalance] = useState<any | null>(null);
  const [lpBalanceNum, setLpBalanceNum] = useState<number>(0);
  const [SLIPPAGE] = useAtom(slippageAtom);
  const [isOpen, setIsOpen] = useAtom(removeLiqModalOpenAtom);
  const [farm, setFarm] = useAtom(selectedFarmAtom);

  const [account] = useAtom(dotAccountAtom);
  const [mangataHelper] = useAtom(mangataHelperAtom);
  const [account1] = useAtom(accountInitAtom);
  const [pools] = useAtom(mangataPoolsAtom);
  const [pool, setPool] = useState<MangataPool>();
  const [mangataAddress] = useAtom(mangataAddressAtom);
  const [isInitialised] = useAtom(isInitialisedAtom);
  const [mgxBalance, setMgxBalance] = useState<number>(0);
  const [txnHash, setTxnHash] = useState<string>("");

  const [farms] = useAtom(farmsAtom);
  const [positions, setPositions] = useAtom(positionsAtom);
  const [lpTokenPricesMap, setLpTokenPricesMap] = useAtom(lpTokenPricesAtom);
  const [tokenPricesMap] = useAtom(tokenPricesAtom);
  const [, setIsSubPosLoading] = useAtom(subPosLoadingAtom);

  const [lpUpdated, setLpUpdated] = useAtom(lpUpdatedAtom);

  const toast = useToast();

  useEffect(() => console.log("farm @removeliq", farm), [farm]);

  const [percentage, setPercentage] = useState("");
  const [lpTokens, setLpTokens] = useState("");
  const [methodId, setMethodId] = useState<number>(0);

  const [token0, token1] = formatTokenSymbols(farm?.asset.symbol ?? "");

  // Process states
  const [isInProcess, setIsInProcess] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Transaction Process Steps
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isProcessStep, setIsProcessStep] = useState(false);

  useEffect(() => {
    // Resetting all states to default on open/close
    setIsInProcess(false);
    setIsSigning(false);
    setIsSuccess(false);
  }, [isOpen]);

  const initialiseHelperSetup = async () => {
    if (pools == null) return;
    const [token0, token1] = formatTokenSymbols(farm?.asset.symbol!);
    const poolName = `${token0}-${token1}`;
    console.log("selected poolname", poolName);

    // Make a state for this
    const pool = _.find(pools, {
      firstTokenId: mangataHelper.getTokenIdBySymbol(token0),
      secondTokenId: mangataHelper.getTokenIdBySymbol(token1),
    });
    console.log(`Found a pool of ${poolName}`, pool);
    setPool(pool);

    if (_.isUndefined(pool)) {
      toast({
        position: "top",
        duration: 3000,
        render: () => (
          <ToastWrapper
            title={`Couldn’t find a liquidity pool for ${poolName} ...`}
            status="error"
          />
        ),
      });
      setIsOpen(false);
      setFarm(null);
      throw new Error(`Couldn’t find a liquidity pool for ${poolName} ...`);
    }

    // Calculate rewards amount in pool
    const { liquidityTokenId } = pool;

    console.log(
      `Checking how much reward available in ${poolName} pool, tokenId: ${liquidityTokenId} ...`
    );

    // Issue: current we couldn’t read this rewards value correct by always getting 0 on the claimable rewards.
    // The result is different from that in src/mangata.js
    const rewardAmount = await mangataHelper.calculateRewardsAmount(
      mangataAddress,
      liquidityTokenId
    );
    console.log(`Claimable reward in ${poolName}: `, rewardAmount);

    const liquidityBalance = await mangataHelper.mangata?.getTokenBalance(
      liquidityTokenId,
      mangataAddress
    );
    const poolNameDecimalBN = getDecimalBN(
      mangataHelper.getDecimalsBySymbol(poolName)
    );
    console.log(
      "liquidity balance",
      liquidityBalance?.reserved,
      "poolName DecimalBN",
      poolNameDecimalBN,
      "decimal",
      mangataHelper.getDecimalsBySymbol(poolName)
    );

    const numReserved = new BN(liquidityBalance.reserved).div(
      poolNameDecimalBN
    );

    console.log("num reserved", numReserved);

    // setting selected pool's LP token balance
    const lpBalanceh = await mangataHelper.mangata.getTokenBalance(
      pool.liquidityTokenId,
      account?.address
    );
    const decimal = mangataHelper.getDecimalsBySymbol(`${token0}-${token1}`);
    // const lpBalanceNum =
    //   parseFloat(BigInt(lpBalanceh.reserved).toString(10)) / 10 ** decimal +
    //   parseFloat(BigInt(lpBalanceh.free).toString(10)) / 10 ** decimal;
    const lpBalanceNum =
      parseFloat(BigInt(lpBalanceh.reserved).toString(10)) / 10 ** decimal;
    console.log("LP Balance lpBalanceNum: ", lpBalanceNum, lpBalanceh);
    setLpBalanceNum(lpBalanceNum);
    setLpBalance(lpBalanceh);
    // Required setup finished
    setIsLoading(false);
  };

  useEffect(() => {
    if (isInitialised && farm != null) {
      initialiseHelperSetup();
    }
  }, [farm, isInitialised]);

  // Fetching MGX balance
  useEffect(() => {
    (async () => {
      if (mangataHelper == null) return;
      try {
        const bal = await mangataHelper.mangata?.getTokenBalance(
          0,
          account1?.address
        );
        const balFree = parseFloat(BigInt(bal.free).toString(10)) / 10 ** 18; // MGX decimals == 18
        console.log("fetched mgxbalance", balFree);
        setMgxBalance(balFree);
      } catch (error) {
        console.log("error fetching mgx balance", error);
      }
    })();
  }, [account1]);

  // When InputType.Percentage
  const handlePercChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = parseFloat(event.target.value);
    if ((value >= 0 && value <= 100) || event.target.value == "") {
      setPercentage(event.target.value);
    } else {
      alert("Percentage must be between 0 & 100!");
    }
  };

  // When InputType.Token
  const handleLpTokensChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    const value = event.target.value;
    if (parseFloat(value) >= 0 || value == "") {
      setLpTokens(event.target.value);
    } else {
      alert("LP Amount can't be negative!");
      toast({
        position: "top",
        duration: 3000,
        render: () => (
          <ToastWrapper title="LP tokens can not be negative!" status="error" />
        ),
      });
    }
  };

  const fees = 0.0014; // In STELLA

  const removeAmount = useMemo(() => {
    return methodId == 0
      ? (lpBalanceNum *
          (parseFloat("0") * parseFloat(percentage == "" ? "0" : percentage))) /
          100
      : parseFloat(lpTokens == "" ? "0" : lpTokens);
  }, [methodId, percentage, lpTokens]);

  const handleRemoveLiquidity = async () => {
    setIsInProcess(true);

    let perc = percentage;
    if (percentage == "") {
      console.log("per is empty so using 100%");
      perc = "100";
    }

    try {
      const signer = account?.wallet?.signer;
      setIsSigning(true);
      console.log("hrllpBalance", lpBalance);

      const lpBalReserved =
        parseFloat(BigInt(lpBalance.reserved).toString(10)) / 10 ** 18;
      const lpBalFree =
        parseFloat(BigInt(lpBalance.free).toString(10)) / 10 ** 18;

      console.log(
        "amamamam",
        lpTokens,
        "lpBalance.reserved",
        lpBalance.reserved,
        lpBalReserved,
        "percentage",
        perc,
        "heroo"
      );

      let txns = [];
      console.log(
        "res",
        lpBalReserved,
        "free",
        lpBalFree,
        "free+res",
        lpBalReserved + lpBalFree
      );
      if (BigInt(lpBalance.reserved) == BigInt(0)) {
        console.log("resbal is zero");
      } else {
        let deactx;

        if (methodId == 0) {
          deactx = await mangataHelper.deactivateLiquidityV2(
            pool?.liquidityTokenId,
            (BigInt(lpBalance.reserved) * BigInt(parseInt(perc, 10))) /
              BigInt(100)
          );
        } else if (methodId == 1) {
          deactx = await mangataHelper.deactivateLiquidityV2(
            pool?.liquidityTokenId,
            BigInt(parseInt((parseFloat(lpTokens) * 10 ** 18).toString(), 10))
          );
        }

        txns.push(deactx);
      }

      console.log("blstuff", lpBalance, "percentage", perc);
      if (
        (BigInt(lpBalance.free) * BigInt(parseInt(perc, 10))) / BigInt(100) +
          (BigInt(lpBalance.reserved) * BigInt(parseInt(perc, 10))) /
            BigInt(100) ==
        BigInt(0)
      ) {
        console.log("totalburnbal is zero");
      } else {
        let bltx;
        console.log("mehod", methodId, perc, lpTokens, lpBalance);

        if (methodId == 0) {
          bltx = await mangataHelper.burnLiquidityTx(
            pool?.firstTokenId,
            pool?.secondTokenId,
            (BigInt(lpBalance.reserved) * BigInt(parseInt(perc, 10))) /
              BigInt(100),
            parseInt(perc, 10)
          );
        } else if (methodId == 1) {
          bltx = await mangataHelper.burnLiquidityTx(
            pool?.firstTokenId,
            pool?.secondTokenId,
            BigInt(parseInt((parseFloat(lpTokens) * 10 ** 18).toString(), 10)),
            parseInt(perc, 10) // Not used in burnLiquidityTx
          );
        }
        txns.push(bltx);
      }

      const removeLiqBatchTx = mangataHelper.api.tx.utility.batchAll(txns);

      await removeLiqBatchTx
        .signAndSend(
          account1?.address,
          { signer: signer },
          async ({ status }: any) => {
            if (status.isInBlock) {
              console.log("Burn Liquidity in block now!");
              // unsub();
              // resolve();
            } else if (status.isFinalized) {
              (async () => {
                const tranHash = status.asFinalized.toString();
                console.log(
                  `Batch Tx finalized with hash ${tranHash}\n\nbefore delay\n`
                );
                setTxnHash(tranHash);
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
                    `Liquidity Successfully removed from ${token0}-${token1} with hash ${status.asFinalized.toHex()}`
                  );
                  toast({
                    position: "top",
                    duration: 3000,
                    render: () => (
                      <ToastWrapper
                        title={`Liquidity successfully removed from ${token0}-${token1} pool.`}
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
                  // createLiquidityEventHandler(
                  //   turingAddress as string,
                  //   IS_PRODUCTION ? "KUSAMA" : "ROCOCO",
                  //   { symbol: token0, amount: firstTokenNumber },
                  //   { symbol: token1, amount: secondTokenNumber },
                  //   {
                  //     symbol: `${token0}-${token1}`,
                  //     amount:
                  //       method == 0
                  //         ? ((lpBalanceNum as number) *
                  //             parseFloat(percentage)) /
                  //           100
                  //         : parseFloat(lpAmount),
                  //   }, // Amount of Liquidity burnt
                  //   getTimestamp(),
                  //   0.0,
                  //   "REMOVE_LIQUIDITY"
                  // );
                }
              })();
            } else {
              // setIsSigning(false);
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
    } catch (error) {
      let errorString = `${error}`;
      console.log("error while handling remove liquidity:", errorString);
      toast({
        position: "top",
        duration: 3000,
        render: () => <ToastWrapper title={errorString} status="error" />,
      });
      setIsInProcess(false);
      setIsSigning(false);
    }
  };

  const InputStep = () => {
    return (
      <div className="w-full flex mt-8 flex-col gap-y-8">
        <div className="flex flex-col gap-y-3">
          <ChosenMethod
            farm={farm!}
            percentage={percentage.toString()}
            setPercentage={setPercentage}
            handlePercChange={handlePercChange}
            lpBal={lpBalanceNum.toString()}
            lpBalLoading={lpBalance == 0}
            lpTokens={lpTokens.toString()}
            setLpTokens={setLpTokens}
            handleLpTokensChange={handleLpTokensChange}
            methodId={methodId}
          />
          <div className="inline-flex gap-2 items-center justify-start">
            {["Percentage", "LP Tokens"].map((method, index) => (
              <button
                key={index}
                className={clsx(
                  "text-sm font-bold leading-5",
                  methodId !== index && "opacity-40"
                )}
                onClick={() => setMethodId(index)}
              >
                {method}
              </button>
            ))}
          </div>
        </div>
        {/* Tokens to receive */}
        <div className="text-[#344054] text-left">
          <p className="text-base font-medium leading-5">You receive:</p>
          <div className="inline-flex gap-x-4 mt-3">
            {[token0, token1].map((token, index) => (
              <div
                key={index}
                className="inline-flex items-center space-x-3 rounded-xl bg-[#F1F1F1] px-6 py-3"
              >
                <Image
                  src={farm?.asset.logos[index]!}
                  alt={token}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="inline-flex text-lg font-medium leading-5 gap-x-2">
                  {toUnits(0, 2)} {token}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Estimate Gas and Slippage Tolerance */}
        {/* Gas Fees // Slippage // Suff. Wallet balance */}
        <div
          className={clsx(
            "rounded-xl",
            // parseFloat(nativeBal?.formatted ?? "0") > fees
            "bg-[#C0F9C9]"
            // : "bg-[#FFB7B7]"
          )}
        >
          <div
            className={clsx(
              "flex flex-col gap-y-3 rounded-xl px-6 py-3 bg-[#ECFFEF]",
              // parseFloat(nativeBal?.formatted ?? "0") > fees
              "bg-[#ECFFEF]"
              // : "bg-[#FFE8E8]"
            )}
          >
            {/* <div className="inline-flex justify-between text-[#4E4C4C] font-bold leading-5 text-base">
              <span>Estimated Gas Fees:</span>
              <p>
                <span className="opacity-40 mr-2 font-semibold">
                  {fees} STELLA
                </span>
                <span>$1234</span>
              </p>
            </div> */}
            <div className="inline-flex items-center font-medium text-[14px] leading-5 text-[#344054]">
              <span>Slippage Tolerance: {SLIPPAGE}%</span>
              <button
                onClick={() => {
                  setIsSlippageModalOpen(true);
                  setIsOpen(false);
                }}
              >
                <CogIcon className="w-4 h-4 text-[#344054] ml-2 transform origin-center hover:rotate-[30deg] transition-all duration-200" />
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-y-2 items-center rounded-b-xl pt-[14px] pb-2 text-center">
            <h3 className="text-[#4E4C4C] text-base font-bold">
              {/* {parseFloat(nativeBal?.formatted ?? "0") > fees */}
              Sufficient
              {/* : "Insufficient"}{" "} */}
              Wallet Balance
            </h3>
            <span className="text-[#344054] opacity-50 text-sm font-medium leading-5">
              {mgxBalance.toLocaleString("en-US")} MGX
            </span>
          </div>
        </div>
        <div className="flex flex-row mt-6 gap-2">
          <MButton
            type="primary"
            isLoading={false}
            disabled={
              methodId == 0
                ? percentage == "" || percentage == "0"
                : lpTokens == "" || lpTokens == "0"
              // parseFloat(nativeBal?.formatted ?? "0") <= fees
            }
            text="Confirm Removing Liquidity"
            onClick={() => {
              setIsConfirmStep(true);
            }}
          />
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (isSuccess) {
      console.log("liquidity removed successfully");
      setLpUpdated(lpUpdated + 1);

      handleRemoveLiquidityEvent({
        userAddress: account?.address!,
        walletType: "DOT",
        walletProvider: account?.wallet?.extensionName!,
        timestamp: getTimestamp(),
        farm: {
          id: farm?.id!,
          chef: farm?.chef!,
          chain: farm?.chain!,
          protocol: farm?.protocol!,
          assetSymbol: farm?.asset.symbol!,
        },
        underlyingAmounts: [token0, token1].map((token) => {
          return {
            amount: 0,
            asset: token,
            valueUSD:
              tokenPricesMap[
                `${farm?.chain!}-${farm?.protocol!}-${token}-${"NA"}`
              ],
          };
        })!,
        lpAmount: {
          amount:
            methodId == 0
              ? (lpBalanceNum * fixedAmtNum(percentage)) / 100
              : fixedAmtNum(lpTokens),
          asset: farm?.asset.symbol!,
          valueUSD:
            lpTokenPricesMap[
              `${farm?.chain}-${farm?.protocol}-${farm?.asset.symbol}-${farm?.asset.address}`
            ],
        },
      });

      // fetchEvmPositions({
      //   farms,
      //   positions,
      //   setPositions,
      //   setIsEvmPosLoading,
      //   address,
      //   tokenPricesMap,
      //   lpTokenPricesMap,
      // });
    }
  }, [isSuccess]);

  const ConfirmStep = () => {
    return (
      <div className="flex flex-col gap-y-8 text-left">
        <button
          className="max-w-fit hover:translate-x-2 active:-translate-x-0 transition-all duration-200 ease-in-out"
          onClick={() => setIsConfirmStep(false)}
        >
          <Image
            src="/icons/ArrowLeft.svg"
            alt="Go back"
            height={24}
            width={24}
          />
        </button>
        <h3 className="font-semibold text-base leading-5 text-[#1d2838]">
          You will receive
        </h3>
        <div className="p-6 border border-[#BEBEBE] rounded-lg">
          <div className="inline-flex gap-x-4">
            {[token0, token1].map((token, index) => (
              <div
                key={index}
                className="inline-flex items-center space-x-3 rounded-xl bg-[#F1F1F1] px-6 py-[14px]"
              >
                <Image
                  src={farm?.asset.logos[index]!}
                  alt={token}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span className="inline-flex text-lg font-medium leading-5 gap-x-2">
                  {toUnits(0, 2)} {token}
                </span>
              </div>
            ))}
          </div>
        </div>
        <MButton
          type="primary"
          isLoading={false}
          text="Confirm Withdrawal"
          onClick={async () => {
            await handleRemoveLiquidity();
            setIsProcessStep(true);
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
            <h2 className="text-xl">
              Withdrawing {removeAmount} {token0}/{token1} LP Tokens
            </h2>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <p className="text-base leading-5 font-semibold text-[##AAABAD]">
              {isInProcess && !isSigning
                ? "Waiting for Completion"
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

  const isOpenModalCondition = isSlippageModalOpen;

  return (
    !!farm && (
      <LiquidityModalWrapper
        open={isOpen || isOpenModalCondition}
        setOpen={isOpenModalCondition ? () => {} : setIsOpen}
        title="Remove Liquidity"
      >
        {isLoading ? (
          <div className="w-full h-full flex flex-col gap-y-10 items-center justify-center">
            <span>Preparing Pool for you...</span>
            <Spinner />
          </div>
        ) : isProcessStep ? (
          <ProcessStep />
        ) : isConfirmStep ? (
          <ConfirmStep />
        ) : (
          <InputStep />
        )}
      </LiquidityModalWrapper>
    )
  );
};

// ChosenMethod returns the type of input field
const ChosenMethod: FC<ChosenMethodProps> = ({
  farm,
  percentage,
  setPercentage,
  handlePercChange,
  lpBal,
  lpBalLoading,
  lpTokens,
  setLpTokens,
  handleLpTokensChange,
  methodId,
}) => {
  return methodId === 0 ? (
    <div className="relative flex flex-row justify-between px-6 py-[14px] border border-[#D0D5DD] rounded-lg">
      <div className="absolute text-[#344054 text-base font-medium leading-5 left-0 -top-9 flex flex-row gap-x-[6px] items-center">
        <span>Enter</span>
        <div className="inline-flex items-center justify-center -space-x-2">
          {farm?.asset.logos.map((logo, index) => (
            <div key={index} className="flex z-0 overflow-hidden rounded-full">
              <Image src={logo} alt={logo} width={24} height={24} />
            </div>
          ))}
        </div>
        <span className="font-bold">{farm?.asset?.symbol}</span>{" "}
        <span>percentage of tokens to Remove</span>
      </div>
      <input
        placeholder="0"
        className={clsx(
          "text-base text-[#4E4C4C] font-bold leading-6 text-left bg-transparent focus:outline-none"
        )}
        onChange={handlePercChange}
        value={percentage}
        autoFocus
      />
      <div className="inline-flex items-center gap-x-2">
        <p className="flex flex-col items-end text-[#667085] text-sm font-bold leading-5 opacity-50">
          {lpBalLoading ? (
            <span>loading...</span>
          ) : (
            !!lpBal && (
              <div className="flex flex-col items-end">
                <span>Balance</span>
                <span>
                  {parseFloat(lpBal).toLocaleString("en-US")}{" "}
                  {farm?.asset.symbol}
                </span>
              </div>
            )
          )}
        </p>
        <button
          className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5"
          onClick={() => {
            setPercentage("100");
          }}
        >
          MAX
        </button>
      </div>
    </div>
  ) : (
    <div className="relative flex flex-row justify-between px-6 py-[14px] border border-[#D0D5DD] rounded-lg">
      <div className="absolute text-[#344054 text-base font-medium leading-5 left-0 -top-9 flex flex-row gap-x-[6px] items-center">
        <span>Enter</span>
        <div className="inline-flex items-center justify-center -space-x-2">
          {farm?.asset.logos.map((logo, index) => (
            <div key={index} className="flex z-0 overflow-hidden rounded-full">
              <Image src={logo} alt={logo} width={24} height={24} />
            </div>
          ))}
        </div>
        <span className="font-bold">{farm?.asset?.symbol}</span>{" "}
        <span>Tokens to Remove</span>
      </div>
      <input
        placeholder="0"
        className={clsx(
          "text-base text-[#4E4C4C] font-bold leading-6 text-left bg-transparent focus:outline-none"
        )}
        onChange={handleLpTokensChange}
        value={lpTokens}
        autoFocus
      />
      <div className="inline-flex items-center gap-x-2">
        <p className="flex flex-col items-end text-[#667085] text-sm font-bold leading-5 opacity-50">
          {lpBalLoading ? (
            <span>loading...</span>
          ) : (
            !!lpBal && (
              <div className="flex flex-col items-end">
                <span>Balance</span>
                <span>
                  {parseFloat(lpBal).toLocaleString("en-US")}{" "}
                  {farm?.asset.symbol}
                </span>
              </div>
            )
          )}
        </p>
        <button
          className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5"
          onClick={() => {
            setLpTokens(lpBal!);
          }}
        >
          MAX
        </button>
      </div>
    </div>
  );
};

export default RemoveSectionMangata;
