import { useEffect } from "react";
import { FarmType, UnderlyingAssets } from "@utils/types";
import MButton from "../MButton";
import { useApproveToken, useIsApprovedToken } from "@hooks/useApprovalHooks";

interface Props {
  token: UnderlyingAssets;
  selectedFarm: FarmType;
  setApprovalMap: React.Dispatch<
    React.SetStateAction<{
      [address: `0x${string}`]: boolean;
    }>
  >;
}

const TokenButton: React.FC<Props> = ({
  token,
  selectedFarm,
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
    if (isSuccessApproveTxn || !!Number(isApproved)) {
      setApprovalMap((pre) => ({
        ...pre,
        [token?.address]: true,
      }));
    }
  }, [isSuccessApproveTxn, isApproved]);

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
            : `Approve ${token.symbol} Token`
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
