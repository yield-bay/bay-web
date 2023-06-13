import { type FC, Fragment, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useAtom } from "jotai";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/outline";
import clsx from "clsx";
import { WalletAccount } from "@talismn/connect-wallets";
import { Menu, Transition } from "@headlessui/react";
import { dotAccountAtom, dotWalletAccountsAtom } from "@store/accountAtoms";
import ClientOnly from "@components/Common/ClientOnly";
import { dotWalletAtom } from "@store/walletAtoms";

const ConnectBtnDot: FC = () => {
  const timerRef = useRef<null | ReturnType<typeof setTimeout>>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [switchAccount, setSwitchAccount] = useState(false);
  const [wallet, setWallet] = useAtom(dotWalletAtom); // Selected Wallet
  const [account, setAccount] = useAtom(dotAccountAtom); // Selected Account
  const [walletAccounts, setWalletAccounts] = useAtom(dotWalletAccountsAtom);

  useEffect(() => {
    // Clear timeout when component unmounts
    console.log("Connected substrate Account", account);
    return () => {
      clearTimeout(timerRef.current as ReturnType<typeof setTimeout>);
    };
  }, []);

  return (
    <ClientOnly>
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="inline-flex items-center font-semibold cursor-pointer text-sm leading-[16.94px] bg-[#36364D] text-white rounded-lg transition duration-200 py-[10px] px-4 sm:py-[10px] sm:px-4 focus:outline-none">
          <span>
            {account?.name && account?.name.length > 10
              ? `${account.name.slice(0, 10)}...`
              : account?.name}
          </span>
          <ChevronDownIcon
            className="ml-2 -mr-1 h-5 w-5 text-white"
            aria-hidden="true"
          />
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          {switchAccount ? (
            <Menu.Items className="absolute flex flex-col w-[250px] right-0 top-12 origin-top-right rounded-xl bg-white text-[##344054] border border-[#EAECF0] font-medium text-sm leading-5 focus:outline-none">
              <div className="inline-flex text-[11px] leading-[14.85px] justify-between pt-3 pb-2 px-4 text-left select-none">
                <div className="inline-flex gap-2">
                  <button onClick={() => setSwitchAccount(false)}>
                    <ArrowLeftIcon className="text-[#7E899C] h-3 w-3" />
                  </button>
                  <span className="font-medium text-[#7E899C]">
                    Switch Account
                  </span>
                </div>
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
              </div>
              {walletAccounts && walletAccounts.length > 0 ? (
                <>
                  {walletAccounts?.map((account: WalletAccount, index) => (
                    <Menu.Item key={index}>
                      <button
                        className={clsx(
                          "p-4 flex flex-col justify-center items-start border-b border-[#EAECF0] hover:bg-[#fafafd]",
                          index == walletAccounts.length - 1 &&
                            "border-none rounded-b-xl"
                        )}
                        key={account.name}
                        onClick={() => {
                          console.log("selected account", account);
                          setAccount(account);
                        }}
                      >
                        <p className="text-[#344054]">{account.name}</p>
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
            </Menu.Items>
          ) : (
            <Menu.Items className="w-[240px] absolute border border-[#EAECF0] right-0 mt-2 origin-top-right rounded-lg bg-white shadow-lg focus:outline-none">
              <div className="inline-flex border-b border-[#EAECF0] justify-between items-center rounded-t-lg w-full py-3 px-4">
                <div className="inline-flex items-center gap-x-3">
                  <div className="relative">
                    <div className="rounded-full overflow-hidden">
                      <Image
                        src={wallet?.logo.src as string}
                        alt={wallet?.logo.alt as string}
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className="absolute right-0 bottom-0 h-[13px] w-[13px] bg-[#12B76A] rounded-full border-2 border-white" />
                  </div>
                  <p className="font-bold text-sm leading-5 text-[#475467]">
                    {account?.address.slice(0, 4)}......
                    {account?.address?.slice(-4)}
                  </p>
                </div>
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
                      src="/icons/CopyIcon.svg"
                      alt="Copy address"
                      width={24}
                      height={24}
                    />
                  )}
                </div>
              </div>
              <button
                className="inline-flex w-full items-center p-4 border-b border-[#EAECF0] text-[#344054] text-sm leading-5 font-medium text-left rounded-t-xl hover:bg-[#FAFAFD]"
                onClick={() => {
                  setSwitchAccount(true);
                }}
              >
                <Image
                  src="/icons/UserIcon.svg"
                  alt="Disconnect"
                  height={16}
                  width={16}
                  className="mr-2"
                />
                Switch Account
              </button>
              <Menu.Item>
                <button
                  className="inline-flex rounded-lg w-full items-center p-4 text-[#344054] text-sm leading-5 font-medium text-left rounded-t-xl hover:bg-[#FAFAFD]"
                  onClick={() => {
                    // Clear all states to disconnect wallet
                    setWallet(null);
                    setWalletAccounts(null);
                    setAccount(null);
                  }}
                >
                  <Image
                    src="/icons/LogOutIcon.svg"
                    alt="Disconnect"
                    height={16}
                    width={16}
                    className="mr-2"
                  />
                  Disconnect
                </button>
              </Menu.Item>
            </Menu.Items>
          )}
        </Transition>
      </Menu>
    </ClientOnly>
  );
};

export default ConnectBtnDot;
