import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { PaginationOne } from "@/components/ui-elements/pagination/pagination-one";
import PaginationThree from "@/components/ui-elements/pagination/pagination-three";
import PaginationTwo from "@/components/ui-elements/pagination/pagination-two";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pagination",
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Pagination" />

      <div className="flex flex-col gap-7.5">
        <ShowcaseSection className="xl:p-7.5" title="Pagination Style 1">
          <PaginationOne currentPage={3} totalPages={10} />
        </ShowcaseSection>

        <ShowcaseSection className="xl:p-7.5" title="Pagination Style 2">
          <PaginationTwo currentPage={3} totalPages={5} />
        </ShowcaseSection>

        <ShowcaseSection className="xl:p-7.5" title="Pagination Style 3">
          <PaginationThree currentPage={3} totalPages={5} />
        </ShowcaseSection>
      </div>
    </>
  );
}
