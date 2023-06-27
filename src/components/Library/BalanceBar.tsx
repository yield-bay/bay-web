import { useAccount, useBalance, useNetwork } from "wagmi";

const BalanceBar = () => {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const { data, isLoading } = useBalance({
    address,
    chainId: chain?.id,
  });

  return (
    <div className="flex items-center gap-1 md:gap-2 rounded-lg bg-white bg-opacity-20 px-3 py-2 font-semibold text-sm text-slate-100">
      {!!data
        ? `Balance: ${parseFloat(data?.formatted).toLocaleString("en-US")} ${
            data?.symbol
          }`
        : isLoading
        ? "Loading..."
        : "Wallet Not Connected"}
    </div>
  );
};

export default BalanceBar;
