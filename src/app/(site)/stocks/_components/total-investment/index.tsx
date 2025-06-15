import { PeriodPicker } from "@/components/period-picker";
import { standardFormat } from "@/lib/format-number";
import { PolygonUp } from "../icons";
import { TotalInvestmentChart } from "./chart";

export async function TotalInvestment({ timeFrame }: { timeFrame?: string }) {
  return (
    <div className="col-span-12 rounded-[10px] bg-white px-5 pb-5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card sm:px-7.5 xl:col-span-7">
      <div className="mb-5.5 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Total Investment
        </h2>

        <PeriodPicker
          sectionKey="total_investment"
          items={["Last 7 days", "Last 15 days"]}
          defaultValue={timeFrame?.split(":")[1] || "Last 7 days"}
        />
      </div>

      <dl className="mb-3 flex flex-wrap gap-6">
        <div className="grid">
          <dt className="flex items-center gap-2.5 font-medium">
            <div className="text-dark dark:text-white">
              ${standardFormat(1279.95)}
            </div>

            <div className="flex items-center gap-1 text-green">
              <span>
                <span className="sr-only">
                  {1.22 > 0 ? "Increased by" : "Decreased by"}
                </span>{" "}
                1.22%
              </span>

              <PolygonUp />
            </div>
          </dt>

          <dd className="-order-1 text-body-sm font-medium">Invested Value</dd>
        </div>

        <div className="grid">
          <dt className="flex items-center gap-2.5 font-medium">
            <div className="text-dark dark:text-white">
              ${standardFormat(22543.87)}
            </div>

            <div className="flex items-center gap-1 text-green">
              <span>
                <span className="sr-only">
                  {1.22 > 0 ? "Increased by" : "Decreased by"}
                </span>{" "}
                10.14%
              </span>

              <PolygonUp />
            </div>
          </dt>

          <dd className="-order-1 text-body-sm font-medium">Total Returns</dd>
        </div>
      </dl>

      <TotalInvestmentChart />
    </div>
  );
}
