import { cn } from "@/lib/utils";
import { getVisitorsAnalyticsData } from "@/services/charts.services";
import { VisitorsAnalyticsChart } from "./chart";

type PropsType = {
  className?: string;
};

export async function VisitorsAnalytics({ className }: PropsType) {
  const data = await getVisitorsAnalyticsData();
  return (
    <div
      className={cn(
        "rounded-[10px] bg-white px-7.5 pb-1.5 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
    >
      <h2 className="text-2xl font-bold text-dark dark:text-white">
        Visitors Analytics
      </h2>

      <VisitorsAnalyticsChart data={data} />
    </div>
  );
}
