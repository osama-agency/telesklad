import DropdownDefault from "@/components/DropdownDefault";
import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import Image from "next/image";
import type { PropsWithChildren } from "react";
import { getTrendingStocksData } from "../fetch";
import { PolygonUp } from "./icons";

export async function TrendingStocks() {
  const data = await getTrendingStocksData();

  return (
    <div className="col-span-12 rounded-[10px] bg-white px-5 pb-10 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card sm:px-7 xl:col-span-5">
      <div className="mb-7.5 flex items-center justify-between">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Trending Stocks
        </h2>

        <DropdownDefault />
      </div>

      <ul className="space-y-5">
        {data.map((item, key) => (
          <li
            key={key}
            className="rounded-lg border border-stroke p-5 dark:border-dark-3"
          >
            <div className="mb-5.5 flex gap-4">
              <div className="grid size-11.5 place-items-center rounded-full bg-[#EEF2F8]">
                <Image
                  src={item.image}
                  alt={"Logo of " + item.name}
                  className="rounded-full object-cover"
                  width={22}
                  height={22}
                  quality={100}
                />
              </div>

              <div className="flex flex-1 items-center justify-between gap-4.5">
                <div>
                  <div className="font-bold text-dark dark:text-white">
                    {item.name}
                  </div>

                  <p className="text-body-xs font-medium">
                    ${standardFormat(item.gross)}
                  </p>
                </div>

                <dl className={item.returnRate < 0 ? "text-red" : "text-green"}>
                  <dt className="mb-0.5 flex items-center justify-end gap-1 text-xs font-medium">
                    {item.returnRate}%
                    <PolygonUp
                      className={cn({ "rotate-180": item.returnRate < 0 })}
                    />
                  </dt>
                  <dd className="sr-only">Return rate</dd>

                  <dt className="text-right text-xs font-medium">
                    {item.returnRate >= 0 ? "+" : "-"} ${item.price}
                  </dt>
                  <dd className="sr-only">Revenue</dd>
                </dl>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button>Short</Button>
              <Button>Buy</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Button({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <button
      className={cn(
        "flex w-full items-center justify-center rounded-[5px] bg-[#F3F5F8] px-7.5 py-2 text-body-sm font-medium text-dark hover:bg-primary/[0.15] hover:text-primary dark:bg-dark-2 dark:text-white dark:hover:bg-primary/[0.15] dark:hover:text-primary",
        className,
      )}
    >
      {children}
    </button>
  );
}
