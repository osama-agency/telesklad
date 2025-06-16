import { PeriodPicker } from "@/components/period-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { standardFormat } from "@/lib/format-number";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";
import { getLatestTransactionsData } from "../../fetch";
import { PolygonUp } from "../icons";

export async function LatestTransaction(props: { timeFrame?: string }) {
  // A fallback value of 7 days is used if Number() returns NaN
  const days = Number(props.timeFrame?.match(/\d+/g)![0]) || 7;
  const data = await getLatestTransactionsData(days);

  return (
    <div className="col-span-12 overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-2 px-5 pb-0 pt-5 sm:px-7.5 sm:pt-7.5">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Latest Transaction
        </h2>

        <PeriodPicker
          sectionKey="latest_transactions"
          items={["Last 7 days", "Last 15 days"]}
          defaultValue={props.timeFrame?.split(":")[1] || "Last 7 days"}
        />
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow className="sr-only">
              <TableHead className="min-w-[250px]">Name</TableHead>
              <TableHead className="min-w-[180px]">Interest Rate</TableHead>
              <TableHead className="min-w-[220px]">Ratio</TableHead>
              <TableHead className="min-w-[200px]">Amount</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((item, i) => (
              <TableRow
                className="border-none text-base font-medium text-dark dark:text-white [&>td]:px-5 sm:[&>td]:px-7.5"
                key={item.date + i}
              >
                <TableCell>
                  <figure className="flex items-end gap-4.5">
                    <div className="grid size-[46px] place-items-center rounded-full bg-[#EEF2F8]">
                      <Image
                        src={item.image}
                        alt={"Logo of" + item.name}
                        className="rounded-full object-cover"
                        quality={100}
                        width={22}
                        height={22}
                      />
                    </div>

                    <figcaption>
                      <div className="truncate font-bold leading-none">
                        {item.name}
                      </div>

                      <Link
                        href={"#"}
                        className="text-xs text-[#6B7280] hover:underline"
                      >
                        Buy Stock
                      </Link>
                    </figcaption>
                  </figure>
                </TableCell>

                <TableCell>
                  <dl className="grid min-w-[100px] gap-1">
                    <dt className="text-xs font-medium text-[#6B7280]">
                      {item.interestRate}%
                    </dt>

                    <dd className="-order-1 truncate">Interest rate</dd>
                  </dl>
                </TableCell>

                <TableCell>
                  <dl>
                    <dt
                      className={cn(
                        "mb-1 flex items-center gap-2 text-sm",
                        item.returnRate > 0 ? "text-green" : "text-red",
                      )}
                    >
                      <PolygonUp
                        className={cn(item.returnRate < 0 && "rotate-180")}
                      />

                      {item.returnRate > 0 ? (
                        <span>{standardFormat(item.returnRate)}%</span>
                      ) : (
                        <span>
                          {standardFormat(item.returnRate).replace("-", "")}%
                        </span>
                      )}
                    </dt>

                    <dd className="text-xs text-[#6B7280]">Ratio</dd>
                  </dl>
                </TableCell>

                <TableCell>
                  <div className="mb-1 text-right">
                    {item.price > 0
                      ? "+$" + standardFormat(item.price)
                      : "-$" + standardFormat(item.price).replace("-", "")}
                  </div>

                  <time
                    dateTime={item.date}
                    className="block text-right text-xs text-[#6B7280]"
                  >
                    {dayjs(item.date).format("DD MMM, YY")}
                  </time>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
