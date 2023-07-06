import type { FC } from "react";
import clsx from "clsx";

interface MButtonProps {
  type: "primary" | "secondary";
  isLoading: boolean;
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Modal Button Component
 * @param type - primary, secondary, warning, transparent
 * @param text - Label
 * @param onClick - Button onClick function
 * @param disabled - disabled condition
 * @param className - Button Styling
 */
const MButton: FC<MButtonProps> = ({
  type,
  isLoading,
  text,
  onClick,
  disabled,
  className,
}) => {
  return (
    <button
      disabled={disabled}
      className={clsx(
        "text-base shadow-sm hover:shadow-md active:shadow-sm font-semibold w-full text-[#1D2939] leading-5 py-5 transition duration-100 ease-in-out rounded-lg",
        type === "primary" && "border border-[#99F] bg-[#EDEDFF]",
        type === "secondary" && "border border-[#D0D5DD] bg-[#F9FAFB]",
        isLoading && "border-dashed animate-pulse",
        disabled && "opacity-40 pointer-events-none",
        className ?? ""
      )}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default MButton;
