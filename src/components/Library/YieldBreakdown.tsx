import Tippy from "@tippyjs/react/headless";
import { QuestionMarkCircleIcon } from "@heroicons/react/solid";

type YieldProps = {
  base: number;
  reward: number;
};

export default function YieldBreakdown({ base, reward }: YieldProps) {
  return (
    <BreakdownTooltip base={base} reward={reward}>
      <QuestionMarkCircleIcon className="w-5 h-5 text-primaryBlue opacity-90 outline-none" />
    </BreakdownTooltip>
  );
}

// Customized Tooltip for Breakdown
function BreakdownTooltip({
  children,
  base,
  reward,
}: {
  children: React.ReactElement;
} & YieldProps) {
  return (
    <Tippy
      render={(attrs) => (
        <div
          className="box text-base font-bold text-baseBlueMid dark:text-white p-3 shadow-md rounded-lg max-w-sm bg-blueSilver dark:bg-baseBlue border-2 border-baseBlueMid dark:border-primaryBlue"
          tabIndex={-1}
          {...attrs}
        >
          <p>
            Base: <span className="font-bold">{base.toFixed(2)}%</span>
          </p>
          <p>
            Reward: <span className="font-bold">{reward.toFixed(2)}%</span>
          </p>
        </div>
      )}
    >
      {children}
    </Tippy>
  );
}
