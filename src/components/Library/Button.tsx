import clsx from "clsx";
import { ReactNode, memo } from "react";
import Tooltip from "./Tooltip";
import { ButtonType } from "@utils/types/enums";

type ButtonProps = {
  children: ReactNode;
  size: "small" | "base" | "large" | "custom";
  style?: string;
  disabled?: boolean;
  onButtonClick?: () => void;
  tooltipText?: string;
  type?: ButtonType;
};

const Button = ({
  children,
  size,
  style,
  disabled,
  onButtonClick,
  tooltipText = "",
  type = ButtonType.SECONDARY,
}: ButtonProps) => {
  return (
    <Tooltip label={disabled && <span>{tooltipText}</span>} placement="top">
      <button
        className={clsx(
          "font-medium text-sm leading-5 rounded-lg shadow-farmBtn",
          "disabled:opacity-50",
          style,
          type == ButtonType.SECONDARY
            ? "bg-[#F9FAFB] ring-1 ring-[#D0D5DD] text-[#1D2939]"
            : type == ButtonType.PRIMARY
            ? "bg-[#5C5CFF] ring-1 ring-[#5C5CFF] text-white"
            : "",
          size == "large"
            ? "py-[10px] px-4"
            : size == "custom"
            ? "py-[10px] px-4"
            : size == "base"
            ? "py-[10.5px] px-6 rounded-[8px]"
            : "py-2 px-[18px] sm:py-3 sm:px-6"
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
