import clsx from "clsx";
import { ReactNode, memo } from "react";

type ButtonProps = {
  children: ReactNode;
  size: "small" | "base" | "large";
  style?: string;
  onButtonClick?: () => void;
};

const Button = ({ children, size, style, onButtonClick }: ButtonProps) => {
  return (
    <button
      className={clsx(
        "ring-1 bg-[#F9FAFB] ring-[#D0D5DD] text-[#1D2939] font-medium text-sm leading-5 rounded-lg transition duration-200 shadow-farmBtn",
        style,
        size == "large"
          ? "py-[10px] px-4"
          : size == "base"
          ? "py-[10.5px] px-6 rounded-[8px]"
          : "py-2 px-[18px] sm:py-3 sm:px-6"
      )}
      onClick={onButtonClick}
    >
      {children}
    </button>
  );
};

export default memo(Button);
