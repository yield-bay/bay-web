import { Address, useAccount, useBalance, useNetwork } from "wagmi";

const useLPBalance = (lpAddress: Address) => {
  const { chain } = useNetwork();
  const { address } = useAccount();

  // Balance Token1
  const { data: lpbalance, isLoading: lpBalanceLoading } = useBalance({
    address,
    chainId: chain?.id,
    token: lpAddress,
    enabled: !!address && !!lpAddress && !!chain,
  });

  const lpBalance = lpBalanceLoading ? "0" : lpbalance?.formatted;
  return { lpBalance, lpBalanceLoading };
};

export default useLPBalance;
