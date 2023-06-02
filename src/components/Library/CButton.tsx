import clsx from "clsx";

interface Props {
  children: string | React.ReactNode;
  onButtonClick?: () => void;
  variant: "primary" | "secondary";
}

const CButton: React.FC<Props> = ({ children, variant }) => (
  <div
    className={clsx(
      "flex flex-row justify-center sm:justify-start items-center gap-x-2 cursor-pointer text-sm leading-5 font-semibold bg-[#36364D] rounded-lg p-3 px-4 sm:py-[10px] sm:px-4 focus:outline-none",
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
