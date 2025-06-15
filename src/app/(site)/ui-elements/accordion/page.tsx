import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import type { Metadata } from "next";
import { AccordionStyleOne } from "./_components/style-one";
import { AccordionStyleTwo } from "./_components/style-two";

export const metadata: Metadata = {
  title: "Accordion",
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Accordion" />

      <div className="space-y-7.5">
        <AccordionStyleOne />
        <AccordionStyleTwo />
      </div>
    </>
  );
}
