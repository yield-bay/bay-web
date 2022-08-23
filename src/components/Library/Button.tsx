import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  type: "primary" | "secondary";
  size: "small" | "large";
  onButtonClick?: () => void;
};

export default function Button({
  children,
  type,
  size,
  onButtonClick,
}: ButtonProps) {
  return (
    <button
      className={`flex flex-row items-center group sm:gap-x-1 font-semibold text-sm rounded-lg leading-[17px] transition duration-200 ${
        size == "small" ? "py-3 px-6" : "py-4 px-8"
      } ${
        type == "primary"
          ? "bg-primaryWhite dark:bg-primaryBlue text-primaryBlue dark:text-primaryWhite"
          : "bg-primaryBlue dark:bg-baseBlueMid text-primaryWhite dark:text-primaryWhite"
      } `}
      onClick={onButtonClick}
    >
      {children}
    </button>
  );
}
