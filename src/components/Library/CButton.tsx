import clsx from "clsx";

interface Props {
  children: string | React.ReactNode;
  onButtonClick?: () => void;
  variant: "primary" | "secondary";
}

const CButton: React.FC<Props> = ({ children, variant }) => (
  <div
    className={clsx(
      "inline-flex items-center gap-x-2 cursor-pointer text-sm leading-5 font-semibold bg-[#36364D] rounded-lg py-[10px] px-4 sm:py-[10px] sm:px-4 focus:outline-none",
      variant == "primary"
        ? "text-[#FFFFFF]"
        : variant == "secondary"
        ? "text-[#FCFCFF]"
        : ""
    )}
  >
    {children}
  </div>
);

export default CButton;
