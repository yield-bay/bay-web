import CountUp from "react-countup";
type FarmStatsProps = {
  totalTVL: number;
  totalFarms: number;
  totalProtocols: number;
};

const tvlFormatter = (tvl: number): [number, string] => {
  if (tvl >= 1000000) {
    return [parseFloat((tvl / 1000000).toFixed(2)), "M"];
  } else if (tvl >= 1000 && tvl < 1000000) {
    return [parseFloat((tvl / 1000).toFixed(2)), "K"];
  }
  return [tvl, ""];
};

export default function FarmStats({
  totalTVL,
  totalFarms,
  totalProtocols,
}: FarmStatsProps) {
  const [tvl, suffix] = tvlFormatter(totalTVL);
  return (
    <div className="flex flex-row items-center justify-center gap-x-5 sm:gap-x-6 font-spaceGrotesk text-white opacity-60">
      <div>
        <p className="text-lg sm:text-2xl leading-6 sm:leading-[30.5px] font-medium">
          <CountUp
            start={0}
            end={tvl}
            duration={0.5}
            separator=","
            decimals={2}
            decimal="."
            prefix="$"
            suffix={suffix}
          />
        </p>
        <p className="text-xs sm:text-sm leading-4 sm:leading-[18px] font-medium opacity-70">
          TVL
        </p>
      </div>
      <Stat value={totalFarms} title="Farms" />
      <Stat value={totalProtocols} title="Protocols" />
    </div>
  );
}

const Stat = ({ value, title }: { value: number; title: string }) => (
  <div>
    <p className="text-lg sm:text-2xl leading-6 sm:leading-[30.5px] font-medium">
      <CountUp start={0} end={value} duration={0.5} delay={0} />
    </p>
    <p className="text-xs sm:text-sm leading-4 sm:leading-[18px] font-medium opacity-70">
      {title}
    </p>
  </div>
);
