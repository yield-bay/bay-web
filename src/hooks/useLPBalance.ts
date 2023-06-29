import { useAccount, useBalance, useNetwork } from "wagmi";

const useLPBalance = (lpAddress: `0x${string}`) => {
  const { chain } = useNetwork();
  const { address } = useAccount();

  // Balance Token1
  const { data: lpbalance, isLoading: lpBalanceLoading } = useBalance({
    address,
    chainId: chain?.id,
    token: lpAddress,
    enabled: !!address && !!lpAddress,
  });

  const lpBalance = lpBalanceLoading ? "0" : lpbalance?.formatted;
  return { lpBalance, lpBalanceLoading };
};

export default useLPBalance;
