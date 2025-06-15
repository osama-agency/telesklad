import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import { Carousel } from "@/components/ui-elements/carousel";
import { Metadata } from "next";

const IMAGES = [
  "/images/carousel/carousel-01.jpg",
  "/images/carousel/carousel-02.jpg",
  "/images/carousel/carousel-03.jpg",
];

export const metadata: Metadata = {
  title: "Carousel",
  // other metadata
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Carousel" />

      <div className="grid grid-cols-1 gap-7.5">
        <ShowcaseSection title="Slider With Controls">
          <Carousel images={IMAGES} withControls />
        </ShowcaseSection>

        <ShowcaseSection title="Slider With Indicators">
          <Carousel images={IMAGES} withIndicators />
        </ShowcaseSection>

        <ShowcaseSection title="Slider With Controls & Indicators">
          <Carousel images={IMAGES} withControls withIndicators />
        </ShowcaseSection>
      </div>
    </>
  );
}
