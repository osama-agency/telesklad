import Modals from "@/components/Modals";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Modals",
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Modals" />

      <Modals />
    </>
  );
}
