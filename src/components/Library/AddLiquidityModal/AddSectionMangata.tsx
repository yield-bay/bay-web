// Library Imports
import { FC, useRef, PropsWithChildren, useEffect, useState } from "react";
import { useAtom } from "jotai";
import clsx from "clsx";
import Image from "next/image";
import _ from "lodash";

// Component, Util and Hook Imports
import MButton from "@components/Library/MButton";
import Spinner from "@components/Library/Spinner";
import {
  accountInitAtom,
  addLiqModalOpenAtom,
  evmPosLoadingAtom,
  isInitialisedAtom,
  lpUpdatedAtom,
  mangataAddressAtom,
  mangataHelperAtom,
  mangataPoolsAtom,
  slippageModalOpenAtom,
  subPosLoadingAtom,
} from "@store/commonAtoms";
import LiquidityModalWrapper from "../LiquidityModalWrapper";
import { CogIcon } from "@heroicons/react/solid";
import {
  farmsAtom,
  lpTokenPricesAtom,
  positionsAtom,
  selectedFarmAtom,
  slippageAtom,
  tokenPricesAtom,
} from "@store/atoms";
import { formatTokenSymbols } from "@utils/farmListMethods";
import { delay, getDecimalBN } from "@utils/xcm/common/utils";
import BN from "bn.js";
import { dotAccountAtom } from "@store/accountAtoms";
import { fixedAmtNum } from "@utils/abis/contract-helper-methods";
import toUnits from "@utils/toUnits";
import ToastWrapper from "../ToastWrapper";
import { useToast } from "@chakra-ui/react";
import { MangataPool } from "@utils/types/common";
import Link from "next/link";
import { MANGATA_EXPLORER_URL } from "@utils/constants";
import { fetchSubstratePositions } from "@utils/position-utils/substratePositions";
import { handleAddLiquidityEvent } from "@utils/tracking";
import getTimestamp from "@utils/getTimestamp";
import { fetchTokenPricesMangata } from "@utils/fetch-prices";

enum InputType {
  Off = -1,
  First = 0,
  Second = 1,
}

