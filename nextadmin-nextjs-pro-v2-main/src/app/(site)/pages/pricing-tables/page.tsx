import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import PricingTableOne from "@/components/PricingTables/PricingTableOne";
import PricingTableTwo from "@/components/PricingTables/PricingTableTwo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing Table",
};

export default function PricingTablePage() {
  return (
    <>
      <Breadcrumb pageName="Pricing Table" />

      <div className="flex flex-col gap-5 md:gap-7 2xl:gap-10">
        <PricingTableOne />
        <PricingTableTwo />
      </div>
    </>
  );
}
