import { useEffect } from "react";
import { useWaitForTransaction } from "wagmi";
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
    data: approveTokenData,
    isLoading: approveIsLoading,
    writeAsync: approveToken,
  } = useApproveToken(token, selectedFarm?.router);

  const { isLoading: isLoadingApprove, isSuccess: isSuccessApprove } =
    useWaitForTransaction({
      hash: approveTokenData?.hash,
    });

  useEffect(() => {
    // Either already approved or approved after transaction
    if (isSuccessApprove || !!Number(isApproved)) {
      setApprovalMap((pre) => ({
        ...pre,
        [token?.address]: true,
      }));
    }
  }, [isSuccessApprove, isApproved]);

  return (
    !Number(isApproved) &&
    !isSuccessApprove && (
      <MButton
        type="secondary"
        text={
          approveIsLoading
            ? "Sign the Transaction..."
            : isLoadingApprove
            ? "Approving..."
            : `Approve ${token.symbol} Token`
        }
        disabled={
          isSuccessApprove ||
          isLoadingApprove ||
          typeof approveToken == "undefined" ||
          !!Number(isApproved)
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
