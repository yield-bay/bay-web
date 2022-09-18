type FarmBadgeProps = {
  type: string;
};

export default function FarmBadge({ type }: FarmBadgeProps) {
  return (
    <div className="flex px-[9px] sm:px-3 py-[3px] sm:py-1 bg-bodyGray rounded-[3px] sm:rounded-[4px] w-max dark:bg-[#001942] transition duration-200">
      <span className="font-bold font-montserrat text-[8px] sm:text-[10px] leading-[9.75px] sm:leading-3 tracking-[0.36em] text-primaryBlue dark:text-white uppercase">
        {type}
      </span>
    </div>
  );
}
