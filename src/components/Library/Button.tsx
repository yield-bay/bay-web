import clsx from "clsx";
import { ReactNode, memo } from "react";
import Tooltip from "./Tooltip";

type ButtonProps = {
  children: ReactNode;
  size: "small" | "base" | "large" | "custom";
  style?: string;
  disabled?: boolean;
  onButtonClick?: () => void;
  tooltipText?: string;
};

const Button = ({
  children,
  size,
  style,
  disabled,
  onButtonClick,
  tooltipText = "",
}: ButtonProps) => {
  return (
    <Tooltip label={disabled && <span>{tooltipText}</span>} placement="top">
      <button
        className={clsx(
          "ring-1 ring-[#D0D5DD] text-[#1D2939] font-medium text-sm leading-5 rounded-lg shadow-farmBtn",
          "disabled:opacity-40",
          style,
          size == "large"
            ? "py-[10px] px-4 bg-[#F9FAFB]"
            : size == "custom"
            ? "py-[10px] px-4"
            : size == "base"
            ? "py-[10.5px] px-6 rounded-[8px] bg-[#F9FAFB]"
            : "py-2 px-[18px] sm:py-3 sm:px-6 bg-[#F9FAFB]"
        )}
        disabled={disabled}
        onClick={onButtonClick}
      >
        {children}
      </button>
    </Tooltip>
  );
};

export default memo(Button);
