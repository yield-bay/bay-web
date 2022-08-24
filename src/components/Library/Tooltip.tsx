import React from "react";
import Tippy from "@tippyjs/react/headless";

type TooltipProps = {
  children: React.ReactElement;
  content: string;
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
          className="box text-base font-bold text-baseBlueMid dark:text-white p-3 shadow-md rounded-lg max-w-sm bg-blueSilver dark:bg-baseBlue border-2 border-baseBlueMid dark:border-primaryBlue"
          tabIndex={-1}
          onClick={onButtonClick}
          {...attrs}
        >
          <span>{content}</span>
        </div>
      )}
    >
      {children}
    </Tippy>
  );
}
