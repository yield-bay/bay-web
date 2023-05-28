import clsx from "clsx";
import { FC } from "react";

interface Props {
  children: React.ReactNode;
  variant: "default" | "primary" | "secondary" | "tirtiary";
  className?: string;
}

const InfoContainer: FC<Props> = ({ children, variant, className }) => (
  <div
    className={clsx(
      "pt-5 px-6 pb-[17px] border border-[#EAECF0] rounded-xl",
      variant === "default",
      variant === "primary" && "bg-[#FAFAFF]",
      variant === "secondary" && "bg-[#F9FAFB] max-w-[400px] border-0 h-full",
      variant === "tirtiary" && "bg-[#EAFFF2] max-w-[300px] border-0 h-full",
      className
    )}
  >
    {children}
  </div>
);

export default InfoContainer;
