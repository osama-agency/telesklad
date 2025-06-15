import DropdownDefault from "@/components/DropdownDefault";
import Image from "next/image";
import Link from "next/link";
import { getMostUsedResources } from "../fetch";
import { SquareArrowOutUpRight } from "../icons";

export async function ExternalLinks() {
  const data = await getMostUsedResources();

  return (
    <div className="col-span-12 rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
      <div className="flex items-start justify-between border-b border-stroke px-6 pb-4.5 pt-5 dark:border-dark-3">
        <div>
          <h2 className="mb-1.5 text-body-2xlg font-bold text-dark dark:text-white">
            External Links
          </h2>
          <p className="text-body-sm font-medium">Most used resources</p>
        </div>

        <DropdownDefault />
      </div>

      <ul className="px-3 py-5">
        {data.map((item, index) => (
          <li key={index}>
            <Link
              href={item.link}
              className="group flex items-center gap-4 rounded-md p-4.5 hover:bg-gray-1 hover:text-primary dark:hover:bg-dark-2"
            >
              <Image
                src={item.icon}
                className="size-6"
                width={24}
                height={24}
                alt={"Icon for " + item.title}
              />

              <span className="font-medium text-dark group-hover:text-current dark:text-white">
                {item.title}
              </span>

              <SquareArrowOutUpRight className="ml-auto" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
