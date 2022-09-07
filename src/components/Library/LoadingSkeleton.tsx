export default function LoadingSkeleton() {
  const lengthArray = [1, 2, 3, 4, 5, 6, 7, 8];
  return (
    // <div className="flex flex-col">
    //   <div>
    //     <div className="inline-block min-w-full align-middle">
    //       <div>
    //         <table className="min-w-full">
    //           <thead className="transition duration-200">
    //             <tr>
    //               <th
    //                 scope="col"
    //                 className="pt-9 pb-6 pr-3 text-left pl-8 md:pl-14 lg:pl-28"
    //               >
    //                 <span>Farm</span>
    //               </th>
    //               <th
    //                 scope="col"
    //                 className="hidden lg:table-cell pt-9 pb-6 pl-4 pr-3 sm:pl-6"
    //               >
    //                 <span className="sr-only">Farm Assets</span>
    //               </th>
    //               <th scope="col" className="px-3 pt-9 pb-6 cursor-pointer">
    //                 <div className="flex justify-end items-center">
    //                   <div>
    //                     <span>TVL</span>
    //                   </div>
    //                 </div>
    //               </th>
    //               <th
    //                 scope="col"
    //                 className="flex justify-end px-3 pt-9 pb-6 cursor-pointer"
    //               >
    //                 <div>
    //                   <span>APR</span>
    //                 </div>
    //               </th>
    //               <th
    //                 scope="col"
    //                 className="hidden md:table-cell px-3 pt-9 pb-6 text-left cursor-pointer"
    //               >
    //                 <span>Rewards</span>
    //               </th>
    //               <th scope="col" className="pt-9 pb-6 pl-4 pr-3 sm:pl-6">
    //                 <span className="sr-only">Go to farm</span>
    //               </th>
    //             </tr>
    //           </thead>
    // <tbody className="divide-y divide-[#D9D9D9] dark:divide-[#222A39] transition duration-200">
    <>
      {lengthArray.map((ele: number) => (
        <tr key={ele}>
          {/* FARM NAME, CHAIN, PROTOCOL */}
          <td className="whitespace-nowrap max-w-[288px] py-8 pl-8 md:pl-14 lg:pl-28">
            <div>
              <div className="flex flex-col gap-y-[10px]">
                <div>
                  <div className="w-[122px] h-[25px] bg-slate-200 dark:bg-baseBlueMid rounded-2xl animate-shiny" />
                </div>
                <div>
                  <div className="h-[17px] w-36 bg-bodyGray dark:bg-baseBlueMid rounded-2xl animate-shiny" />
                </div>
                <div className="w-32 h-5 bg-slate-300 dark:bg-baseBlueMid rounded-[3px] animate-shiny" />
              </div>
            </div>
          </td>
          {/* FARM ASSETS */}
          <td className="hidden lg:table-cell whitespace-nowrap">
            <div className="flex flex-row items-center justify-center -space-x-2">
              <div className="z-10 flex overflow-hidden rounded-full ring-[3px] ring-white dark:ring-baseBlueMid animate-shiny">
                <div className="h-12 w-12 rounded-full bg-bodyGray dark:bg-baseBlueMid animate-shiny" />
              </div>
              <div className="z-10 flex overflow-hidden rounded-full ring-[3px] ring-white dark:ring-baseBlueMid animate-shiny">
                <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-baseBlueMid animate-shiny" />
              </div>
              <div className="z-10 flex overflow-hidden rounded-full ring-[3px] ring-white dark:ring-baseBlueMid animate-shiny">
                <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-baseBlueMid animate-shiny" />
              </div>
              <div className="z-10 flex overflow-hidden rounded-full ring-[3px] ring-white dark:ring-baseBlueMid animate-shiny">
                <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-baseBlueMid animate-shiny" />
              </div>
            </div>
          </td>
          {/* TVL */}
          <td className="whitespace-nowrap py-8 sm:pr-3 sm:pl-4">
            <div className="w-full flex justify-end">
              <div className="h-[17px] w-[53px] bg-bodyGray dark:bg-baseBlueMid rounded-2xl animate-shiny" />
            </div>
          </td>
          {/* APR */}
          <td className="whitespace-nowrap py-8 pl-0 pr-2">
            <div className="w-full inline-flex justify-end items-center gap-x-2">
              <div className="h-[17px] w-[53px] bg-bodyGray dark:bg-baseBlueMid rounded-2xl animate-shiny" />
              <div className="h-[17px] w-[17px] bg-bodyGray dark:bg-baseBlueMid rounded-2xl animate-shiny"></div>
            </div>
          </td>
          {/* REWARDS */}
          <td className="hidden md:table-cell whitespace-nowrap max-w-[130px] h-full py-0 sm:pl-6 pr-10">
            <div className="flex flex-row items-center justify-start -space-x-2">
              <div className="z-10 flex overflow-hidden rounded-full ring-2 ring-white dark:ring-baseBlueMid animate-shiny">
                <div className="h-6 w-6 rounded-full bg-bodyGray dark:bg-baseBlueMid animate-shiny" />
              </div>
              <div className="z-10 flex overflow-hidden rounded-full ring-2 ring-white dark:ring-baseBlueMid animate-shiny">
                <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-baseBlueMid animate-shiny" />
              </div>
            </div>
          </td>
          <td className="whitespace-nowrap max-w-[288px] py-4 pr-0 md:pr-6 lg:pr-14">
            <div className="flex flex-row gap-x-3 items-center justify-start lg:justify-center">
              <div className="">
                <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-baseBlueMid animate-shiny" />
              </div>
              {/* CTA Button */}
              <div className="h-[51px] w-[142px] bg-bodyGray dark:bg-baseBlueMid rounded-lg animate-shiny" />
            </div>
          </td>
        </tr>
      ))}
    </>
    // </tbody>
    //         </table>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
}
