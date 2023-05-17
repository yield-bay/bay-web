import clsx from "clsx";

interface Props {
  children: string | React.ReactNode;
  onButtonClick?: () => void;
  variant: "primary" | "secondary";
  className?: "string";
}

const CButton: React.FC<Props> = ({ children, variant, className }) => (
  <div
    className={clsx(
      "cursor-pointer text-sm leading-5 font-semibold bg-[#36364D] rounded-lg py-[10px] px-4 sm:py-[10px] sm:px-4 focus:outline-none",
      variant == "primary"
        ? "text-[#FFFFFF]"
        : variant == "secondary"
        ? "text-[#FCFCFF]"
        : "",
      className
    )}
  >
    {children}
  </div>
);

export default CButton;
