import Image from "next/image";
import ModalWrapper from "./ModalWrapper";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
  position: any;
}

const RewardsModal = ({ open, setOpen, position }: Props) => {
  const unclaimedRewards = position?.unclaimedRewards;

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
      <div className="flex flex-row justify-between rounded-xl w-full border border-[#EAECF0] p-6 shadow">
        <div className="flex flex-col gap-y-6 justify-between">
          <div className="text-left">
            <p className="mb-1">MOVR-USDC</p>
            <p className="font-normal text-base leading-5 text-[#475467]">
              Solarbeam on Moonriver
            </p>
          </div>
          <div className="flex flex-col gap-y-2 max-w-fit">
            {unclaimedRewards.map((reward: any, index: number) => (
              <div
                key={index}
                className="inline-flex items-center gap-x-2 text-base leading-5"
              >
                <Image
                  src="/moonbeam.svg"
                  alt="reward token"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <p>
                  {reward.amount.toFixed(2)} {reward.token}
                </p>
              </div>
            ))}
          </div>
        </div>
        <button className="shadow py-[10px] h-fit px-4 rounded-lg font-medium text-sm leading-5 hover:bg-gray-50 border border-[#D0D5DD]">
          Claim Rewards
        </button>
      </div>
    </ModalWrapper>
  );
};

export default RewardsModal;
