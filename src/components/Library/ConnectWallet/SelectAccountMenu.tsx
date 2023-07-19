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
import { ArrowDownIcon, ArrowLeftIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { getWalletInstallUrl } from "@utils/farmListMethods";

interface SelectAccountMenuProps {
  children: React.ReactNode;
}

interface MenuItemsProps {
  choice: number | null;
  setChoice: (value: number | null) => void;
}

// MenuItems determines the content of Menu depending on current state
const MenuItems: FC<MenuItemsProps> = ({ choice, setChoice }) => {
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const [dotWallets] = useAtom(dotWalletsAtom); // All available wallets
  const [, setWallet] = useAtom(dotWalletAtom); // Selected Wallet
  const [account, setAccount] = useAtom(dotAccountAtom); // Selected Account
  const [walletAccounts, setWalletAccounts] = useAtom(dotWalletAccountsAtom); // All accounts in selected wallet

  const router = useRouter();

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
      <div className="inline-flex items-center gap-2 pt-3 pb-2 px-4 text-left text-[#7E899C] select-none">
        {!isConnected && !account && (
          <button onClick={() => setChoice(null)}>
            <ArrowLeftIcon className="text-[#7E899C] h-3 w-3" />
          </button>
        )}
        <span>Connect EVM Wallet</span>
      </div>
      {connectors.map((c) => (
        <Menu.Item key={c.id}>
          <button
            className={clsx(
              "p-4 inline-flex items-center gap-x-2 text-left border-b border-[#EAECF0] hover:bg-[#fafafd]"
            )}
            onClick={() => {
              if (c.ready) {
                connect({ connector: c });
              } else {
                router.push(getWalletInstallUrl(c.name));
              }
            }}
          >
            <Image
              src={`/icons/${c.name.toLowerCase()}.svg`}
              width={24}
              height={24}
              alt="wallet"
              className={clsx(!c.ready && "opacity-40")}
            />
            <span
              className={clsx(
                !c.ready && "underline underline-offset-4 opacity-40"
              )}
            >
              {formatWalletName(c.name)}
            </span>
            {!c.ready && (
              <ArrowDownIcon className="text-[#344054] w-4 h-4 ml-2 opacity-40" />
            )}
          </button>
        </Menu.Item>
      ))}
      {account && (
        <div className="py-3 px-[21px] select-none flex flex-col gap-y-2 bg-[#F4F4FF] rounded-b-xl text-[11px] text-[#7E899C] leading-[14.85px] cursor-default">
          <p>
            Don’t have a self custodian wallet?{" "}
            <Link href="#" className="underline underline-offset-2">
              Start here
            </Link>
          </p>
        </div>
      )}
    </>
  ) : choice == 1 ? (
    <>
      <div className="inline-flex items-center gap-2 pt-3 pb-2 px-4 text-left text-[#7E899C] select-none">
        {!isConnected && !account && (
          <button onClick={() => setChoice(null)}>
            <ArrowLeftIcon className="text-[#7E899C] h-3 w-3" />
          </button>
        )}
        <span>Connect Substrate Wallet</span>
      </div>
      {dotWallets.map((wallet: Wallet) => (
        <button
          className="p-4 inline-flex items-center gap-x-2 text-left border-b border-[#EAECF0] hover:bg-[#fafafd]"
          key={wallet.extensionName}
          onClick={async () => {
            try {
              if (wallet.installed) {
                await wallet.enable(APP_NAME);
                await wallet.subscribeAccounts(
                  (accounts: WalletAccount[] | undefined) => {
                    // jotai:: setting accounts in selected wallet
                    setWalletAccounts(accounts as WalletAccount[]);
                    setWallet(wallet);
                    setChoice(2);
                  }
                );
              } else {
                console.log(`${wallet.extensionName} not installed!`);
                router.push(wallet.installUrl);
              }
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
            className={clsx(!wallet.installed && "opacity-40")}
          />
          <span
            className={clsx(
              !wallet.installed && "underline underline-offset-4 opacity-40"
            )}
          >
            {wallet.title}
          </span>
          {!wallet.installed && (
            <ArrowDownIcon className="text-[#344054] w-4 h-4 opacity-40" />
          )}
        </button>
      ))}
    </>
  ) : choice == 2 ? (
    <>
      <div className="inline-flex text-[11px] leading-[14.85px] justify-between pt-3 pb-2 px-4 text-left select-none">
        <span className="font-medium text-[#7E899C]">Connect Account</span>
        {account !== null && (
          <button
            onClick={() => {
              // Clear all states to disconnect wallet
              setWallet(null);
              setWalletAccounts(null);
              setAccount(null);
            }}
            className="font-semibold text-[#FE4C4C]"
          >
            Disconnect
          </button>
        )}
      </div>
      {/* Showing available accounts in selected wallet */}
      {walletAccounts && walletAccounts.length > 0 ? (
        <>
          {walletAccounts?.map((account: WalletAccount, index) => (
            <Menu.Item key={index}>
              <button
                className={clsx(
                  "p-4 flex flex-col justify-center items-start border-b border-[#EAECF0] hover:bg-[#fafafd]",
                  index == walletAccounts.length - 1 && "border-none"
                )}
                key={account.name}
                onClick={() => {
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
        <p className="text-[11px] text-[#7E899C]">
          Metamask, Talisman, SubWallet
        </p>
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
  const [walletAccounts] = useAtom(dotWalletAccountsAtom); // All accounts in selected wallet
  const { isConnected } = useAccount();
  const [account] = useAtom(dotAccountAtom);

  useEffect(() => {
    if (account) {
      setWalletChoice(0);
    } else if (isConnected) {
      setWalletChoice(1);
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
    <Menu
      as="div"
      className="relative w-full sm:w-fit inline-block text-left text-[#344054]"
    >
      {({ open }) => (
        <>
          <Menu.Button
            className={clsx(
              "min-w-full transition-all duration-200",
              open && "opacity-50"
            )}
          >
            {children}
          </Menu.Button>
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
            <Menu.Items className="absolute z-20 flex flex-col w-full sm:w-[250px] right-0 top-14 sm:top-12 origin-top-right rounded-xl bg-white text-[##344054] border border-[#EAECF0] font-medium text-sm leading-5 focus:outline-none">
              <MenuItems choice={walletChoice} setChoice={setWalletChoice} />
              {!account && (
                <div className="py-3 px-[21px] select-none flex flex-col gap-y-2 bg-[#F4F4FF] rounded-b-xl text-[11px] text-[#7E899C] leading-[14.85px] cursor-default">
                  {walletChoice == null && (
                    <p>
                      You can only connect one EVM and one substrate wallet at a
                      time.
                    </p>
                  )}
                  <p>
                    Don’t have a self custodian wallet?{" "}
                    <Link href="#" className="underline underline-offset-2">
                      Start here
                    </Link>
                  </p>
                </div>
              )}
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export default SelectAccountMenu;
