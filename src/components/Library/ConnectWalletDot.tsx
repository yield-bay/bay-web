import { FC, Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAtom } from "jotai";
import clsx from "clsx";
import { Menu, Transition } from "@headlessui/react";
import { dotAccountAtom, dotWalletAccountsAtom } from "@store/accountAtoms";
import { dotWalletAtom, dotWalletsAtom } from "@store/walletAtoms";
import { CheckCircleIcon, ChevronDownIcon } from "@heroicons/react/outline";
import Button from "./Button";
import ModalWrapper from "./ModalWrapper";
import { walletModalOpenAtom } from "@store/commonAtoms";
import CButton from "./CButton";

interface SelectAccountMenuProps {
  children: React.ReactNode;
}

interface DisconnectModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const SelectAccountMenu: FC<SelectAccountMenuProps> = ({ children }) => {
  const [walletAccounts] = useAtom(dotWalletAccountsAtom); // connected accounts in selected wallet
  const [account, setAccount] = useAtom(dotAccountAtom); // selected account

  const [isCopied, setIsCopied] = useState(false); // copied address to clipboard
  const timerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    // Clear timeout when component unmounts
    return () => {
      clearTimeout(timerRef.current as ReturnType<typeof setTimeout>);
    };
  }, []);

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button>{children}</Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute w-[250px] right-0 top-14 origin-top-right px-4 rounded-b-xl pt-5 pb-2 bg-white text-[#030303] focus:outline-none">
          {walletAccounts?.map((walletAccount, index) => {
            const active = walletAccount.address === account?.address;
            return (
              <Menu.Item key={index}>
                <button
                  className={clsx(
                    active
                      ? "bg-[#D3D3D3] hover:[#D3D3D3]"
                      : "hover:bg-[#EFEFEF]",
                    "group flex flex-row items-start justify-between p-3 w-full mb-4 rounded-lg overflow-hidden"
                  )}
                  onClick={() => setAccount(walletAccount)}
                >
                  <p className="flex flex-col gap-y-2 items-start">
                    <span className="text-sm leading-[19px]">
                      {walletAccount.name}
                    </span>
                    <span className="text-[#969696] text-xs leading-5">
                      {walletAccount.address.slice(0, 5)}...
                      {walletAccount.address.slice(-5)}
                    </span>
                  </p>
                  <div
                    className="ml-6 cursor-pointer"
                    onClick={() => {
                      navigator.clipboard.writeText(account?.address as string);
                      setIsCopied(true);
                      timerRef.current = setTimeout(() => {
                        setIsCopied(false);
                      }, 500);
                    }}
                  >
                    {isCopied ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    ) : (
                      <Image
                        src="/icons/Copy.svg"
                        alt="copy address"
                        width={24}
                        height={24}
                      />
                    )}
                  </div>
                </button>
              </Menu.Item>
            );
          })}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

const ConnectWalletButton: FC = () => {
  const [, setIsOpen] = useAtom(walletModalOpenAtom);
  const [account] = useAtom(dotAccountAtom); // selected account
  const [wallet] = useAtom(dotWalletAtom);

  const [disconnectModalOpen, setDisconnectModalOpen] =
    useState<boolean>(false);
  const [isCopied, setIsCopied] = useState(false); // copied address to clipboard
  const timerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    // Clear timeout when component unmounts
    return () => {
      clearTimeout(timerRef.current as ReturnType<typeof setTimeout>);
    };
  }, []);

  return (
    <>
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
      <DisconnectAccountModal
        open={disconnectModalOpen}
        setOpen={setDisconnectModalOpen}
      />
    </>
  );
};

const DisconnectAccountModal: FC<DisconnectModalProps> = ({
  open,
  setOpen,
}) => {
  const [, setWallet] = useAtom(dotWalletAtom); // selected wallet
  const [, setWalletAccounts] = useAtom(dotWalletAccountsAtom); // connected accounts in selected wallet
  const [, setAccount] = useAtom(dotAccountAtom); // selected account
  return (
    <ModalWrapper open={open} setOpen={setOpen}>
      <div className="flex flex-col gap-y-14">
        <p className="text-base leading-[21.6px] text-[#B9B9B9] text-center w-full px-24">
          Are you Sure you want to Disconnect?
        </p>
        <div className="inline-flex gap-x-2 w-full">
          <Button
            size="large"
            onButtonClick={() => {
              // Clear all states to disconnect wallet
              setWallet(null);
              setWalletAccounts(null);
              setAccount(null);
            }}
          >
            Disconnect
          </Button>
          <Button
            size="large"
            onButtonClick={() => {
              setOpen(false);
            }}
          >
            Go Back
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
};

const ConnectWalletDot = () => {
  const [wallets] = useAtom(dotWalletsAtom);
  useEffect(() => {
    console.log("Wallets in ConnetWalletDot", wallets);
  }, [wallets]);

  return (
    <ConnectWalletButton />
    // <div className="flex flex-col gap-y-4">
    //   <SelectAccountMenu>
    //     <ConnectWalletButton />
    //   </SelectAccountMenu>
    // </div>
  );
};

export default ConnectWalletDot;
