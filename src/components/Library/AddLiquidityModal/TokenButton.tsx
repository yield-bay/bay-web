import { useEffect } from "react";
import { FarmType, UnderlyingAssets } from "@utils/types/common";
import MButton from "../MButton";
import { useApproveToken, useIsApprovedToken } from "@hooks/useApprovalHooks";
import { Address } from "viem";
import clsx from "clsx";
import { useAccount, useBalance, useNetwork } from "wagmi";

interface Props {
  token: UnderlyingAssets;
  inputMapAmount: { [address: Address]: number };
  selectedFarm: FarmType;
  approvalMap: { [address: Address]: boolean };
  setApprovalMap: React.Dispatch<
    React.SetStateAction<{
      [address: Address]: boolean;
    }>
  >;
  setIsApproving: React.Dispatch<
    React.SetStateAction<{
      [address: `0x${string}`]: boolean;
    }>
  >;
}

const TokenButton: React.FC<Props> = ({
  token,
  inputMapAmount,
  selectedFarm,
  approvalMap,
  setApprovalMap,
  setIsApproving,
}) => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  // Balance Token
  const {
    data: balance,
    isLoading: balanceLoading,
    isSuccess,
  } = useBalance({
    address: address,
    chainId: chain?.id,
    token: token?.address,
    enabled: !!address && !!token,
  });

  // console.log("balance in tokenbutton", balance, isSuccess);

  // Check Approval Token
  const { isSuccess: isApprovedSuccess } = useIsApprovedToken(
    token?.address,
    selectedFarm?.router,
    balance,
    inputMapAmount[token?.address]
  );

  // Approve token
  const {
    isLoadingApproveCall,
    isLoadingApproveTxn,
    isSuccessApproveTxn,
    writeAsync: approveToken,
  } = useApproveToken(
    token?.address,
    selectedFarm?.router,
    token?.symbol,
    balance
  );

  // useEffect(() => {
  //   if (isLoadingApproveCall || isLoadingApproveTxn) {
  //     setIsApproving((prev) => {
  //       return {
  //         ...prev,
  //         [token?.address]: true,
  //       };
  //     });
  //   } else {
  //     setIsApproving((prev) => {
  //       return {
  //         ...prev,
  //         [token?.address]: false,
  //       };
  //     });
  //   }
  // }, [isLoadingApproveCall || isLoadingApproveTxn]);

  useEffect(() => {
    // Either already approved or approved after transaction
    if (
      (isSuccessApproveTxn || isApprovedSuccess) &&
      !approvalMap[token?.address]
    ) {
      setApprovalMap((pre) => ({
        ...pre,
        [token?.address]: true,
      }));
    }
  }, [isSuccessApproveTxn, isApprovedSuccess]);

  if (
    !inputMapAmount[token?.address] ||
    Object.keys(approvalMap).find((key) => key === token?.address)
  ) {
    return <></>;
  }

  const handleApproveToken = async () => {
    try {
      const txn = await approveToken?.();
      // console.log("Approve Result", txn);
    } catch (error) {
      // console.log(`Error while Approving ${token.symbol}`, error);
    }
  };

  return (
    <MButton
      type="secondary"
      className={clsx(!inputMapAmount[token?.address] && "hidden")}
      text={
        typeof approveToken == "undefined"
          ? "Some error, try refreshing!"
          : isLoadingApproveCall
          ? "Sign the Txn in Wallet"
          : isLoadingApproveTxn
          ? "Waiting for Approval"
          : `Approve ${token?.symbol} Token`
      }
      isLoading={isLoadingApproveCall || isLoadingApproveTxn}
      disabled={
        isLoadingApproveCall ||
        isLoadingApproveTxn ||
        typeof approveToken == "undefined"
      }
      onClick={handleApproveToken}
    />
  );
};

export default TokenButton;
