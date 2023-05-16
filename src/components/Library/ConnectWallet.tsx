import ClientOnly from "./ClientOnly";
import { Menu, Transition } from "@headlessui/react";
import { FC, Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAccount, useConnect } from "wagmi";
import Image from "next/image";
import clsx from "clsx";
import { useAtom } from "jotai";
import { dotWalletAtom, dotWalletsAtom } from "@store/walletAtoms";
import { Wallet, WalletAccount } from "@talismn/connect-wallets";
import { APP_NAME } from "@utils/constants";
import { dotAccountAtom, dotWalletAccountsAtom } from "@store/accountAtoms";
import ConnectWalletDot from "./ConnectWalletDot";
import HeaderMenu from "./HeaderMenu";

interface SelectAccountMenuProps {
  children: React.ReactNode;
}

interface MenuItemsProps {
  choice: number | null;
  setChoice: (value: number) => void;
}

const MenuItems: FC<MenuItemsProps> = ({ choice, setChoice }) => {
  const { connect, connectors } = useConnect();
  const [dotWallets] = useAtom(dotWalletsAtom); // All available wallets
  const [, setWallet] = useAtom(dotWalletAtom); // Selected Wallet
  const [, setAccount] = useAtom(dotAccountAtom); // Selected Account
  const [walletAccounts, setWalletAccounts] = useAtom(dotWalletAccountsAtom); // All accounts in selected wallet

  const formatWalletName = (walletName: string): string => {
    switch (walletName.toLowerCase()) {
      case "metamask":
        return "Metamask";
      case "subwallet":
        return "Subwallet";
      default:
        return walletName;
    }
  };

  return choice == 0 ? (
    <>
      <div className="pt-3 pb-2 px-4 text-left text-[#7E899C] select-none">
        Connect EVM Wallet
      </div>
      {connectors.map((c) => (
        <Menu.Item key={c.id}>
          <button
            className={clsx(
              "p-4 inline-flex items-center text-left border-b border-[#EAECF0] hover:bg-[#fafafd]"
            )}
            onClick={() => connect({ connector: c })}
          >
            <Image
              src={`/icons/${c.name.toLowerCase()}.svg`}
              width={24}
              height={24}
              alt="wallet"
              className="mr-4"
            />
            {formatWalletName(c.name)}
          </button>
        </Menu.Item>
      ))}
    </>
  ) : choice == 1 ? (
    <>
      <div className="pt-3 pb-2 px-4 text-left text-[#7E899C] select-none">
        Connect Substrate Wallet
      </div>
      {dotWallets.map((wallet: Wallet) => (
        <button
          className="p-4 inline-flex items-center text-left border-b border-[#EAECF0] hover:bg-[#fafafd]"
          key={wallet.extensionName}
          onClick={async () => {
            try {
              await wallet.enable(APP_NAME);
              await wallet.subscribeAccounts(
                (accounts: WalletAccount[] | undefined) => {
                  // jotai:: setting accounts in selected wallet
                  setWalletAccounts(accounts as WalletAccount[]);
                  // if (accounts?.length == 1) {
                  //   setAccount(accounts[0]);
                  //   setIsOpen(false);
                  // }
                  setWallet(wallet);
                  setChoice(2);
                }
              );
            } catch (err) {
              console.log("Error in subscribing accounts: ", err);
            }
          }}
        >
          <Image
            alt={wallet.logo.alt}
            src={wallet.logo.src}
            width={24}
            height={24}
            className="mr-4"
          />
          <span>{wallet.title}</span>
        </button>
      ))}
    </>
  ) : choice == 2 ? (
    <>
      <div className="inline-flex text-[11px] leading-[14.85px] justify-between pt-3 pb-2 px-4 text-left select-none">
        <span className="font-medium text-[#7E899C]">Connect Account</span>
        <span className="font-semibold text-[#F19494]">Disconnect</span>
      </div>
      {walletAccounts && walletAccounts.length > 0 ? (
        <>
          {walletAccounts?.map((account: WalletAccount, index) => (
            <Menu.Item key={index}>
              <button
                className={clsx(
                  "p-4 flex flex-col justify-center items-start border-b border-[#EAECF0] hover:bg-[#fafafd]"
                )}
                key={account.name}
                onClick={() => {
                  console.log("selected account", account);
                  setAccount(account);
                }}
              >
                <p>{account.name}</p>
                <p className="text-[#7E899C] text-[11px] leading-5">
                  {account.address.slice(0, 15)}...
                  {account.address.slice(-5)}
                </p>
              </button>
            </Menu.Item>
          ))}
        </>
      ) : (
        <div className="text-left">
          <p className="mb-5">No accounts found!</p>
          <p>Please check if your wallet is connected and try again.</p>
        </div>
      )}
    </>
  ) : (
    <>
      <button
        onClick={() => setChoice(0)}
        className="p-4 border-b border-[#EAECF0] text-left rounded-t-xl hover:bg-[#fafafd]"
      >
        <p>EVM Wallet</p>
        <p className="text-[11px] text-[#7E899C]">Metamask, Rainbow</p>
      </button>
      <button
        onClick={() => setChoice(1)}
        className="p-4 text-left border-b border-[#EAECF0] hover:bg-[#fafafd]"
      >
        <p>Substrate Wallet</p>
        <p className="text-[11px] text-[#7E899C]">
          Polkadotjs, Talisman, Subwallet
        </p>
      </button>
    </>
  );
};

