export default function FarmStats({
  totalTVL,
  totalFarms,
  totalProtocols,
}: any) {
  return (
    <div className="flex flex-row items-center justify-center gap-x-6 font-spaceGrotesk text-white">
      <Stat value={totalTVL} title="TVL" />
      <Stat value={totalFarms} title="Farms" />
      <Stat value={totalProtocols} title="Protocols" />
    </div>
  );
}

const Stat = ({ value, title }: { value: string; title: string }) => (
  <div>
    <p className="text-2xl leading-[30.5px] font-medium text-blueSilver">
      {value}
    </p>
    <p className="text-sm leading-[18px] font-medium text-blueSilver opacity-70">
      {title}
    </p>
  </div>
);
