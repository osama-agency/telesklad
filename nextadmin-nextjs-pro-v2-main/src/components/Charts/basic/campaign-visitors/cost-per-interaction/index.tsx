import { TrendingUpIcon } from "@/assets/icons";
import DropdownDefault from "@/components/DropdownDefault";
import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import { getCostsPerInteractionData } from "@/services/charts.services";
import { CostPerInteractionChart } from "./chart";

export async function CostPerInteraction({
  className,
}: {
  className?: string;
}) {
  const data = await getCostsPerInteractionData();

  return (
    <div
      className={cn(
        "col-span-12 flex flex-col rounded-[10px] bg-white px-6 pb-5 pt-6 shadow-1 dark:bg-gray-dark dark:shadow-card sm:px-7.5 xl:col-span-7",
        className,
      )}
    >
      <div className="mb-2.5 flex justify-between">
        <h2 className="text-2xl font-bold leading-none text-dark dark:text-white">
          Campaign Visitors
        </h2>

        <DropdownDefault />
      </div>

      <dl className="grid max-w-fit grid-cols-2 gap-x-4.5">
        <dt className="col-span-full row-start-1 text-[28px] font-bold leading-none text-dark dark:text-white">
          ${standardFormat(data.avg_cost)}
        </dt>

        <dd className="col-span-full mt-1 font-medium">
          Average cost per interaction
        </dd>

        <dt
          className={cn(
            "col-start-2 row-start-1 flex items-center justify-center gap-1 text-body-sm font-medium text-green",
            data.growth < 0 && "text-red",
          )}
        >
          {data.growth > 0 ? (
            <>
              <TrendingUpIcon className="rotate-6" />
              <span>+{data.growth}%</span>
            </>
          ) : (
            <>
              <TrendingUpIcon className="rotate-6 scale-y-[-1]" />
              <span>-{data.growth}%</span>
            </>
          )}
        </dt>
        <dd className="sr-only">
          Cost per interaction {data.growth > 0 ? "increased" : "decreased"} by
        </dd>
      </dl>

      <CostPerInteractionChart chartSeries={data.chart} />
    </div>
  );
}
