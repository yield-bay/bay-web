import { FC, Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAtom } from "jotai";
import clsx from "clsx";
import { Menu, Transition } from "@headlessui/react";
import { dotAccountAtom, dotWalletAccountsAtom } from "@store/accountAtoms";
import { dotWalletAtom, dotWalletsAtom } from "@store/walletAtoms";
import { CheckCircleIcon, ChevronDownIcon } from "@heroicons/react/outline";
import useDetectOutsideClick from "@hooks/useDetectOutsideClick";
import Button from "./Button";
import ModalWrapper from "./ModalWrapper";
import { walletModalOpenAtom } from "@store/commonAtoms";

interface SelectAccountMenuProps {
  children: React.ReactNode;
}

interface DisconnectModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const SelectAccountMenu: FC<SelectAccountMenuProps> = ({ children }) => {
  const dropdownRef = useRef(null);
  // NOTE: useDetectOutsideClick is not necessary with hover, useState(false) would do here
  const [openDropdown, setOpenDropdown] = useDetectOutsideClick(
    dropdownRef, // Element to detect
    false // Initial state
  );
  const [mouseOverButton, setMouseOverButton] = useState(false);
  const [mouseOverMenu, setMouseOverMenu] = useState(false);
  const timeoutDuration = 200;
  let timeoutButton: NodeJS.Timeout;
  let timeoutMenu: NodeJS.Timeout;

  const onMouseEnterButton = () => {
    clearTimeout(timeoutButton);
    setOpenDropdown(true);
    setMouseOverButton(true);
  };
  const onMouseLeaveButton = () => {
    timeoutButton = setTimeout(
      () => setMouseOverButton(false),
      timeoutDuration
    );
  };

  const onMouseEnterMenu = () => {
    clearTimeout(timeoutMenu);
    setMouseOverMenu(true);
  };
  const onMouseLeaveMenu = () => {
    timeoutMenu = setTimeout(() => setMouseOverMenu(false), timeoutDuration);
  };

  const show = openDropdown && (mouseOverMenu || mouseOverButton);

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
    <Menu
      as="div"
      className="relative inline-block text-left"
      onMouseEnter={onMouseEnterButton}
      onMouseLeave={onMouseLeaveButton}
      role="button"
      tabIndex={0}
    >
      <Menu.Button>{children}</Menu.Button>
      <Transition
        as={Fragment}
        show={show}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className="absolute w-[250px] right-0 top-14 origin-top-right px-4 rounded-b-xl pt-5 pb-2 bg-white text-[#030303] focus:outline-none"
          ref={dropdownRef}
          onMouseEnter={onMouseEnterMenu}
          onMouseLeave={onMouseLeaveMenu}
          static
        >
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
    <div
      onClick={account == null ? () => setIsOpen(true) : () => {}}
      className={clsx(
        "flex flex-row items-center justify-center cursor-pointer ring-1 font-semibold text-sm leading-[16.94px] bg-[#37376A] text-white rounded-lg transition duration-200 py-[10.5px] px-4 sm:py-[10px] sm:px-4"
        // account == null ? "hover:bg-offWhite" : "cursor-default"
      )}
    >
      {account == null ? (
        wallet == null ? (
          <span>Connect Substrate Wallet</span>
        ) : (
          <span>Connect Account</span>
        )
      ) : (
        <div className="inline-flex justify-between w-full">
          <div className="inline-flex gap-x-1 items-center">
            <span>
              {account.name && account?.name.length > 10
                ? `${account.name.slice(0, 10)}...`
                : account.name}
            </span>
            <ChevronDownIcon className="w-6 h-6 text-[#797979]" />
          </div>
          <div className="inline-flex gap-x-2">
            <div
              className="cursor-pointer"
              onClick={() => {
                navigator.clipboard.writeText(account?.address);
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
            <div
              className="cursor-pointer"
              onClick={() => {
                setDisconnectModalOpen(true);
              }}
            >
              <Image
                src="/icons/XCircle.svg"
                alt="disconnect wallet"
                width={24}
                height={24}
              />
            </div>
          </div>
        </div>
      )}
      <DisconnectAccountModal
        open={disconnectModalOpen}
        setOpen={setDisconnectModalOpen}
      />
    </div>
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
    <div className="flex flex-col gap-y-4">
      <SelectAccountMenu>
        <ConnectWalletButton />
      </SelectAccountMenu>
    </div>
  );
};

export default ConnectWalletDot;
