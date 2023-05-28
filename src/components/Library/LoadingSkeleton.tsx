export default function LoadingSkeleton() {
  const lengthArray: number[] = [1, 2, 3, 4, 5];
  return (
    <>
      {lengthArray.map((ele: number) => (
        <tr key={ele}>
          {/* FARM NAME, CHAIN, PROTOCOL */}
          <td className="whitespace-nowrap max-w-[288px] py-8 pl-8 md:pl-14 lg:pl-28">
            <div>
              <div className="flex flex-col gap-y-[10px]">
                <div>
                  <div className="w-[122px] h-[25px] bg-gray-300 rounded-2xl animate-shiny" />
                </div>
                <div>
                  <div className="h-[17px] w-36 bg-gray-300 rounded-2xl animate-shiny" />
                </div>
                <div className="w-32 h-5 bg-gray-300 rounded-[3px] animate-shiny" />
              </div>
            </div>
          </td>
          {/* FARM ASSETS */}
          <td className="hidden lg:table-cell whitespace-nowrap">
            <div className="flex flex-row items-center justify-center -space-x-2">
              <div className="z-10 flex overflow-hidden rounded-full ring-[3px] ring-gray-300 animate-shiny">
                <div className="h-12 w-12 rounded-full bg-gray-300 animate-shiny" />
              </div>
              <div className="z-10 flex overflow-hidden rounded-full ring-[3px] ring-gray-300 animate-shiny">
                <div className="h-12 w-12 rounded-full bg-gray-300 animate-shiny" />
              </div>
              <div className="z-10 flex overflow-hidden rounded-full ring-[3px] ring-gray-300 animate-shiny">
                <div className="h-12 w-12 rounded-full bg-gray-300 animate-shiny" />
              </div>
              <div className="z-10 flex overflow-hidden rounded-full ring-[3px] ring-gray-300 animate-shiny">
                <div className="h-12 w-12 rounded-full bg-gray-300 animate-shiny" />
              </div>
            </div>
          </td>
          {/* TVL */}
          <td className="whitespace-nowrap py-8 sm:pr-3 sm:pl-4">
            <div className="w-full flex justify-end">
              <div className="h-[17px] w-[53px] bg-gray-300 rounded-2xl animate-shiny" />
            </div>
          </td>
          {/* APR */}
          <td className="whitespace-nowrap py-8 pl-0 pr-2">
            <div className="w-full inline-flex justify-end items-center gap-x-2">
              <div className="h-[17px] w-[53px] bg-gray-300 rounded-2xl animate-shiny" />
              <div className="h-[17px] w-[17px] bg-gray-300 rounded-2xl animate-shiny"></div>
            </div>
          </td>
          {/* REWARDS */}
          <td className="hidden md:table-cell whitespace-nowrap max-w-[130px] h-full py-0 sm:pl-6 pr-10">
            <div className="flex flex-row items-center justify-start -space-x-2">
              <div className="z-10 flex overflow-hidden rounded-full ring-2 ring-gray-300 animate-shiny">
                <div className="h-6 w-6 rounded-full bg-gray-300 animate-shiny" />
              </div>
              <div className="z-10 flex overflow-hidden rounded-full ring-2 ring-gray-300 animate-shiny">
                <div className="h-6 w-6 rounded-full bg-gray-300 animate-shiny" />
              </div>
            </div>
          </td>
          {/* SAFETY SCORE */}
          <td className="hidden md:table-cell whitespace-nowrap max-w-[130px] h-full py-0 pl-0 lg:pl-16 pr-3 text-blueSilver font-bold text-base leading-5 tracking-wide">
            <div className="flex flex-row items-center justify-end">
              <div className="h-6 w-[65px] rounded-full bg-gray-300 animate-shiny" />
            </div>
          </td>
          <td className="whitespace-nowrap max-w-[288px] py-4 pr-0 md:pr-6 lg:pr-14">
            <div className="flex flex-row gap-x-3 items-center justify-start lg:justify-center">
              {/* Share Farm */}
              <div>
                <div className="h-12 w-12 rounded-lg bg-gray-300 animate-shiny" />
              </div>
              {/* CTA Button */}
              <div className="h-[51px] w-[142px] bg-gray-300 rounded-lg animate-shiny" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
