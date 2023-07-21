import Image from "next/image";
import ModalWrapper from "./ModalWrapper";
import {
  formatFirstLetter,
  formatTokenSymbols,
  getLpTokenSymbol,
} from "@utils/farmListMethods";
import {
  ModalType,
  PortfolioPositionType,
  UnclaimedRewardType,
} from "@utils/types";
import clsx from "clsx";
import { useAtom } from "jotai";
import { claimModalOpenAtom } from "@store/commonAtoms";
import { selectedPositionAtom } from "@store/atoms";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  positions: PortfolioPositionType[];
}

const RewardsModal = ({ open, setOpen, positions }: Props) => {
  const [, setOpenClaimRewardsModal] = useAtom(claimModalOpenAtom);
  const [, setSelectedPosition] = useAtom(selectedPositionAtom);
  return (
    <ModalWrapper open={open} setOpen={setOpen} type={ModalType.DEFAULT}>
      <div className="flex flex-col items-center gap-y-4 mx-auto">
        <Image
          src="/icons/RewardsIcon.svg"
          alt="unclaimed rewards"
          width={64}
          height={64}
        />
        <p>Unclaimed Rewards</p>
      </div>
      {positions.map((position, index) => {
        const unclaimedRewards: UnclaimedRewardType[] =
          position?.unclaimedRewards;
        const totalUnclaimedAmount = unclaimedRewards.reduce(
          (acc, reward) => acc + reward.amount,
          0
        );
        const tokenNames = formatTokenSymbols(position?.lpSymbol);
        return (
          <div
            key={index}
            className={clsx(
              "flex flex-col gap-y-3 items-start sm:gap-y-0 sm:flex-row justify-between rounded-xl w-full border border-[#EAECF0] p-6 shadow",
              totalUnclaimedAmount == 0 && "hidden"
            )}
          >
            <div className="flex flex-col gap-y-6 justify-between">
              <div className="text-left">
                <p className="mb-1">{getLpTokenSymbol(tokenNames)}</p>
                <p className="font-normal text-base leading-5 text-[#475467]">
                  {formatFirstLetter(position?.protocol)} on{" "}
                  {formatFirstLetter(position?.chain)}
                </p>
              </div>
              <div className="flex flex-col gap-y-2 max-w-fit">
                {unclaimedRewards.map(
                  (reward: UnclaimedRewardType, index: number) => {
                    return (
                      <div
                        key={index}
                        className="inline-flex items-center gap-x-2 text-base leading-5"
                      >
                        <Image
                          src={`https://raw.githubusercontent.com/yield-bay/assets/main/list/${reward.token.toUpperCase()}.png`}
                          alt={reward.token + "_logo"}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <span>
                          {reward.amount >= 0.01
                            ? parseFloat(
                                reward.amount.toFixed(2)
                              ).toLocaleString("en-US")
                            : "<0.01"}{" "}
                          {reward.token}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedPosition(position);
                setOpen(false);
                setOpenClaimRewardsModal(true);
              }}
              className="shadow py-[10px] h-fit px-4 rounded-lg font-medium text-sm leading-5 hover:bg-gray-50 border border-[#D0D5DD]"
            >
              Claim Rewards
            </button>
          </div>
        );
      })}
    </ModalWrapper>
  );
};

export default RewardsModal;
