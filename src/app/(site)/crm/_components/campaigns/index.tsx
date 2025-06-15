import DropdownDefault from "@/components/DropdownDefault";
import { getCampaignsData } from "../../fetch";
import { CampaignsChart } from "./chart";

export async function Campaigns() {
  const data = await getCampaignsData();

  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-stroke py-6 pl-7.5 pr-9 dark:border-dark-3">
        <h2 className="text-body-2xlg font-bold text-dark dark:text-white">
          Campaigns
        </h2>

        <DropdownDefault />
      </div>

      <div className="px-6 pt-4">
        <CampaignsChart series={data.chart} />
      </div>
    </div>
  );
}
