import { TrashIcon } from "@/assets/icons";
import DropdownDefault from "@/components/DropdownDefault";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import Image from "next/image";
import { getLeadReportData } from "../fetch";

export async function LeadsReport() {
  const data = await getLeadReportData();

  return (
    <div className="col-span-12">
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-start justify-between p-4 sm:p-6 xl:p-7.5">
          <h2 className="text-[22px] font-bold text-black dark:text-white">
            Leads Report
          </h2>

          <DropdownDefault />
        </div>

        <Table>
          <TableHeader>
            <TableRow className="text-base [&>th]:px-4 md:[&>th]:px-6 xl:[&>th]:px-7.5">
              <TableHead className="min-w-40">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="min-w-40">Project</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((item, i) => (
              <TableRow
                key={i}
                className="border-none text-base font-medium [&>td]:px-4 md:[&>td]:px-6 xl:[&>td]:px-7.5"
              >
                <TableCell>
                  <figure className="flex items-center gap-4.5">
                    <Image
                      src={item.avatar}
                      className="rounded-full"
                      width={44}
                      height={44}
                      alt={item.name}
                      quality={100}
                    />

                    <figcaption className="truncate font-medium">
                      {item.name}
                    </figcaption>
                  </figure>
                </TableCell>
                <TableCell>
                  <a className="hover:underline" href={`mailto:${item.email}`}>
                    {item.email}
                  </a>
                </TableCell>

                <TableCell>
                  {dayjs(item.project.startDate).format("DD MMM YYYY")} -{" "}
                  {dayjs(item.project.endDate).format("DD MMM YYYY")}
                </TableCell>

                <TableCell>{item.duration}</TableCell>

                <TableCell>
                  <span
                    className={cn(
                      "inline-block truncate rounded px-2.5 py-1 text-sm font-medium capitalize",
                      {
                        "bg-[#FB5454]/[0.08] text-red":
                          item.status === "lost lead",
                        "bg-[#10B981]/[0.08] text-green":
                          item.status === "active",
                      },
                    )}
                  >
                    {item.status}
                  </span>
                </TableCell>

                <TableCell className="text-center">
                  <button title="Delete" className="hover:text-rose-500">
                    <span className="sr-only">Delete row</span>

                    <TrashIcon />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
