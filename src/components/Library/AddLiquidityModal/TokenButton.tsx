import { useEffect } from "react";
import { FarmType, UnderlyingAssets } from "@utils/types";
import MButton from "../MButton";
import { useApproveToken, useIsApprovedToken } from "@hooks/useApprovalHooks";
import { Address } from "viem";

interface Props {
  token: UnderlyingAssets;
  selectedFarm: FarmType;
  approvalMap: { [address: Address]: boolean };
  setApprovalMap: React.Dispatch<
    React.SetStateAction<{
      [address: Address]: boolean;
    }>
  >;
}

const TokenButton: React.FC<Props> = ({
  token,
  selectedFarm,
  approvalMap,
  setApprovalMap,
}) => {
  // Check Approval Token
  const { data: isApproved, isSuccess: isApprovedSuccess } = useIsApprovedToken(
    token?.address,
    selectedFarm?.router
  );

  // Approve token
  const {
    isLoadingApproveCall,
    isLoadingApproveTxn,
    isSuccessApproveTxn,
    writeAsync: approveToken,
  } = useApproveToken(token?.address, selectedFarm?.router);

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

  return (
    !isApprovedSuccess &&
    !isSuccessApproveTxn && (
      <MButton
        type="secondary"
        isLoading={isLoadingApproveCall || isLoadingApproveTxn}
        text={
          isLoadingApproveCall
            ? "Sign the Txn in Wallet"
            : isLoadingApproveTxn
            ? "Waiting for Approval"
            : `Approve ${token?.symbol} Token`
        }
        disabled={
          isLoadingApproveCall ||
          isLoadingApproveTxn ||
          typeof approveToken == "undefined"
        }
        onClick={async () => {
          const txn = await approveToken?.();
          console.log("Approve Result", txn);
        }}
      />
    )
  );
};

export default TokenButton;
