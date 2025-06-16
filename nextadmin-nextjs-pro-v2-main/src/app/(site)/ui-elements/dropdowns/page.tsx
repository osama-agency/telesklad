import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Dropdowns } from "@/components/ui-elements/dropdowns";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dropdowns",
  // other metadata
};

const ITEMS = ["Dashboard", "Settings", "Earnings", "Logout"];

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Dropdowns" />

      <div className="flex flex-col gap-7.5">
        <Dropdowns items={ITEMS} triggerText="Dropdown Button" />
        <Dropdowns variant="two" items={ITEMS} triggerText="Dropdown Button" />
        <Dropdowns
          variant="three"
          items={ITEMS}
          triggerText="Dropdown Button"
        />
      </div>
    </>
  );
}
