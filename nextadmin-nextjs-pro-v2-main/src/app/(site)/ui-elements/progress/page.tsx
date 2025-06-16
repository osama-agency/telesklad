import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ProgressFour from "@/components/Progress/ProgressFour";
import ProgressOne from "@/components/Progress/ProgressOne";
import ProgressThree from "@/components/Progress/ProgressThree";
import ProgressTwo from "@/components/Progress/ProgressTwo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Progress",
  // other metadata
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Progress" />

      <div className="space-y-7.5">
        <ProgressOne />
        <ProgressTwo />
        <ProgressThree />
        <ProgressFour />
      </div>
    </>
  );
}
