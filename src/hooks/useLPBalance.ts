import { Address, useAccount, useBalance, useNetwork } from "wagmi";

const useLPBalance = (lpAddress: Address, isEnable: boolean = false) => {
  const { chain } = useNetwork();
  const { address } = useAccount();

  // Balance Token1
  const { data: lpbalance, isLoading: lpBalanceLoading } = useBalance({
    address,
    chainId: chain?.id,
    token: lpAddress,
    enabled: !!address && !!lpAddress && !!chain && isEnable,
  });

  const lpBalance = lpBalanceLoading ? "0" : lpbalance?.formatted;
  return { lpBalanceObj: lpbalance, lpBalance, lpBalanceLoading };
};

export default useLPBalance;
