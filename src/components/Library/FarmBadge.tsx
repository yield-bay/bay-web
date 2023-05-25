type FarmBadgeProps = {
  type: string;
};

export default function FarmBadge({ type }: FarmBadgeProps) {
  return (
    <div className="flex px-[9px] sm:px-5 py-[3px] sm:py-[2px] rounded-full w-max bg-[#EAEAF1]">
      <span className="font-medium text-[8px] sm:text-[11px] leading-[9.75px] sm:leading-5 text-[#475467]">
        {type}
      </span>
    </div>
  );
}
