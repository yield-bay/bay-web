import React from "react";

type ButtonNewProps = {
  children: React.ReactNode;
  size: "small" | "large";
  onButtonClick?: () => void;
};

const Button = ({ children, size, onButtonClick }: ButtonNewProps) => {
  return (
    <button
      className={`flex flex-row items-center justify-center ring-[3px] ring-[#1C284D] active:ring-0 dark:active:bg-primaryBlue text-primaryBlue dark:text-white dark:hover:text-baseBlueDark dark:active:text-white sm:gap-x-1 font-semibold rounded-lg leading-[14.52px] sm:leading-[17px] transition duration-200 ${
        size == "small"
          ? "py-1.5 px-[18px] sm:py-[10.5px] sm:px-6 text-xs sm:text-base"
          : "py-2 px-[18px] sm:py-3 sm:px-6 text-xs sm:text-base"
      }`}
      onClick={onButtonClick}
    >
      {children}
    </button>
  );
};

export default React.memo(Button);
