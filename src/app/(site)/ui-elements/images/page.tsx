import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import ImagesOne from "@/components/ui-elements/Images/ImagesOne";
import ImagesTwo from "@/components/ui-elements/Images/ImagesTwo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Images",
  // other metadata
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Images" />

      <div className="grid grid-cols-1 gap-7.5">
        <ImagesOne />
        <ImagesTwo />
      </div>
    </>
  );
}
