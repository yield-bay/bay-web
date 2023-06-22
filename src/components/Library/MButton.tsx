import type { FC } from "react";
import clsx from "clsx";

interface MButtonProps {
  type: "primary" | "secondary" | "warning" | "transparent";
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const MButton: FC<MButtonProps> = ({
  type,
  text,
  onClick,
  disabled,
  className,
}) => {
  return (
    <button
      disabled={disabled}
      className={clsx(
        "text-center text-base leading-[21.6px] py-[13px] transition duration-100 ease-in-out rounded-lg",
        type === "primary" && "bg-white hover:bg-gray-100 text-black",
        type === "secondary" &&
          "text-white bg-[#1E1E1E] hover:bg-[#252525] active:bg-[#1E1E1E]",
        type === "warning" && "bg-warningRed hover:bg-[#E53C3C]",
        type === "transparent" && "",
        disabled && "opacity-50 pointer-events-none",
        className ?? ""
      )}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default MButton;
