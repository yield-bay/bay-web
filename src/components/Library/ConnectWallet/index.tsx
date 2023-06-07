import ClientOnly from "@components/Common/ClientOnly";
import { useAccount } from "wagmi";
import { useAtom } from "jotai";
import { dotAccountAtom } from "@store/accountAtoms";
import ConnectBtnDot from "./ConnectBtnDot";
import ConnectBtnEvm from "./ConnectBtnEvm";
import CButton from "@components/Library/CButton";
import SelectAccountMenu from "./SelectAccountMenu";

const ConnectWallet = () => {
  const { address, isConnected } = useAccount();
  const [account] = useAtom(dotAccountAtom);

  return (
    <ClientOnly>
      {isConnected || account ? (
        <div className="flex flex-col sm:flex-row gap-3">
          {isConnected && (
            <>
              <ConnectBtnEvm address={address} />
              {!account && (
                <SelectAccountMenu>
                  <div className="rounded-lg font-semibold text-xl leading-6 text-[#FCFCFF] bg-[#36364D] py-2 px-[13px]">
                    +
                  </div>
                </SelectAccountMenu>
              )}
            </>
          )}
          {account && (
            <>
              <ConnectBtnDot />
              {!isConnected && (
                <SelectAccountMenu>
                  <div className="rounded-lg font-semibold text-xl leading-6 text-[#FCFCFF] bg-[#36364D] py-2 px-[13px]">
                    +
                  </div>
                </SelectAccountMenu>
              )}
            </>
          )}
        </div>
      ) : (
        // When none of the wallets are connected
        <SelectAccountMenu>
          <CButton variant="secondary">Connect Wallet</CButton>
        </SelectAccountMenu>
      )}
    </ClientOnly>
  );
};

export default ConnectWallet;
