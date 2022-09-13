import { idQueryAtom } from "@store/atoms";
import { useAtom } from "jotai";

export default function MobileLoadingSkeleton() {
  const [idQuery] = useAtom(idQueryAtom);
  const lengthArray: number[] = idQuery ? [1] : [1, 2, 3, 4, 5];

  return (
    <>
      {lengthArray.map((ele) => (
        <div
          key={ele}
          className="w-full p-9 border-b border-blueSilver dark:border-[#222A39] transition-all duration-200"
        >
          {/* Upper Container for left and right */}
          <div className="flex flex-row justify-between">
            {/* LEFT */}
            <div className="flex flex-col gap-y-[6px]">
              <div className="mb-[18px]">
                <div className="flex flex-row justify-start -gap-x-2">
                  {[1, 2, 3, 4].map((ele, index) => (
                    <div key={index}>
                      <div className="z-10 flex overflow-hidden ring-2 ring-white dark:ring-baseBlueDark rounded-full bg-white dark:bg-neutral-800 transition duration-200 animate-shiny">
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-baseBlueMid animate-shiny" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
      ))}
    </>
  );
}
