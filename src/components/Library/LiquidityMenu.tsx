import { Menu, Transition } from "@headlessui/react";
import { FC, Fragment, memo } from "react";
import Image from "next/image";
import clsx from "clsx";
import { MinusIcon, PlusIcon } from "@heroicons/react/outline";
import {
  addLiqModalOpenAtom,
  removeLiqModalOpenAtom,
  stakingModalOpenAtom,
  unstakingModalOpenAtom,
} from "@store/commonAtoms";
import { useAtom } from "jotai";
import { selectedFarmAtom } from "@store/atoms";
import { FarmType } from "@utils/types/common";

interface Props {
  farm: FarmType;
  position: any;
}

interface ModalButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tooltipText?: string;
}

const SelectLiquidityModal: FC<Props> = ({ farm, position }) => {
  // Modal States
  const [, setAddLiqModalOpen] = useAtom(addLiqModalOpenAtom);
  const [, setRemoveLiqModalOpen] = useAtom(removeLiqModalOpenAtom);
  const [, setStakingModalOpen] = useAtom(stakingModalOpenAtom);
  const [, setUnstakingModalOpen] = useAtom(unstakingModalOpenAtom);
  const [, setSelectedFarm] = useAtom(selectedFarmAtom);
  return (
    <Menu
      as="div"
      className="relative w-full sm:w-fit inline-block text-left text-[#344054]"
    >
      <Menu.Button
        className={clsx(
          "py-[10px] px-4",
          "ring-1 ring-[#CCCCFF] rounded-lg bg-[#F0F0FF] shadow-farmBtn",
          "text-[#1D2939] font-medium text-sm leading-5"
        )}
      >
        Manage
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
        <Menu.Items className="absolute z-20 flex flex-col w-full overflow-hidden sm:w-60 -right-px top-14 sm:top-12 origin-top-right rounded-lg bg-white text-[##344054] border border-[#EAECF0] font-medium text-sm leading-5 focus:outline-none divide-y divide-[#EAECF0]">
          <ModalButton
            onClick={() => {
              setAddLiqModalOpen(true);
              setSelectedFarm(farm);
            }}
          >
            <span>Add Liquidity</span>
            <PlusIcon className="text-black h-4 w-4" />
          </ModalButton>
          <ModalButton
            onClick={() => {
              setRemoveLiqModalOpen(true);
              setSelectedFarm(farm);
            }}
            disabled={
              !!position
                ? farm?.chain.toLowerCase() != "mangata kusama"
                  ? position.unstaked.amountUSD == 0
                  : position.staked.amountUSD == 0
                : true
            }
            tooltipText="You need to have liquidity first"
          >
            <span>Remove Liquidity</span>
            <MinusIcon className="text-black h-4 w-4" />
          </ModalButton>
          {farm?.chain.toLowerCase() != "mangata kusama" && (
            <>
              <ModalButton
                onClick={() => {
                  setStakingModalOpen(true);
                  setSelectedFarm(farm);
                }}
                disabled={!!position ? position.unstaked.amountUSD == 0 : true}
                tooltipText="You need to have liquidity first"
              >
                <span>Stake</span>
                <Image
                  src="/icons/ArrowLineUpIcon.svg"
                  alt="Stake"
                  height="16"
                  width="16"
                />
              </ModalButton>
              <ModalButton
                onClick={() => {
                  setUnstakingModalOpen(true);
                  setSelectedFarm(farm);
                }}
                disabled={!!position ? position.staked.amountUSD == 0 : true}
                tooltipText="You need to stake tokens first"
              >
                <span>Unstake</span>
                <Image
                  className="transform rotate-180"
                  src="/icons/ArrowLineUpIcon.svg"
                  alt="Stake"
                  height="16"
                  width="16"
                />
              </ModalButton>
            </>
          )}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

const ModalButton: FC<ModalButtonProps> = ({
  children,
  onClick,
  disabled,
  tooltipText = "",
}) => {
  return (
    <Menu.Item>
      {/* <Tooltip label={disabled && <span>{tooltipText}</span>} placement="top"> */}
      <button
        className="inline-flex hover:bg-gray-50 items-center justify-between p-4 disabled:opacity-40 disabled:hover:bg-white"
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
      {/* </Tooltip> */}
    </Menu.Item>
  );
};

export default memo(SelectLiquidityModal);
