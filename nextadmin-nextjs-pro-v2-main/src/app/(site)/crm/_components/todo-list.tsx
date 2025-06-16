import DropdownDefault from "@/components/DropdownDefault";
import { Calendar } from "@/components/Layouts/sidebar/icons";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import Image from "next/image";
import { getTodoList } from "../fetch";
import { ClockIcon } from "./icons";

export async function TodoList() {
  const data = await getTodoList();

  return (
    <div className="col-span-12 xl:col-span-7">
      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-between border-b border-stroke px-4 py-4 dark:border-dark-3 md:px-6 md:py-6 xl:px-7.5">
          <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
            To Do List
          </h2>

          <DropdownDefault />
        </div>

        <ul className="space-y-6 px-4 py-4 md:px-6 md:py-6 xl:px-7.5">
          {data.map((item, key) => (
            <li className="flex items-center gap-4.5" key={key}>
              <div className="size-8 items-center justify-center rounded-full border border-stroke bg-gray-1 dark:border-dark-3 dark:bg-dark-2 xsm:flex sm:size-15">
                <Image
                  src={item.logo}
                  className="size-6"
                  width={32}
                  height={32}
                  alt={"Icon for project: " + item.title}
                />
              </div>

              <div>
                <h3 className="mb-2 font-medium text-dark dark:text-white">
                  {item.title}
                </h3>

                <dl className="flex flex-wrap gap-2 gap-x-5 gap-y-2 sm:items-center">
                  <dt className="flex items-center gap-1.5">
                    <ClockIcon />

                    <span>
                      <time
                        dateTime={item.datetime.start}
                        className="text-body-xs font-medium"
                      >
                        {dayjs(item.datetime.start).format("hh:mm A")}
                      </time>
                      {" - "}
                      <time
                        dateTime={item.datetime.end}
                        className="text-body-xs font-medium"
                      >
                        {dayjs(item.datetime.end).format("hh:mm A")}
                      </time>
                    </span>
                  </dt>
                  <dd className="sr-only">Time</dd>

                  <dt className="flex items-center gap-1.5">
                    <Calendar className="w-4" />

                    <time
                      dateTime={item.datetime.end}
                      className="text-body-xs font-medium"
                    >
                      {dayjs(item.datetime.end).format("DD MMM, YYYY")}
                    </time>
                  </dt>

                  <dd className="sr-only">Date</dd>
                </dl>
              </div>

              <div
                className={cn(
                  "ml-auto rounded px-2.5 py-[5px] text-sm font-medium",
                  {
                    "bg-[#10B981]/[0.08] text-green":
                      item.status === "Completed",
                    "bg-primary/[0.08] text-primary":
                      item.status === "Upcoming",
                    "bg-[#FB5454]/[0.08] text-red": item.status === "Canceled",
                  },
                )}
              >
                <span className="sr-only">Status</span> {item.status}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