const AddSectionMangata: FC<PropsWithChildren> = () => {
  const [isOpen, setIsOpen] = useAtom(addLiqModalOpenAtom);
  const [isLoading, setIsLoading] = useState(true);
  // const [lpBalance, setLpBalance] = useState<any | null>(null);
  const [lpBalance, setLpBalance] = useState<number>(0);
  const [fees, setFees] = useState<number>(0);

  const [lpUpdated, setLpUpdated] = useAtom(lpUpdatedAtom);

  const toast = useToast();

  const [selectedFarm, setSelectedFarm] = useAtom(selectedFarmAtom);
  const [isSlippageModalOpen, setIsSlippageModalOpen] = useAtom(
    slippageModalOpenAtom
  );
  const [account] = useAtom(dotAccountAtom);
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

  const [SLIPPAGE] = useAtom(slippageAtom);

  // Input focus states
  const [focusedInput, setFocusedInput] = useState<InputType>(InputType.First);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const secondInputRef = useRef<HTMLInputElement>(null);

  const [txnHash, setTxnHash] = useState<string>("");
  const [mgxPrice, setMgxPrice] = useState(0);

  useEffect(() => {
    (async () => {
      const mgxp = (await fetchTokenPricesMangata()).get("mgx")!;
      console.log("mgxp", mgxp);
      setMgxPrice(mgxp);
    })();
  }, []);

  const [token0, token1] = formatTokenSymbols(selectedFarm?.asset.symbol!);

  // Process states
  const [isInProcess, setIsInProcess] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Transaction Process Steps
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [isProcessStep, setIsProcessStep] = useState(false);

  // Amount States
  const [firstTokenAmount, setFirstTokenAmount] = useState("");
  const [secondTokenAmount, setSecondTokenAmount] = useState("");

  const [firstTokenBalance, setFirstTokenBalance] = useState<number | null>(
    null
  );
  const [secondTokenBalance, setSecondTokenBalance] = useState<number | null>(
    null
  );
  const [lpTotalBalance, setLpTotalBalance] = useState<number>(0);
  const [estimateLpMinted, setEstimateLpMinted] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    // Resetting all states to default on open/close
    setIsInProcess(false);
    setIsSigning(false);
    setIsSuccess(false);
  }, [isOpen]);

  useEffect(() => {
    if (firstInputRef.current && secondInputRef.current) {
      if (focusedInput == InputType.First) {
        firstInputRef.current.focus();
      } else if (focusedInput == InputType.Second) {
        secondInputRef.current.focus();
      }
    }
  }, []);

  useEffect(() => {
    // Empty the values when Modal is opened or closed
    setFirstTokenAmount("");
    setSecondTokenAmount("");
  }, [isOpen]);

  useEffect(() => {
    // Fetching & setting Total balance of the LP Token
    if (pool == null) return;
    (async () => {
      let assetsInfo = await mangataHelper?.mangata?.getAssetsInfo();
      const balances = await mangataHelper?.getBalances();
      for (const key in balances) {
        if (Object.hasOwnProperty.call(balances, key)) {
          const element = balances[key];
          if (assetsInfo![key] !== undefined) {
            const e =
              Number(BigInt(element).toString(10)) /
              10 ** assetsInfo[key]["decimals"];
            if (pool.liquidityTokenId == key) {
              console.log("--> bal:", e, "\n----------");
              console.log("match id");
              setLpTotalBalance(e);
            }
          }
        }
      }
    })();
  }, [pool]);

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

  const initialiseHelperSetup = async () => {
    if (pools == null) return;
    const [token0, token1] = formatTokenSymbols(selectedFarm?.asset.symbol!);
    const poolName = `${token0}-${token1}`;
    console.log("selected poolname", poolName);
    // console.log("balance in componding tab", allLpBalances[poolName]);

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
      setSelectedFarm(null);
      throw new Error(`Couldn’t find a liquidity pool for ${poolName} ...`);
    }

    // Calculate rwards amount in pool
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

    console.log(
      `Before auto-compound, ${
        account?.name
      } reserved "${poolName}": ${numReserved.toString()} ... lb ${liquidityBalance.reserved.toString()}`
    );

    console.log("num reserved", numReserved);

    // setting selected pool's LP token balance
    const lpBalance = await mangataHelper.mangata.getTokenBalance(
      pool.liquidityTokenId,
      account?.address
    );
    const decimal = mangataHelper.getDecimalsBySymbol(`${token0}-${token1}`);
    // const lpBalanceNum =
    //   parseFloat(BigInt(lpBalance.reserved).toString(10)) / 10 ** decimal +
    //   parseFloat(BigInt(lpBalance.free).toString(10)) / 10 ** decimal;
    const lpBalanceNum =
      parseFloat(BigInt(lpBalance.reserved).toString(10)) / 10 ** decimal;
    console.log("LP Balance lpBalanceNum: ", lpBalanceNum);
    setLpBalance(lpBalanceNum);

    // Required setup finished
    setIsLoading(false);
  };

  useEffect(() => {
    if (isInitialised && selectedFarm !== null) {
      initialiseHelperSetup();
    }
  }, [selectedFarm, isInitialised]);

  // Fetch Balances of both tokens on Mangata Chain
  useEffect(() => {
    (async () => {
      if (account1 && pool) {
        const [token0, token1] = formatTokenSymbols(
          selectedFarm?.asset.symbol!
        );
        const token0Bal = await mangataHelper.mangata?.getTokenBalance(
          pool.firstTokenId,
          account1.address
        );
        const token1Bal = await mangataHelper.mangata?.getTokenBalance(
          pool.secondTokenId,
          account1.address
        );

        const token0Decimal = mangataHelper.getDecimalsBySymbol(token0);
        const token1Decimal = mangataHelper.getDecimalsBySymbol(token1);

        const token0BalanceFree =
          parseFloat(BigInt(token0Bal.free).toString(10)) / 10 ** token0Decimal;
        const token1BalanceFree =
          parseFloat(BigInt(token1Bal.free).toString(10)) / 10 ** token1Decimal;

        setFirstTokenBalance(token0BalanceFree);
        setSecondTokenBalance(token1BalanceFree);
      } else {
        toast({
          position: "top",
          duration: 3000,
          render: () => (
            <ToastWrapper title="Please connect wallet!" status="error" />
          ),
        });
        console.log("Account1 is empty");
      }
    })();
  }, [account1, pool]);

  const getFirstTokenRelation = (): number => {
    const poolRatio =
      Number(pool?.firstTokenAmountFloat) /
      Number(pool?.secondTokenAmountFloat);
    const expFirstTokenAmount = poolRatio;
    const firstTokenAmount = isNaN(expFirstTokenAmount)
      ? 0
      : expFirstTokenAmount;
    return firstTokenAmount;
  };

  const getSecondTokenRelation = (): number => {
    const poolRatio =
      Number(pool?.firstTokenAmountFloat) /
      Number(pool?.secondTokenAmountFloat);
    const expSecondTokenAmount = 1 / poolRatio;
    const secondTokenAmount = isNaN(expSecondTokenAmount)
      ? 0
      : expSecondTokenAmount;
    return secondTokenAmount;
  };

  // Estimate of fees; no need to be accurate
  // Method to fetch trnx fees based on token Amounts
  const handleFees = async (firstTokenAmt: number, secondTokenAmt: string) => {
    console.log("Calculating fees...");
    console.log("first token in feemint: ", firstTokenAmt);
    console.log("second token in feemint: ", secondTokenAmt);
    try {
      // Estimate of fees; no need to be accurate
      const fees = await mangataHelper.getMintLiquidityFee({
        pair: account1?.address,
        firstTokenId: pool?.firstTokenId,
        firstTokenAmount: firstTokenAmt,
        secondTokenId: pool?.secondTokenId,
        expectedSecondTokenAmount: secondTokenAmt,
      });
      console.log("fees:", fees, parseFloat(fees));
      setFees(parseFloat(fees));
    } catch (error) {
      console.log("Error while fetching Fees", error);
    }
  };

  const updateFirstTokenAmount = (secondTokenAmount: number): string => {
    // Ratio of tokens in the pool
    const poolRatio =
      Number(pool?.firstTokenAmountFloat) /
      Number(pool?.secondTokenAmountFloat);
    console.log("poolRatio", poolRatio, secondTokenAmount);

    // Estimated LP to be minted
    const lpAmount =
      (secondTokenAmount * lpTotalBalance) /
      (parseFloat(pool?.secondTokenAmountFloat.toString()!) * (1 + SLIPPAGE));
    console.log("lpAmount via secondToken", lpAmount);
    setEstimateLpMinted(lpAmount);

    // Calculate first token amount
    const expFirstTokenAmount =
      (poolRatio * secondTokenAmount) / (1 + SLIPPAGE);
    console.log("First Token Amount:", expFirstTokenAmount);
    const firstTokenAmount = isNaN(expFirstTokenAmount)
      ? "0"
      : expFirstTokenAmount.toFixed(5);
    setFirstTokenAmount(firstTokenAmount);
    return firstTokenAmount;
  };

  // Method to update second token amount based on first token amount
  const updateSecondTokenAmount = (firstTokenAmount: number): string => {
    const poolRatio =
      Number(pool?.firstTokenAmountFloat) /
      Number(pool?.secondTokenAmountFloat);
    // Calculates estimate LP minted
    const lpAmount =
      (firstTokenAmount * lpTotalBalance) /
      parseFloat(pool?.firstTokenAmountFloat.toString()!);
    console.log("lpAmount via first token", lpAmount);
    setEstimateLpMinted(lpAmount);

    // Calculate second token amount
    const expSecondTokenAmount =
      (firstTokenAmount / poolRatio) * (1 + SLIPPAGE);
    console.log("Second Token Amount:", expSecondTokenAmount);
    const secondTokenAmount = isNaN(expSecondTokenAmount)
      ? "0"
      : expSecondTokenAmount.toFixed(5);

    setSecondTokenAmount(secondTokenAmount);
    return secondTokenAmount;
  };

  // update first token values
  const handleChangeFirstTokenAmount = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputAmount = e.target.value;
    const firstTokenAmount = fixedAmtNum(inputAmount);
    setFirstTokenAmount(inputAmount);

    const expSecondTokenAmount = updateSecondTokenAmount(firstTokenAmount);

    if (isNaN(parseFloat(inputAmount))) {
      setFees(0);
    }
    await handleFees(firstTokenAmount, expSecondTokenAmount);
  };

  // update token values
  const handleChangeSecondTokenAmount = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputAmount = e.target.value;
    const secondTokenAmount = fixedAmtNum(inputAmount);
    setSecondTokenAmount(inputAmount);

    const expFirstTokenAmount = updateFirstTokenAmount(secondTokenAmount);

    if (isNaN(parseFloat(inputAmount))) {
      setFees(0);
    }
    await handleFees(secondTokenAmount, expFirstTokenAmount);
  };

  // Method to handle max button for first token
  const handleMaxFirstToken = () => {
    if (token0 == "MGX") {
      if ((firstTokenBalance as number) < 20) {
        alert("Insufficient balance to pay gas fees!");
        toast({
          position: "top",
          duration: 3000,
          render: () => (
            <ToastWrapper
              title="Insufficient balance to pay gas fees!"
              status="warning"
            />
          ),
        });
      } else {
        setFirstTokenAmount(
          firstTokenBalance
            ? (firstTokenBalance - (fees ?? 0) - 20).toString()
            : ""
        );
      }
    } else {
      setFirstTokenAmount(
        !!firstTokenBalance ? firstTokenBalance.toString() : ""
      );
    }
    updateSecondTokenAmount(firstTokenBalance ?? 0);
  };

  // Method to handle max button for second token
  const handleMaxSecondToken = () => {
    // Checking if user has enough balance to pay gas fees
    if (
      token1 == "MGX"
      // (token1 == "MGR" || token1 == "MGX")
    ) {
      if ((secondTokenBalance as number) < 20) {
        alert("Insufficient balance to pay gas fees!");
        toast({
          position: "top",
          duration: 3000,
          render: () => (
            <ToastWrapper
              title="Insufficient balance to pay gas fees!"
              status="warning"
            />
          ),
        });
      } else {
        setSecondTokenAmount(
          secondTokenBalance
            ? (secondTokenBalance - (fees ?? 0) - 20).toString()
            : ""
        );
      }
    } else {
      setSecondTokenAmount(
        secondTokenBalance ? secondTokenBalance.toString() : ""
      );
    }
    updateFirstTokenAmount(secondTokenBalance ?? 0);
  };

  // Method to call to Add Liquidity confirmation
  const handleAddLiquidity = async () => {
    setIsInProcess(true);
    const signer = account?.wallet?.signer;

    console.log(
      "pool.firstTokenAmountFloat",
      pool?.firstTokenAmountFloat,
      "pool.secondTokenAmountFloat",
      pool?.secondTokenAmountFloat,
      "firstTokenAmount",
      firstTokenAmount,
      "expectedSecondTokenAmount",
      secondTokenAmount
    );

    try {
      setIsSigning(true);

      console.log(
        "liquidityTokenId",
        pool?.liquidityTokenId,
        "estimatedLpMinted",
        estimateLpMinted
      );

      // Method to Add Liquidity
      const mintLiquidityTxn = await mangataHelper.mintLiquidityTx(
        pool?.firstTokenId,
        pool?.secondTokenId,
        firstTokenAmount,
        secondTokenAmount
      );

      await mintLiquidityTxn
        .signAndSend(
          account1?.address,
          { signer: signer },
          ({ status }: any) => {
            if (status.isInBlock) {
              console.log(
                `Mint liquidity trxn is in Block with hash ${status.asInBlock.toHex()}`
              );
              // unsub();
            } else if (status.isFinalized) {
              (async () => {
                const tranHash = status.asFinalized.toString();
                setTxnHash(txnHash);
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
                  console.log("Mint liquidity trxn finalised.");
                  toast({
                    position: "top",
                    duration: 3000,
                    render: () => (
                      <ToastWrapper
                        title={`Liquidity successfully added in ${token0}-${token1} pool.`}
                        status="info"
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
                  // Calling the ADD_LIQUIDITY tracker in isFinalised status
                  // createLiquidityEventHandler(
                  //   turingAddress as string,
                  //   IS_PRODUCTION ? "KUSAMA" : "ROCOCO",
                  //   { symbol: token0, amount: config.firstTokenAmount },
                  //   { symbol: token1, amount: config.secondTokenAmount },
                  //   { symbol: `${token0}-${token1}`, amount: 0 },
                  //   getTimestamp(),
                  //   config.fees,
                  //   "ADD_LIQUIDITY"
                  // );
                }
              })();
            } else {
              console.log("Status:", status.type);
              // setIsSigning(false);
            }
          }
        )
        .catch((err: any) => {
          console.log("Error while minting liquidity: ", err);
          setIsInProcess(false);
          setIsSigning(false);
          setIsSuccess(false);
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
        });
    } catch (error) {
      let errorString = `${error}`;
      console.log("error while adding liquidity:", errorString);
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
      console.log("addliq txn success!");
      setLpUpdated(lpUpdated + 1);

      // Tracking
      handleAddLiquidityEvent({
        userAddress: account?.address!,
        walletType: "DOT",
        walletProvider: account?.wallet?.extensionName!,
        timestamp: getTimestamp(),
        farm: {
          id: selectedFarm?.id!,
          chef: selectedFarm?.chef!,
          chain: selectedFarm?.chain!,
          protocol: selectedFarm?.protocol!,
          assetSymbol: selectedFarm?.asset.symbol!,
        },
        underlyingAmounts: [
          {
            amount: fixedAmtNum(firstTokenAmount),
            asset: token0,
            valueUSD:
              tokenPricesMap[
                `${selectedFarm?.chain!}-${selectedFarm?.protocol!}-${token0}-${"token0Address"}`
              ],
          },
          {
            amount: fixedAmtNum(secondTokenAmount),
            asset: token1,
            valueUSD:
              tokenPricesMap[
                `${selectedFarm?.chain!}-${selectedFarm?.protocol!}-${token1}-${"token1Address"}`
              ],
          },
        ],
        lpAmount: {
          amount: estimateLpMinted ?? 0,
          asset: selectedFarm?.asset.symbol!,
          valueUSD:
            lpTokenPricesMap[
              `${selectedFarm?.chain}-${selectedFarm?.protocol}-${selectedFarm?.asset.symbol}-${selectedFarm?.asset.address}`
            ],
        },
      });
    }
  }, [isSuccess]);

  // conditions
  const token_0_not_enough =
    parseFloat(firstTokenAmount) > (firstTokenBalance ?? 0);
  const token_1_not_enought =
    parseFloat(secondTokenAmount) > (secondTokenBalance ?? 0);

  const InputStep = () => {
    return (
      <div className="w-full mt-9 flex flex-col gap-y-3">
        {/* First token Container */}
        <div className="relative flex flex-row justify-between px-6 py-[14px] border border-[#D0D5DD] rounded-lg">
          <div className="absolute left-0 -top-9 flex flex-row gap-x-[6px] items-center">
            <div className="z-10 flex overflow-hidden rounded-full">
              <Image
                src={selectedFarm?.asset.logos[0] as string}
                alt={selectedFarm?.asset.logos[0] as string}
                width={24}
                height={24}
              />
            </div>
            <span className="text-[#344054 text-[14px] font-medium leading-5">
              {token0}
            </span>
          </div>
          <input
            placeholder="0"
            className={clsx(
              "text-base text-[#4E4C4C] font-bold leading-6 text-left bg-transparent focus:outline-none"
            )}
            onChange={handleChangeFirstTokenAmount}
            value={firstTokenAmount}
            name="firstTokenAmount"
            id="firstTokenAmount"
            ref={firstInputRef}
            // onBlur={() => setFocusedInput(InputType.Off)}
            onFocus={() => setFocusedInput(InputType.First)}
            autoFocus={focusedInput === InputType.First}
          />
          <div className="inline-flex items-center gap-x-2">
            <div className="flex flex-col items-end text-sm leading-5 opacity-50">
              {firstTokenBalance == null ? (
                <span>loading...</span>
              ) : (
                <div className="flex flex-col items-end">
                  <span>Balance</span>
                  <span>
                    {firstTokenBalance.toLocaleString("en-US")} {token0}
                  </span>
                </div>
              )}
            </div>
            <button
              className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5"
              onClick={handleMaxFirstToken}
            >
              MAX
            </button>
          </div>
        </div>
        {/* Low Balance */}
        {token_0_not_enough && (
          <div className="text-[#FF9999] leading-6 font-semibold text-base text-left">
            {focusedInput == InputType.First
              ? "Insufficient Balance"
              : `You need ${
                  fixedAmtNum(firstTokenAmount) - (firstTokenBalance ?? 0)
                } ${token0} for creating an LP token with ${fixedAmtNum(
                  secondTokenAmount
                )} ${token1}`}
          </div>
        )}
        {/* Plus Icon */}
        <div className="bg-[#e0dcdc] flex justify-center p-3 max-w-fit items-center rounded-full text-base select-none mx-auto">
          <Image src="/icons/PlusIcon.svg" alt="Plus" width={16} height={16} />
        </div>
        {/* Second token container */}
        <div className="relative flex flex-row justify-between px-6 py-[14px] border border-[#D0D5DD] rounded-lg">
          <div className="absolute left-0 -top-9 flex flex-row gap-x-[6px] items-center">
            <div className="z-10 flex overflow-hidden rounded-full">
              <Image
                src={selectedFarm?.asset.logos[1] as string}
                alt={selectedFarm?.asset.logos[1] as string}
                width={24}
                height={24}
              />
            </div>
            <span className="text-[#344054 text-[14px] font-medium leading-5">
              {token1}
            </span>
          </div>
          <input
            placeholder="0"
            className={clsx(
              "text-base text-[#4E4C4C] font-bold leading-6 text-left bg-transparent focus:outline-none"
            )}
            onChange={handleChangeSecondTokenAmount}
            value={secondTokenAmount}
            name="secondTokenAmount"
            id="secondTokenAmount"
            ref={secondInputRef}
            // onBlur={() => setFocusedInput(InputType.Off)}
            onFocus={() => setFocusedInput(InputType.Second)}
            autoFocus={focusedInput === InputType.Second}
          />
          <div className="inline-flex items-center gap-x-2">
            <div className="flex flex-col items-end text-sm leading-5 opacity-50">
              {secondTokenBalance == null ? (
                <span>loading...</span>
              ) : (
                true && (
                  <p className="flex flex-col items-end">
                    <span>Balance</span>
                    <span>
                      {secondTokenBalance.toLocaleString("en-US")} {token1}
                    </span>
                  </p>
                )
              )}
            </div>
            <button
              className="p-2 bg-[#F1F1F1] rounded-lg text-[#8B8B8B] text-[14px] font-bold leading-5"
              onClick={handleMaxSecondToken}
            >
              MAX
            </button>
          </div>
        </div>
        {token_1_not_enought && (
          <div className="text-[#FF9999] leading-6 font-semibold text-base text-left">
            {focusedInput == InputType.Second
              ? "Insufficient Balance"
              : `You need ${
                  fixedAmtNum(secondTokenAmount) - (secondTokenBalance ?? 0)
                } ${token1} for creating an LP token with ${fixedAmtNum(
                  firstTokenAmount
                )} ${token0}`}
          </div>
        )}

        {/* Relative Conversion and Share of Pool */}
        <div className="p-3 flex flex-row justify-between text-[#667085] text-[14px] leading-5 font-bold text-opacity-50">
          <div className="flex flex-col items-start gap-y-2">
            <p>
              {getFirstTokenRelation() < 0.001
                ? "<0.001"
                : getFirstTokenRelation()}{" "}
              {token0} per {token1}
            </p>
            <p>
              {getSecondTokenRelation() < 0.001
                ? "<0.001"
                : getSecondTokenRelation().toLocaleString("en-US")}{" "}
              {token1} per {token0}
            </p>
          </div>
          <p className="flex flex-col items-end">
            <span>
              {(lpTotalBalance !== 0 && (estimateLpMinted ?? 0) > 0
                ? ((estimateLpMinted ?? 0) / lpTotalBalance) * 100 < 0.001
                  ? "<0.001"
                  : ((estimateLpMinted ?? 0) / lpTotalBalance) * 100
                : 0
              ).toLocaleString("en-US")}
              %
            </span>
            <span>Share of pool</span>
          </p>
        </div>

        {/* Gas Fees // Slippage // Suff. Wallet balance */}
        <div
          className={clsx(
            "rounded-xl",
            lpBalance > fees ? "bg-[#C0F9C9]" : "bg-[#FFB7B7]"
          )}
        >
          <div
            className={clsx(
              "flex flex-col gap-y-3 rounded-xl px-6 py-3 bg-[#ECFFEF]",
              lpBalance > fees ? "bg-[#ECFFEF]" : "bg-[#FFE8E8]"
            )}
          >
            <div className="inline-flex justify-between text-[#4E4C4C] font-bold leading-5 text-base">
              <span>Estimated Gas Fees:</span>
              <p className="inline-flex">
                <span className="opacity-40 mr-2 font-semibold">
                  {fees.toLocaleString("en-US") ?? 0} MGX
                </span>
                <span>${(fees * mgxPrice).toFixed(5)}</span>
              </p>
            </div>
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
              {lpBalance > fees ? "Sufficient" : "Insufficient"} Wallet Balance
            </h3>
            <span className="text-[#344054] opacity-50 text-sm font-medium leading-5">
              {lpBalance.toLocaleString("en-US")} {"MGX"}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-row gap-x-3 mt-9">
          <div className="flex flex-row w-full gap-x-3">
            <MButton
              type="primary"
              isLoading={false}
              disabled={
                firstTokenAmount == "" ||
                secondTokenAmount == "" ||
                fixedAmtNum(firstTokenAmount) <= 0 ||
                fixedAmtNum(secondTokenAmount) <= 0 ||
                lpBalance <= fees ||
                fixedAmtNum(firstTokenAmount) > (firstTokenBalance ?? 0) ||
                fixedAmtNum(secondTokenAmount) > (secondTokenBalance ?? 0)
              }
              text="Confirm Adding Liquidity"
              onClick={() => {
                if (
                  parseFloat(firstTokenAmount) <= 0 &&
                  parseFloat(secondTokenAmount) <= 0
                ) {
                  console.log("Both token amount can't be zero");
                } else {
                  setIsConfirmStep(true);
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  };

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
        <div className="flex flex-col p-6 rounded-lg border border-[#BEBEBE] gap-y-2 text-[#344054] font-bold text-lg leading-6">
          <div className="inline-flex items-center gap-x-2">
            <span>{toUnits(estimateLpMinted ?? 0, 3)}</span>
            <div className="z-10 flex overflow-hidden rounded-full">
              <Image
                src={selectedFarm?.asset.logos[0] as string}
                alt={selectedFarm?.asset.logos[0] as string}
                width={24}
                height={24}
              />
            </div>
            <div className="z-10 flex overflow-hidden rounded-full">
              <Image
                src={selectedFarm?.asset.logos[1] as string}
                alt={selectedFarm?.asset.logos[1] as string}
                width={24}
                height={24}
              />
            </div>
          </div>
          <p>
            {token0}/{token1} Pool Tokens
          </p>
        </div>
        <div className="inline-flex justify-between text-sm font-bold">
          <span className="text-[#0B0B0B]">Rates</span>
          <p className="flex flex-col gap-y-2 text-[#282929]">
            <span>
              1 {token0} = {getSecondTokenRelation()} {token1}
            </span>
            <span>
              1 {token1} = {getFirstTokenRelation()} {token0}
            </span>
          </p>
        </div>
        <hr className="border-t border-[#E3E3E3] min-w-full" />
        {/* Relative Conversion and Share of Pool */}
        <div className="p-3 flex flex-row justify-between text-[#667085] text-[14px] leading-5 font-bold text-opacity-50">
          <div className="flex flex-col gap-y-2">
            <p>
              {getFirstTokenRelation()} {token0} per {token1}
            </p>
            <p>
              {getSecondTokenRelation()} {token1} per {token0}
            </p>
          </div>
          <p className="flex flex-col items-end">
            <span>
              {(lpTotalBalance !== 0 && (estimateLpMinted ?? 0) > 0
                ? ((estimateLpMinted ?? 0) / lpTotalBalance) * 100 < 0.001
                  ? "<0.001"
                  : ((estimateLpMinted ?? 0) / lpTotalBalance) * 100
                : 0
              ).toLocaleString("en-US")}
              %
            </span>
            <span>Share of pool</span>
          </p>
        </div>
        <MButton
          type="primary"
          isLoading={false}
          text="Confirm Supply"
          onClick={() => {
            handleAddLiquidity();
            setIsProcessStep(true);
            setIsSigning(true);
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
        ) : isSigning || isInProcess ? (
          <>
            <h3 className="text-base">Waiting For Confirmation</h3>
            <h2 className="text-xl">
              Supplying {firstTokenAmount} {token0} and {secondTokenAmount}{" "}
              {token1}
            </h2>
            <hr className="border-t border-[#E3E3E3] min-w-full" />
            <p className="text-base leading-5 font-semibold text-[##AAABAD]">
              {isInProcess && !isSigning
                ? "Waiting for transaction to complete"
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

  const isOpenModalCondition =
    // approveToken0Loading ||
    // approveToken1Loading ||
    // approveToken0TxnLoading ||
    // approveToken1TxnLoading ||
    // isLoadingAddLiqCall ||
    // isLoadingAddLiqTxn ||
    isSlippageModalOpen;

  return (
    !!selectedFarm && (
      <LiquidityModalWrapper
        open={isOpen || isOpenModalCondition}
        setOpen={isOpenModalCondition ? () => {} : setIsOpen}
        title="Add Liquidity"
      >
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
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

export default AddSectionMangata;
