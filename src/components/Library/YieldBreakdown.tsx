import Tippy from "@tippyjs/react/headless";
import { QuestionMarkCircleIcon } from "@heroicons/react/solid";
import Tooltip from "./Tooltip";

type YieldProps = {
  base: number;
  reward: number;
};

export default function YieldBreakdown({ base, reward }: YieldProps) {
  return (
    <Tooltip
      content={
        <>
          <p>
            Base: <span className="font-bold">{base.toFixed(2)}%</span>
          </p>
          <p>
            Reward: <span className="font-bold">{reward.toFixed(2)}%</span>
          </p>
        </>
      }
    >
      <QuestionMarkCircleIcon className="w-5 h-5 text-primaryBlue opacity-90 outline-none" />
    </Tooltip>
  );
}
