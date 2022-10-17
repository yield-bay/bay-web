import React from "react";

type ButtonNewProps = {
  children: React.ReactNode;
  size: "small" | "large";
  onButtonClick?: () => void;
};

const Button = ({ children, size, onButtonClick }: ButtonNewProps) => {
  return (
    <button
      className={`flex flex-row items-center justify-center ring-2 text-xs sm:text-base ring-[#1C284D] hover:ring-[#314173] text-primaryBlue dark:text-white font-semibold rounded-xl leading-[14.52px] sm:leading-[17px] transition duration-200 ${
        size == "small"
          ? "py-1.5 px-[18px] sm:py-[14.5px] sm:px-6"
          : "py-2 px-[18px] sm:py-3 sm:px-6"
      }`}
      onClick={onButtonClick}
    >
      {children}
    </button>
  );
};

export default React.memo(Button);