const SelectAccountMenu: FC<SelectAccountMenuProps> = ({ children }) => {
  const [walletChoice, setWalletChoice] = useState<number | null>(null); // 0 = EVM, 1 = Substrate
  const { isConnected } = useAccount();
  const [account] = useAtom(dotAccountAtom);

  useEffect(() => {
    if (isConnected) {
      setWalletChoice(1);
    } else if (account) {
      setWalletChoice(0);
    }
  }, []);

  const timerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    // Clear timeout when component unmounts
    return () => {
      clearTimeout(timerRef.current as ReturnType<typeof setTimeout>);
    };
  }, []);

  return (
    <Menu as="div" className="relative inline-block text-left text-[#344054]">
      <Menu.Button>{children}</Menu.Button>
      <Transition
        as={Fragment}
        // show={show}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute flex flex-col w-[250px] right-0 top-12 origin-top-right rounded-xl bg-white text-[##344054] border border-[#EAECF0] font-medium text-sm leading-5 focus:outline-none">
          <MenuItems choice={walletChoice} setChoice={setWalletChoice} />
          <div className="py-3 px-[21px] select-none flex flex-col gap-y-2 bg-[#F4F4FF] rounded-b-xl text-[11px] text-[#7E899C] leading-[14.85px] cursor-default">
            {walletChoice == null && (
              <p>
                You can only connect one EVM and one substrate wallet at a time.
              </p>
            )}
            <p>
              Don’t have a self custodian wallet?{" "}
              <Link href="#" className="underline underline-offset-2">
                Start here
              </Link>
            </p>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

const ConnectWalletButton = () => {
  return (
    <ClientOnly>
      <div className="items-center justify-center">
        <div className="font-semibold cursor-pointer text-sm leading-[16.94px] bg-[#36364D] text-[#FCFCFF] rounded-lg transition duration-200 py-[10px] px-4 sm:py-[10px] sm:px-4 focus:outline-none">
          Connect Wallet
        </div>
      </div>
    </ClientOnly>
  );
};

const ConnectWallet = () => {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect();
  const { address } = useAccount();
  const { isConnected } = useAccount();
  const [account] = useAtom(dotAccountAtom);

  useEffect(() => {
    console.log("dot account", account);
  }, [account]);

  return (
    <div>
      {isConnected || account ? (
        <div className="inline-flex gap-x-3">
          {isConnected && (
            <>
              <HeaderMenu address={address} />
              {account == null && (
                <SelectAccountMenu>
                  <button className="px-[13px] text-xl font-semibold leading-6 bg-[#36364D] text-[#FCFCFF] rounded-lg">
                    +
                  </button>
                </SelectAccountMenu>
              )}
            </>
          )}
          {account && (
            <>
              <ConnectWalletDot />
              {!isConnected && (
                <SelectAccountMenu>
                  <button className="px-[13px] text-xl font-semibold leading-6 bg-[#36364D] text-[#FCFCFF] rounded-lg">
                    +
                  </button>
                </SelectAccountMenu>
              )}
            </>
          )}
        </div>
      ) : (
        // When none of the wallets are connected
        <SelectAccountMenu>
          <ConnectWalletButton />
        </SelectAccountMenu>
      )}
    </div>
  );
};

export default ConnectWallet;
