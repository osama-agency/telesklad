import DropdownDefault from "@/components/DropdownDefault";
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
import { getMarketMoversData } from "../../fetch";
import { PolygonUp } from "../icons";

export async function MarketMovers() {
  const data = await getMarketMoversData();

  return (
    <div className="col-span-12 overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="flex items-center justify-between px-4 pb-6 pt-7.5 sm:px-6 xl:px-7.5">
        <h2 className="text-2xl font-bold text-dark dark:text-white">
          Market Movers
        </h2>

        <DropdownDefault />
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-t text-base [&>th:last-child]:border-r-0 [&>th]:h-auto [&>th]:border-r [&>th]:px-7.5 [&>th]:py-3 [&>th]:dark:border-dark-3 sm:[&>th]:py-4.5">
            <TableHead className="min-w-[200px]">Symbol</TableHead>
            <TableHead className="min-w-[230px]">Name</TableHead>
            <TableHead className="min-w-[180px]">Price</TableHead>
            <TableHead className="min-w-[220px]">1D Change</TableHead>
            <TableHead className="min-w-[200px]">1D Return %</TableHead>
            <TableHead className="min-w-[200px]">Volume</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <TableRow
              className="border-none text-base font-medium text-dark dark:text-white [&>td:last-child]:border-r-0 [&>td]:border-r [&>td]:px-7.5 [&>td]:dark:border-dark-3"
              key={item.symbol}
            >
              <TableCell className="flex min-w-fit items-center gap-3 border-r dark:border-dark-3">
                <div>{item.symbol}</div>
              </TableCell>

              <TableCell>{item.name}</TableCell>

              <TableCell>${item.price}</TableCell>

              {item.changeRate > 0 ? (
                <TableCell className="flex items-center gap-2 text-green-light-1">
                  <PolygonUp />
                  <span>${standardFormat(item.changeRate)}</span>
                </TableCell>
              ) : (
                <TableCell className="flex items-center gap-2 text-red">
                  <PolygonUp className="rotate-180" />

                  <span>
                    ${standardFormat(item.changeRate).replace("-", "")}
                  </span>
                </TableCell>
              )}

              <TableCell
                className={cn(
                  "text-green-light-1",
                  item.returnRate < 0 && "text-red",
                )}
              >
                {item.returnRate}%
              </TableCell>

              <TableCell>${standardFormat(item.volume)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
