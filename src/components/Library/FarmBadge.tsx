type FarmBadgeProps = {
  type: string;
};

export default function FarmBadge({ type }: FarmBadgeProps) {
  return (
    <div className="flex px-5 py-[2px] rounded-full w-max bg-[#EAEAF1]">
      <span className="font-medium text-[11px] leading-5 text-[#475467]">
        {type}
      </span>
    </div>
  );
}
