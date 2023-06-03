import { FC, useEffect, useRef } from "react";
import { useAtom } from "jotai";
import { dotAccountAtom } from "@store/accountAtoms";
import { dotWalletsAtom } from "@store/walletAtoms";
import { ChevronDownIcon } from "@heroicons/react/outline";
import { walletModalOpenAtom } from "@store/commonAtoms";
import CButton from "./CButton";

const ConnectWalletButton: FC = () => {
  const [, setIsOpen] = useAtom(walletModalOpenAtom);
  const [account] = useAtom(dotAccountAtom); // selected account
  const timerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    // Clear timeout when component unmounts
    return () => {
      clearTimeout(timerRef.current as ReturnType<typeof setTimeout>);
    };
  }, []);

  return (
    <CButton
      variant="primary"
      onButtonClick={account == null ? () => setIsOpen(true) : () => {}}
    >
      {account !== null && (
        <span>
          {account.name && account?.name.length > 10
            ? `${account.name.slice(0, 10)}...`
            : account.name}
        </span>
      )}
      <ChevronDownIcon className="w-5 h-5 text-[#FFFFFF]" />
    </CButton>
  );
};

const ConnectWalletDot = () => {
  const [wallets] = useAtom(dotWalletsAtom);
  useEffect(() => {
    console.log("Wallets in ConnetWalletDot", wallets);
  }, [wallets]);

  return <ConnectWalletButton />;
};

export default ConnectWalletDot;
