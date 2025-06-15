import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

import type { Metadata } from "next";
import StyleFourBadges from "./_components/badge-style-four";
import StyleOneBadges from "./_components/badge-style-one";
import StyleThreeBadges from "./_components/badge-style-three";
import StyleTwoBadges from "./_components/badge-style-two";

export const metadata: Metadata = {
  title: "Badge",
  // other metadata
};

export default function Page() {
  return (
    <>
      <Breadcrumb pageName="Badge" />

      <div className="flex flex-col gap-7.5">
        <StyleOneBadges />
        <StyleTwoBadges />
        <StyleThreeBadges />
        <StyleFourBadges />
      </div>
    </>
  );
}
