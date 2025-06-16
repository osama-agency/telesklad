import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function MarketMoversSkeleton() {
  return (
    <div className="col-span-12 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      <h2 className="px-4 pb-6 pt-7.5 text-2xl font-bold text-dark dark:text-white sm:px-6 xl:px-7.5">
        Market Movers
      </h2>

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
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow className="border-none" key={i}>
              <TableCell colSpan={100}>
                <Skeleton className="h-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
