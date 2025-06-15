import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { PaymentsOverview } from "@/components/Charts/advanced/payments-overview";
import { WeeksProfit } from "@/components/Charts/advanced/profit";
import { VisitorsAnalytics } from "@/components/Charts/advanced/visitors-analytics";
import { CostPerInteraction } from "@/components/Charts/basic/campaign-visitors/cost-per-interaction";
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advanced Chart",
};

type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};

export default async function Page(props: PropsType) {
  const { selected_time_frame } = await props.searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  return (
    <>
      <Breadcrumb pageName="Advanced Chart" />

      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <VisitorsAnalytics className="col-span-12" />

        <PaymentsOverview
          key={extractTimeFrame("payments_overview")}
          timeFrame={extractTimeFrame("payments_overview")?.split(":")[1]}
          className="col-span-12 xl:col-span-7"
        />

        <WeeksProfit
          key={extractTimeFrame("weeks_profit")}
          timeFrame={extractTimeFrame("weeks_profit")?.split(":")[1]}
          className="col-span-12 xl:col-span-5"
        />

        <CostPerInteraction />
      </div>
    </>
  );
};
