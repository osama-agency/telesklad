import { PaymentsOverview } from "@/components/Charts/advanced/payments-overview";
import { UsedDevices } from "@/components/Charts/basic/used-devices";
import DataStatsFour from "@/components/DataStats/DataStatsFour";
import { PeriodPicker } from "@/components/period-picker";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { Metadata } from "next";
import { Suspense } from "react";
import { Campaigns } from "./_components/campaigns";
import { LeadsReport } from "./_components/leads-report";
import { TodoList } from "./_components/todo-list";

export const metadata: Metadata = {
  title: "CRM Dashboard",
};

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function CRMPage(props: PropsType) {
  const { selected_time_frame } = await props.searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  return (
    <>
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          {"This Week's Overview"}
        </h2>

        <div className="flex items-center gap-2.5">
          <p className="font-medium uppercase text-dark dark:text-white">
            Sort by:
          </p>

          <PeriodPicker
            sectionKey="activity_chart"
            defaultValue="current week"
            items={["current week", "last week"]}
            minimal
          />
        </div>
      </div>

      <DataStatsFour />

      <div className="mt-7.5 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <Suspense key={extractTimeFrame("payments_overview")}>
          <PaymentsOverview
            timeFrame={extractTimeFrame("payments_overview")?.split(":")[1]}
            className="col-span-12 xl:col-span-7"
          />
        </Suspense>

        <Suspense key={extractTimeFrame("used_devices")}>
          <UsedDevices
            timeFrame={extractTimeFrame("used_devices")?.split(":")[1]}
            className="col-span-12 xl:col-span-5"
          />
        </Suspense>

        <LeadsReport />

        <div className="col-span-12 xl:col-span-5">
          <Campaigns />
        </div>

        <TodoList />
      </div>
    </>
  );
}
