import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import TabOne from "@/components/ui-elements/tabs/tab-one";
import TabThree from "@/components/ui-elements/tabs/tab-three";
import TabTwo from "@/components/ui-elements/tabs/tab-two";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tabs",
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Tabs" />

      <div className="space-y-7">
        <TabOne />
        <TabTwo />
        <TabThree />
      </div>
    </>
  );
}
