import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import InvoiceOne from "@/components/Invoice/InvoiceOne";
import InvoiceTwo from "@/components/Invoice/InvoiceTwo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoice",
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Invoice" />

      <div className="flex flex-col gap-10">
        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="border-b border-stroke px-4 py-6 dark:border-dark-3 sm:px-6 xl:px-9">
            <h3 className="text-[22px] font-bold leading-7 text-dark dark:text-white">
              Style 1
            </h3>
          </div>

          <div className="p-4 sm:p-6 xl:p-9">
            <InvoiceOne />
          </div>
        </div>

        <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
          <div className="border-b border-stroke px-4 py-6 dark:border-dark-3 sm:px-6 xl:px-9">
            <h3 className="text-[22px] font-bold leading-7 text-dark dark:text-white">
              Style 2
            </h3>
          </div>

          <div className="p-4 sm:p-6 xl:p-9">
            <InvoiceTwo />
          </div>
        </div>
      </div>
    </>
  );
}
