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
          ? "bg-primaryWhite dark:bg-primaryBlue text-primaryBlue dark:text-white"
          : type == "secondary"
          ? "bg-primaryBlue dark:bg-blueSilver text-primaryWhite dark:text-baseBlueDark"
          : "bg-bodyGray dark:bg-baseBlueMid text-primaryBlue dark:text-blueSilver"
      } `}
      onClick={onButtonClick}
    >
      {children}
    </button>
  );
}
