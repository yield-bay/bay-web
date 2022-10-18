import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  size: "small" | "large";
  onButtonClick?: () => void;
};

const Button = ({ children, size, onButtonClick }: ButtonProps) => {
  return (
    <button
      className={`flex flex-row items-center justify-center ring-2 text-base ring-[#1C284D] hover:ring-[#314173] text-primaryBlue dark:text-white font-semibold rounded-xl leading-5 transition duration-200 ${
        size == "small"
          ? "py-2 px-[18px] sm:py-3 sm:px-6"
          : "py-[10.5px] sm:py-[14.5px] px-6"
      }`}
      onClick={onButtonClick}
    >
      {children}
    </button>
  );
};

export default React.memo(Button);
