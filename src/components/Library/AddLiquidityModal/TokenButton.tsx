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
  const { data: isApproved } = useIsApprovedToken(token, selectedFarm?.router);

  // Approve token
  const {
    isLoadingApproveCall,
    isLoadingApproveTxn,
    isSuccessApproveTxn,
    writeAsync: approveToken,
  } = useApproveToken(token, selectedFarm?.router);

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
    !Number(isApproved) &&
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
          typeof approveToken == "undefined" ||
          !!Number(isApproved) ||
          isSuccessApproveTxn
        }
        onClick={async () => {
          const txn = await approveToken?.({
            args: [
              selectedFarm?.router,
              BigInt(
                "115792089237316195423570985008687907853269984665640564039457584007913129639935"
              ),
            ],
          });
          console.log("Approve Result", txn);
        }}
      />
    )
  );
};

export default TokenButton;
