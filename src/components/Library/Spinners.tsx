import Image from "next/image";

const Spinner = () => {
  return (
    <Image
      className="animate-spin"
      src="/icons/SpinnerIcon.svg"
      alt="Spinner"
      height={24}
      width={24}
    />
  );
};

const ProcessSpinner = () => {
  return (
    <Image
      className="animate-spin"
      src="/icons/ProcessSpinner.svg"
      alt="Spinner"
      height={44}
      width={44}
    />
  );
};

export { Spinner, ProcessSpinner };
