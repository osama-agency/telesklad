import { PolygonUp } from "@/app/(site)/stocks/_components/icons";
import { PeriodPicker } from "@/components/period-picker";
import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { getMyStocksData } from "../../fetch";

export async function MyStocks(props: { timeFrame?: string }) {
  const timePeriod = props.timeFrame?.split(":")[1];
  const data = await getMyStocksData(timePeriod);

  return (
    <div className="col-span-12 overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark xl:col-span-5">
      <div className="mb-7.5 flex flex-wrap items-center justify-between gap-2 p-7.5 pb-0">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          My Stocks
        </h2>

        <PeriodPicker
          sectionKey="my_stocks"
          defaultValue={timePeriod || "monthly"}
        />
      </div>

      <ul>
        {data.map((item, key) => (
          <li
            key={key}
            className="flex items-center justify-between px-7.5 py-3.5 hover:bg-[#F8FAFD] dark:hover:bg-dark-2"
          >
            <figure className="flex items-center gap-3">
              <Image
                src={item.image}
                className="rounded-full object-cover"
                alt="brand"
                width={40}
                height={40}
                quality={100}
              />

              <figcaption className="text-sm">
                <div className="font-bold leading-6 text-dark dark:text-white">
                  {item.name}
                </div>

                <div className="font-medium">{item.share} Shares</div>
              </figcaption>
            </figure>

            <dl className="text-right">
              <dt className="mb-1 font-medium text-dark dark:text-white">
                ${item.price}
              </dt>
              <dd className="sr-only">Price</dd>

              <dt
                className={cn(
                  "mb-1 flex items-center justify-end gap-1.5 text-xs font-medium",
                  item.returnRate > 0 ? "text-green" : "text-red",
                )}
              >
                {item.returnRate > 0 ? (
                  <span>{standardFormat(item.returnRate)}%</span>
                ) : (
                  <span>
                    {standardFormat(item.returnRate).replace("-", "")}%
                  </span>
                )}

                <PolygonUp
                  className={cn(item.returnRate < 0 && "rotate-180")}
                />
              </dt>

              <dd className="sr-only">Return rate</dd>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
