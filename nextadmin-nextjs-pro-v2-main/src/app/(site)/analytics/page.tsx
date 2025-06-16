import { VisitorsAnalytics } from "@/components/Charts/advanced/visitors-analytics";
import { UsedDevices } from "@/components/Charts/basic/used-devices";
import DataStatsTwo from "@/components/DataStats/DataStatsTwo";
import { PeriodPicker } from "@/components/period-picker";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { Metadata } from "next";
import { Suspense } from "react";
import { DatePicker } from "./_components/date-picker";
import { TopChannels } from "./_components/top-channels";
import { TopContent } from "./_components/top-content";
import { TopCountries } from "./_components/top-countries";
import { TopProducts } from "./_components/top-products";
import { TopProductsSkeleton } from "./_components/top-products/skeleton";

export const metadata: Metadata = {
  title: "Analytics Dashboard",
};

type PageProps = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function AnalyticsPage(props: PageProps) {
  const { selected_time_frame } = await props.searchParams;

  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
      <div className="col-span-12 flex flex-wrap items-center justify-between gap-3">
        <DatePicker />

        <PeriodPicker sectionKey="visitors_analytics" />
      </div>

      <VisitorsAnalytics className="col-span-12" />

      <DataStatsTwo />

      <TopCountries />

      <div className="col-span-12 space-y-4 md:space-y-6 xl:col-span-6 xl:space-y-7.5">
        <TopContent />

        <TopChannels />
      </div>

      <Suspense key={extractTimeFrame("used_devices")} fallback={null}>
        <UsedDevices
          timeFrame={extractTimeFrame("used_devices")?.split(":")[1]}
          className="col-span-12 xl:col-span-5"
        />
      </Suspense>

      <div className="col-span-12 xl:col-span-7">
        <Suspense fallback={<TopProductsSkeleton />}>
          <TopProducts />
        </Suspense>
      </div>
    </div>
  );
}
