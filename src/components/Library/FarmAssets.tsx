import Image from "next/image";

type FarmAssetsProps = {
  logos: string[];
};

export default function FarmAssets({ logos }: FarmAssetsProps) {
  return (
    <div className="max-w-[150px] flex justify-end my-3">
      <div className="hidden md:flex flex-row items-center justify-center -space-x-3">
        {logos.map((logo: string, index: number) => (
          <div
            key={index}
            className="z-10 flex overflow-hidden ring-[3px] ring-white dark:ring-neutral-500 rounded-full bg-white dark:bg-neutral-800"
          >
            <Image src={logo} alt={logo} width={48} height={48} />
          </div>
        ))}
      </div>
    </div>
  );
}
