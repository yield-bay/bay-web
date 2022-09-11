export default function FarmStats({
  totalTVL,
  totalFarms,
  totalProtocols,
}: any) {
  return (
    <div className="flex flex-row items-center justify-center gap-x-5 sm:gap-x-6 font-spaceGrotesk text-white">
      <Stat value={totalTVL} title="Tracking TVL" />
      <Stat value={totalFarms} title="Farms" />
      <Stat value={totalProtocols} title="Protocols" />
    </div>
  );
}

const Stat = ({ value, title }: { value: string; title: string }) => (
  <div>
    <p className="text-lg sm:text-2xl leading-6 sm:leading-[30.5px] font-medium text-blueSilver">
      {value}
    </p>
    <p className="text-xs sm:text-sm leading-4 sm:leading-[18px] font-medium text-blueSilver opacity-70">
      {title}
    </p>
  </div>
);
