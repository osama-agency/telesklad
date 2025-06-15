import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ButtonsGroupOne from "@/components/ButtonsGroups/ButtonsGroupOne";
import ButtonsGroupTwo from "@/components/ButtonsGroups/ButtonsGroupTwo";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Button Groups",
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Buttons Group" />

      <div className="flex flex-col gap-7.5">
        <ButtonsGroupOne />
        <ButtonsGroupTwo />
      </div>
    </>
  );
}
