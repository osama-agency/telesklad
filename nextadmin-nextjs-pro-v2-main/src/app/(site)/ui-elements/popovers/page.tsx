import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { AllPopovers } from "./_components/all-popovers";
import { PopoverWithButtons } from "./_components/popover-with-button";

export const metadata: Metadata = {
  title: "Popovers",
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Popovers" />

      <div className="flex flex-col gap-7.5">
        <AllPopovers />
        <PopoverWithButtons />
      </div>
    </>
  );
}
