import Image from "next/image";
import React from "react";
import { ShowcaseSection } from "../../Layouts/showcase-section";

const IMAGES = [
  "/images/cover/cover-03.jpg",
  "/images/cover/cover-04.jpg",
  "/images/cover/cover-05.jpg",
];

const ImagesTwo: React.FC = () => {
  return (
    <ShowcaseSection
      title="Image Grid"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-10"
    >
      {IMAGES.map((image) => (
        <div key={image}>
          <Image
            width={431}
            height={385}
            src={image}
            alt="Cover"
            className="rounded-lg object-cover"
          />
        </div>
      ))}
    </ShowcaseSection>
  );
};

export default ImagesTwo;
