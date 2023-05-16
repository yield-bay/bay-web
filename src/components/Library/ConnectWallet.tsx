import ClientOnly from "./ClientOnly";
import { Menu, Transition } from "@headlessui/react";
import { FC, Fragment, useEffect, useRef, useState } from "react";
import useDetectOutsideClick from "@hooks/useDetectOutsideClick";
import Link from "next/link";

interface SelectAccountMenuProps {
  children: React.ReactNode;
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
      className="relative inline-block text-left text-[#344054]"
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
          className="absolute flex flex-col w-[250px] right-0 top-12 origin-top-right rounded-xl bg-white text-[##344054] border border-[#EAECF0] font-medium text-sm leading-5 focus:outline-none"
          ref={dropdownRef}
          onMouseEnter={onMouseEnterMenu}
          onMouseLeave={onMouseLeaveMenu}
          static
        >
          <Menu.Item>
            <button className="p-4 border-b border-[#EAECF0] text-left rounded-t-xl hover:bg-[#fafafd]">
              <p>EVM Wallet</p>
              <p className="text-[11px] text-[#7E899C]">Metamask, Rainbow</p>
            </button>
          </Menu.Item>
          <Menu.Item>
            <button className="p-4 text-left border-b border-[#EAECF0] hover:bg-[#fafafd]">
              <p>Substrate Wallet</p>
              <p className="text-[11px] text-[#7E899C]">
                Polkadotjs, Talisman, Subwallet
              </p>
            </button>
          </Menu.Item>
          <div className="py-3 px-[21px] select-none flex flex-col gap-y-2 bg-[#F4F4FF] rounded-b-xl text-[11px] text-[#7E899C] leading-[14.85px] cursor-default">
            <p>
              You can only connect one EVM and one substrate wallet at a time.
            </p>
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
        <div
          // onClick={openModal}
          className="font-semibold cursor-pointer text-sm leading-[16.94px] bg-[#36364D] text-[#FCFCFF] rounded-lg transition duration-200 py-[10.5px] px-4 sm:py-[10px] sm:px-4 focus:outline-none"
        >
          Connect Wallet
        </div>
      </div>
    </ClientOnly>
  );
};

const ConnectWallet = () => {
  return (
    <SelectAccountMenu>
      <ConnectWalletButton />
    </SelectAccountMenu>
  );
};

export default ConnectWallet;
