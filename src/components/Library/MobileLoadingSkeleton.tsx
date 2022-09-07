export default function MobileLoadingSkeleton() {
  const lengthArray: number[] = [1, 2, 3];
  return (
    <>
      <div
        // key={ele}
        className="w-full p-9 border-b border-blueSilver dark:border-[#222A39] transition-all duration-200"
      >
        {/* Upper Container for left and right */}
        <div className="flex flex-row justify-between">
          {/* LEFT */}
          <div className="flex flex-col gap-y-[6px]">
            <td className="hidden lg:table-cell whitespace-nowrap">
              <div className="flex flex-row items-center justify-center -space-x-2">
                <div className="z-10 flex overflow-hidden rounded-full ring-[3px] ring-white dark:ring-baseBlueMid animate-shiny">
                  <div className="h-9 w-9 rounded-full bg-bodyGray dark:bg-baseBlueMid animate-shiny" />
                </div>
                <div className="z-10 flex overflow-hidden rounded-full ring-[3px] ring-white dark:ring-baseBlueMid animate-shiny">
                  <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-baseBlueMid animate-shiny" />
                </div>
              </div>
            </td>
            <div>
              <div className="w-[122px] h-[17px] bg-slate-200 dark:bg-baseBlueMid rounded-2xl animate-shiny" />
            </div>
            <div>
              <div className="h-[17px] w-36 bg-bodyGray dark:bg-baseBlueMid rounded-2xl animate-shiny" />
            </div>
            <div className="w-32 h-3 bg-slate-300 dark:bg-baseBlueMid rounded-[3px] animate-shiny" />
          </div>
          {/* RIGHT */}
          <div className="flex flex-col gap-y-[18px] font-medium font-spaceGrotesk text-right">
            <div className="w-full flex justify-end">
              <div className="h-[17px] w-[53px] bg-bodyGray dark:bg-baseBlueMid rounded-2xl animate-shiny" />
            </div>
            <div className="w-full inline-flex justify-end items-center gap-x-2">
              <div className="h-[17px] w-[53px] bg-bodyGray dark:bg-baseBlueMid rounded-2xl animate-shiny" />
              <div className="h-[17px] w-[17px] bg-bodyGray dark:bg-baseBlueMid rounded-2xl animate-shiny"></div>
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-x-3 justify-between mt-9">
          <div>
            <div className="h-12 w-[54px] rounded-lg bg-slate-200 dark:bg-baseBlueMid animate-shiny" />
          </div>
          <div className="h-12 w-[251px] bg-bodyGray dark:bg-baseBlueMid rounded-lg animate-shiny" />
        </div>
      </div>
      <div
        // key={ele}
        className="w-full p-9 border-b border-blueSilver dark:border-[#222A39] transition-all duration-200"
      >
        {/* Upper Container for left and right */}
        <div className="flex flex-row justify-between">
          {/* LEFT */}
          <div className="flex flex-col gap-y-[6px]">
            <td className="hidden lg:table-cell whitespace-nowrap">
              <div className="flex flex-row items-center justify-center -space-x-2">
                <div className="z-10 flex overflow-hidden rounded-full ring-[3px] ring-white dark:ring-baseBlueMid animate-shiny">
                  <div className="h-9 w-9 rounded-full bg-bodyGray dark:bg-baseBlueMid animate-shiny" />
                </div>
                <div className="z-10 flex overflow-hidden rounded-full ring-[3px] ring-white dark:ring-baseBlueMid animate-shiny">
                  <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-baseBlueMid animate-shiny" />
                </div>
              </div>
            </td>
            <div>
              <div className="w-[122px] h-[17px] bg-slate-200 dark:bg-baseBlueMid rounded-2xl animate-shiny" />
            </div>
            <div>
              <div className="h-[17px] w-36 bg-bodyGray dark:bg-baseBlueMid rounded-2xl animate-shiny" />
            </div>
            <div className="w-32 h-3 bg-slate-300 dark:bg-baseBlueMid rounded-[3px] animate-shiny" />
          </div>
          {/* RIGHT */}
          <div className="flex flex-col gap-y-[18px] font-medium font-spaceGrotesk text-right">
            <div className="w-full flex justify-end">
              <div className="h-[17px] w-[53px] bg-bodyGray dark:bg-baseBlueMid rounded-2xl animate-shiny" />
            </div>
            <div className="w-full inline-flex justify-end items-center gap-x-2">
              <div className="h-[17px] w-[53px] bg-bodyGray dark:bg-baseBlueMid rounded-2xl animate-shiny" />
              <div className="h-[17px] w-[17px] bg-bodyGray dark:bg-baseBlueMid rounded-2xl animate-shiny"></div>
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-x-3 justify-between mt-9">
          <div>
            <div className="h-12 w-[54px] rounded-lg bg-slate-200 dark:bg-baseBlueMid animate-shiny" />
          </div>
          <div className="h-12 w-[251px] bg-bodyGray dark:bg-baseBlueMid rounded-lg animate-shiny" />
        </div>
      </div>
      <div
        // key={ele}
        className="w-full p-9 border-b border-blueSilver dark:border-[#222A39] transition-all duration-200"
      >
        {/* Upper Container for left and right */}
        <div className="flex flex-row justify-between">
          {/* LEFT */}
          <div className="flex flex-col gap-y-[6px]">
            <td className="hidden lg:table-cell whitespace-nowrap">
              <div className="flex flex-row items-center justify-center -space-x-2">
                <div className="z-10 flex overflow-hidden rounded-full ring-[3px] ring-white dark:ring-baseBlueMid animate-shiny">
                  <div className="h-9 w-9 rounded-full bg-bodyGray dark:bg-baseBlueMid animate-shiny" />
                </div>
                <div className="z-10 flex overflow-hidden rounded-full ring-[3px] ring-white dark:ring-baseBlueMid animate-shiny">
                  <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-baseBlueMid animate-shiny" />
                </div>
              </div>
            </td>
            <div>
              <div className="w-[122px] h-[17px] bg-slate-200 dark:bg-baseBlueMid rounded-2xl animate-shiny" />
            </div>
            <div>
              <div className="h-[17px] w-36 bg-bodyGray dark:bg-baseBlueMid rounded-2xl animate-shiny" />
            </div>
            <div className="w-32 h-3 bg-slate-300 dark:bg-baseBlueMid rounded-[3px] animate-shiny" />
          </div>
          {/* RIGHT */}
          <div className="flex flex-col gap-y-[18px] font-medium font-spaceGrotesk text-right">
            <div className="w-full flex justify-end">
              <div className="h-[17px] w-[53px] bg-bodyGray dark:bg-baseBlueMid rounded-2xl animate-shiny" />
            </div>
            <div className="w-full inline-flex justify-end items-center gap-x-2">
              <div className="h-[17px] w-[53px] bg-bodyGray dark:bg-baseBlueMid rounded-2xl animate-shiny" />
              <div className="h-[17px] w-[17px] bg-bodyGray dark:bg-baseBlueMid rounded-2xl animate-shiny"></div>
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-x-3 justify-between mt-9">
          <div>
            <div className="h-12 w-[54px] rounded-lg bg-slate-200 dark:bg-baseBlueMid animate-shiny" />
          </div>
          <div className="h-12 w-[251px] bg-bodyGray dark:bg-baseBlueMid rounded-lg animate-shiny" />
        </div>
      </div>
    </>
  );
}
