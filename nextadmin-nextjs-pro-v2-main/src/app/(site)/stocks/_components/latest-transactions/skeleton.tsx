import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function LatestTransactionsSkeleton() {
  return (
    <div className="col-span-12 overflow-hidden rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-2 px-5 pb-0 pt-5 sm:px-7.5 sm:pt-7.5">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Latest Transaction
        </h2>
      </div>

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
          {Array.from({ length: 6 }).map((_, i) => (
            <TableRow className="border-none" key={i}>
              <TableCell className="p-0 pb-1" colSpan={100}>
                <Skeleton className="h-19 rounded-none" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
