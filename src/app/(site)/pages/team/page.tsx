import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TeamOne from "@/components/Teams/TeamOne";
import TeamTwo from "@/components/Teams/TeamTwo";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teams Page",
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Teams" />

      <div className="flex flex-col gap-7.5">
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="border-b border-stroke px-4 py-4 dark:border-dark-3 sm:px-6 xl:px-9">
            <h3 className="font-medium text-dark dark:text-white">Style 1</h3>
          </div>

          <div className="p-4 sm:p-6 xl:p-9">
            <TeamOne />
          </div>
        </div>

        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="border-b border-stroke px-4 py-4 dark:border-dark-3 sm:px-6 xl:px-9">
            <h3 className="font-medium text-dark dark:text-white">Style 2</h3>
          </div>

          <div className="p-4 sm:p-6 xl:p-9">
            <TeamTwo />
          </div>
        </div>
      </div>
    </>
  );
}
