import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProTable2Data } from "../../fetch";
import { RowActions } from "./row-actions";

export async function ProTableStyle2() {
  const data = await getProTable2Data();

  return (
    <div className="overflow-hidden rounded-lg">
      <Table className="bg-white dark:bg-gray-dark dark:text-[#F5F7FD]">
        <TableHeader>
          <TableRow className="bg-primary uppercase text-white hover:bg-primary dark:hover:bg-primary [&>th]:py-4 [&>th]:text-current [&>th]:dark:text-white">
            <TableHead className="pl-5 lg:pl-7.5 2xl:pl-11">Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="pr-5 text-center lg:pr-7.5 2xl:pr-11">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user, index) => (
            <TableRow className="text-base font-medium [&>td]:py-4" key={index}>
              <TableCell className="truncate pl-5 lg:pl-7.5 2xl:pl-11">
                {user.name}
              </TableCell>

              <TableCell className="truncate">{user.position}</TableCell>

              <TableCell>
                <a href={`mailto:${user.email}`} className="hover:underline">
                  {user.email}
                </a>
              </TableCell>

              <TableCell>{user.role}</TableCell>

              <TableCell className="pr-5 lg:pr-7.5 2xl:pr-11">
                <RowActions />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
