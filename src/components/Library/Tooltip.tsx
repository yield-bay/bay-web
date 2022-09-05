import React from "react";
import Tippy from "@tippyjs/react/headless";

type TooltipProps = {
  children: React.ReactElement;
  content: React.ReactElement;
  onButtonClick?: () => void;
};

export default function Tooltip({
  children,
  content,
  onButtonClick,
}: TooltipProps) {
  return (
    <Tippy
      render={(attrs) => (
        <div
          className="text-base font-bold text-primaryBlue dark:text-white p-3 shadow-tooltipLight dark:shadow-tooltipDark rounded-lg max-w-sm bg-bodyGray dark:bg-baseBlue"
          tabIndex={-1}
          onClick={onButtonClick}
          {...attrs}
        >
          {content}
        </div>
      )}
    >
      {children}
    </Tippy>
  );
}
