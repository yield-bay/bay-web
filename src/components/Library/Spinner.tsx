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

export default Spinner;
