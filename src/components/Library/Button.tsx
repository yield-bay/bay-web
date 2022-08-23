import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: any;
};

export default function Button({ children, className }: ButtonProps) {
  return (
    <button className="flex flex-row items-center group sm:gap-x-1 px-3 py-1.5 sm:py-[10px] sm:px-6 bg-primaryWhite text-primaryBlue font-semibold text-sm rounded-lg leading-[17px] transition duration-200">
      {children}
    </button>
  );
}
