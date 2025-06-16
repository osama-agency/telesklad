"use client";

import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import ImageResize from "@/js/image-resize";
import Image from "next/image";
import React, { useEffect } from "react";

const ImagesOne: React.FC = () => {
  useEffect(() => {
    ImageResize();
  });

  return (
    <ShowcaseSection title="Responsive Image">
      <div className="relative">
        <div id="pane" className="overflow-hidden rounded-lg">
          <Image
            src={"/images/cover/cover-02.jpg"}
            width={1374}
            height={520}
            alt="Cover"
          />
        </div>
        <div
          id="ghostpane"
          className="absolute left-0 top-0 duration-300 ease-in-out"
        ></div>
      </div>
    </ShowcaseSection>
  );
};

export default ImagesOne;
