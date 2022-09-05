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
          className="tooltip"
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
