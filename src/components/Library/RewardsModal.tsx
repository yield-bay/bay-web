import Image from "next/image";
import ModalWrapper from "./ModalWrapper";
import {
  farmURL,
  formatFirstLetter,
  getLpTokenSymbol,
} from "@utils/farmListMethods";
import Link from "next/link";
import { UnclaimedRewardType } from "@utils/types";
import clsx from "clsx";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  positions: any[];
}

const RewardsModal = ({ open, setOpen, positions }: Props) => {
  return (
    <ModalWrapper open={open} setOpen={setOpen}>
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
                <p className="mb-1">{getLpTokenSymbol(position?.lpSymbol)}</p>
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
            <Link
              href={farmURL({
                id: position?.id,
                protocol: position?.protocol,
                asset: {
                  symbol: position?.lpSymbol,
                },
              })}
              rel="noreferrer"
              target="_blank"
            >
              <button
                onClick={() => setOpen(false)}
                className="shadow py-[10px] h-fit px-4 rounded-lg font-medium text-sm leading-5 hover:bg-gray-50 border border-[#D0D5DD]"
              >
                Claim Rewards
              </button>
            </Link>
          </div>
        );
      })}
    </ModalWrapper>
  );
};

export default RewardsModal;
