import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ChartEight from "@/components/Charts/ChartEight";
import DownloadList from "@/components/DownloadList";
import StorageChart from "@/components/Storage/StorageChart";
import StorageList from "@/components/Storage/StorageList";
import FileDetailsList from "./_components/file-details-list";

export default function FileManagerPage() {
  return (
    <>
      <Breadcrumb pageName="File Manager" />

      <FileDetailsList />

      <div className="mt-7.5 grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-8">
          <ChartEight />
        </div>

        <div className="col-span-12 xl:col-span-4">
          <div className="flex flex-col gap-4 sm:flex-row md:gap-6 xl:flex-col xl:gap-7.5">
            <StorageChart />
            <StorageList />
          </div>
        </div>

        <DownloadList />
      </div>
    </>
  );
}
