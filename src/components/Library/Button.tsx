import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  type: "primary" | "secondary" | "tertiary";
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
      className={`flex flex-row items-center group sm:gap-x-1 font-semibold text-base rounded-lg leading-[17px] transition duration-200 ${
        size == "small" ? "py-3 px-6" : "py-4 px-8"
      } ${
        type == "primary"
          ? "bg-primaryWhite dark:bg-primaryBlue hover:ring-[3px] dark:hover:bg-primaryWhite dark:hover:ring-0 ring-[#82B0FF] active:ring-0 dark:active:bg-primaryBlue text-primaryBlue dark:text-white dark:hover:text-baseBlueDark dark:active:text-white transition duration-200"
          : type == "secondary"
          ? "bg-primaryBlue dark:bg-blueSilver hover:ring-[3px] active:ring-2 dark:active:ring-0 ring-[#82B0FF] dark:ring-primaryBlue text-primaryWhite dark:text-baseBlueDark transition duration-200"
          : "bg-bodyGray dark:bg-baseBlueMid text-primaryBlue dark:text-blueSilver"
      } `}
      onClick={onButtonClick}
    >
      {children}
    </button>
  );
}
