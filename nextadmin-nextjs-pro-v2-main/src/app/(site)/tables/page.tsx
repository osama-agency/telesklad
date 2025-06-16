import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { TopChannels } from "../(home)/_components/top-channels";
import { TopProducts } from "../analytics/_components/top-products";
import { InvoiceTable } from "./_components/invoice-table";

export const metadata: Metadata = {
  title: "Tables",
};

export default async function Page() {
  return (
    <>
      <Breadcrumb pageName="Tables" />

      <div className="space-y-10">
        <TopChannels />
        <TopProducts />
        <InvoiceTable />
      </div>
    </>
  );
}
