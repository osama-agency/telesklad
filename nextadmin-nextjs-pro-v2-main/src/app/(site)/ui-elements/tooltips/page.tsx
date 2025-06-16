import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import TooltipsOne from "./_components/TooltipsOne";
import TooltipsTwo from "./_components/TooltipsTwo";

export const metadata: Metadata = {
  title: "Tooltips",
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Tooltips" />

      <div className="flex flex-col gap-7.5">
        <TooltipsOne />
        <TooltipsTwo />
      </div>
    </>
  );
}
