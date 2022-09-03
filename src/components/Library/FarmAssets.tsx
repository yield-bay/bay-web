import Image from "next/image";

type FarmAssetsProps = {
  logos: string[];
};

export default function FarmAssets({ logos }: FarmAssetsProps) {
  return (
    <div className="flex max-w-[150px] justify-end my-3">
      <div className="flex flex-row items-center justify-center -space-x-3">
        {logos.map((logo: string, index: number) => (
          <div
            key={index}
            className="z-10 flex overflow-hidden ring-[3px] ring-white dark:ring-baseBlueMid rounded-full bg-white dark:bg-neutral-800 transition duration-200"
          >
            <Image src={logo} alt={logo} width={48} height={48} />
          </div>
        ))}
      </div>
    </div>
  );
}
