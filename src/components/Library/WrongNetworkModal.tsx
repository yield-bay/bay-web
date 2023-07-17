import { FC } from "react";
import { useDisconnect, useNetwork, useSwitchNetwork } from "wagmi";
import ModalWrapper from "./ModalWrapper";
import { ModalType } from "@utils/types";
import { formatFirstLetter } from "@utils/farmListMethods";
import { getSupportedChains } from "@utils/network";

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  farmChain: string;
}

const WrongNetworkModal: FC<Props> = ({ isOpen, setIsOpen, farmChain }) => {
  const { chain: evmChain } = useNetwork();
  const { disconnect } = useDisconnect();
  const { switchNetwork } = useSwitchNetwork();
  const chain = getSupportedChains().find(
    (chain) => chain.name.toLowerCase() === farmChain
  );

  return (
    <ModalWrapper open={isOpen} setOpen={setIsOpen} type={ModalType.RED}>
      <div className="flex flex-col justify-center gap-8 text-base font-semibold leading-5 text-[#1D2939]">
        <p className="mt-5">Uh oh.</p>
        <p>You’re on the wrong network.</p>
        <hr className="border-t border-[#E3E3E3] min-w-full" />
        <p className="text-[#AAABAD]">
          Switch to {formatFirstLetter(farmChain)} to Continue.
        </p>
        <div className="w-full inline-flex justify-center items-center gap-x-2">
          <button
            className="px-4 py-[14px] text-base font-bold leading-5 text-white border border-[#D0D5DD] bg-[#E95454] shadow-sm rounded-lg"
            onClick={() => {
              disconnect();
              setIsOpen(false);
            }}
          >
            Disconnect
          </button>
          <button
            className="px-4 py-[14px] text-base font-medium leading-5 border border-[#D0D5DD] bg-[#F9FAFB] shadow-sm rounded-lg"
            onClick={() => {
              switchNetwork?.(chain?.id);
            }}
            disabled={!chain?.id}
          >
            {!chain?.id ? "Unable to find chain" : `Switch to ${chain.name}`}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default WrongNetworkModal;
