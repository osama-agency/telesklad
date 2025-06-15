import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DataTableOne from "@/components/DataTables/DataTableOne";
import DataTableTwo from "@/components/DataTables/DataTableTwo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "DataTables",
  // other metadata
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Data Tables" />

      <div className="grid grid-cols-1 gap-5 md:gap-7 2xl:gap-10">
        <DataTableOne />
        <DataTableTwo />
      </div>
    </>
  );
}
