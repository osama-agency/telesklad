import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ProTableStyle2Skeleton() {
  return (
    <Table className="overflow-hidden rounded-lg bg-white">
      <TableHeader>
        <TableRow className="bg-primary uppercase text-white hover:bg-primary [&>th]:py-4 [&>th]:text-current">
          <TableHead className="pl-5 lg:pl-7.5 2xl:pl-11">Name</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="pr-5 lg:pr-7.5 2xl:pr-11">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow className="text-base font-medium [&>td]:py-4" key={index}>
            <TableCell colSpan={100}>
              <Skeleton className="h-6" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
