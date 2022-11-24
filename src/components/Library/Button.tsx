import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  size: "small" | "base" | "large";
  style?: string;
  onButtonClick?: () => void;
};

const Button = ({ children, size, style, onButtonClick }: ButtonProps) => {
  return (
    <button
      className={`flex flex-row items-center justify-center ring-2 text-base ring-[#314584] hover:ring-[#455b9c] text-white font-semibold rounded-xl leading-5 transition duration-200 ${style} ${
        size == "small"
          ? "py-2 px-[18px] sm:py-3 sm:px-6"
          : size == "base"
          ? "py-[10.5px] px-6 rounded-[8px]"
          : "py-[10.5px] sm:py-[14.5px] px-6"
      }`}
      onClick={onButtonClick}
    >
      {children}
    </button>
  );
};

export default React.memo(Button);
