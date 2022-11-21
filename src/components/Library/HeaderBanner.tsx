import { XIcon } from "@heroicons/react/solid";

type HeaderBannerProps = {
  note: string;
  isBanner: boolean;
  setIsBanner: (value: boolean) => void;
};

const HeaderBanner = ({ note, isBanner, setIsBanner }: HeaderBannerProps) => {
  return isBanner ? (
    <div className="hidden md:flex flex-row items-center absolute left-[180px] top-10 lg:top-9 lg:left-0 lg:right-0 mx-auto bg-[#010813] text-white select-none rounded-xl py-[14px] px-[19px] gap-x-6 font-spaceGrotesk max-w-[340px] lg:max-w-sm">
      <span className="text-xs lg:text-sm">{note}</span>
      <XIcon
        onClick={() => setIsBanner(false)}
        className="text-[#999999] w-[28px]"
      />
    </div>
  ) : (
    <></>
  );
};

export default HeaderBanner;
