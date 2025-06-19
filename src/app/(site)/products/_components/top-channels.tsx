import DropdownDefault from "@/components/DropdownDefault";
import { compactFormat } from "@/lib/format-number";
import { getTopChannels } from "../fetch";

export async function TopChannels() {
  const data = await getTopChannels();

  return (
    <div className="rounded-[10px] bg-white p-4 shadow-1 dark:bg-gray-dark dark:shadow-card sm:p-6 xl:p-7.5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Top Channels
        </h2>

        <DropdownDefault />
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-10 py-2">
          <div className="col-span-6 text-body-sm font-medium">Name</div>

          <div className="col-span-2 pr-3.5 text-right text-body-sm font-medium">
            Views
          </div>

          <div className="col-span-2 text-right text-body-sm font-medium">
            Uniques
          </div>
        </div>

        {data.map((item, index, arr) => {
          const maxViews = Math.max(...arr.map((item) => item.views));

          return (
            <div key={index} className="grid grid-cols-10 [&>div]:py-2">
              <div className="relative z-1 col-span-8 grid grid-cols-8">
                <div
                  className="absolute left-0 top-0 -z-1 h-full rounded bg-gray-2 dark:bg-[#FFFFFF1A] dark:bg-dark-2"
                  style={{ width: (item.views / maxViews) * 100 + "%" }}
                />

                <div className="col-span-6 pl-3.5 text-body-sm font-medium text-dark dark:text-dark-6">
                  {item.name}
                </div>

                <div className="col-span-2 pr-3.5 text-right text-body-sm font-medium text-dark dark:text-dark-6">
                  {compactFormat(item.views)}
                </div>
              </div>

              <div className="col-span-2 text-right text-body-sm font-medium text-dark dark:text-dark-6">
                {compactFormat(item.uniques)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
