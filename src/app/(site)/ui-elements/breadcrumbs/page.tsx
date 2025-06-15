import PageBreadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { HomeIcon } from "@/components/Layouts/sidebar/icons";
import { Breadcrumb } from "@/components/ui-elements/breadcrumb";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Breadcrumbs",
  // other metadata
};

const breadcrumbItems = [
  { label: "Home", href: "#" },
  { label: "Projects", href: "#projects" },
  { label: "Marketing" },
];

export default function Page() {
  return (
    <>
      <PageBreadcrumb pageName="Breadcrumb" />

      <div className="flex flex-col gap-7.5">
        <ShowcaseSection title="Breadcrumb Style 1">
          <Breadcrumb items={breadcrumbItems} />
        </ShowcaseSection>

        <ShowcaseSection title="Breadcrumb Style 2">
          <Breadcrumb
            items={breadcrumbItems}
            prefixIcon={<HomeIcon width={20} height={20} />}
          />
        </ShowcaseSection>

        <ShowcaseSection title="Breadcrumb Style 3">
          <Breadcrumb items={breadcrumbItems} divider="slash" />
        </ShowcaseSection>
      </div>
    </>
  );
}
