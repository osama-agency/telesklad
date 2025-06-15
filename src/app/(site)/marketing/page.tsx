import { TopChannels } from "@/app/(site)/(home)/_components/top-channels";
import { CostPerInteraction } from "@/components/Charts/basic/campaign-visitors/cost-per-interaction";
import { CampaignVisitors } from "@/components/Charts/basic/campaign-visitors/last-campaign-performance";
import DataStatsThree from "@/components/DataStats/DataStatsThree";
import DropdownDefault from "@/components/DropdownDefault";
import Feedback from "@/components/Feedback";
import { Metadata } from "next";
import { ExternalLinks } from "./_components/external-links";
import { FeaturedCampaigns } from "./_components/featured-campaigns";

export const metadata: Metadata = {
  title: "Marketing Dashboard",
};

export default async function MarketingPage() {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="mb-1.5 text-body-2xlg font-bold text-dark dark:text-white">
            Highlights
          </h2>
          <p className="font-medium">Latest social statistics</p>
        </div>

        <DropdownDefault triggerType="withBackground" />
      </div>

      <DataStatsThree />

      <div className="mt-7.5 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <ExternalLinks />

        <CampaignVisitors className="col-span-12 xl:col-span-5" />

        <TopChannels className="col-span-12 2xl:col-span-6" />

        <CostPerInteraction className="col-span-12 xl:col-span-6" />

        <FeaturedCampaigns />
        <Feedback />
      </div>
    </>
  );
}
