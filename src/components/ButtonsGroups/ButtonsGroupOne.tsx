import { ShowcaseSection } from "@/components/Layouts/showcase-section";
import React from "react";
import { ButtonGroup } from ".";

export const BUTTONS = [
  { label: "About" },
  { label: "Profile" },
  { label: "Services" },
];

const ButtonsGroupOne: React.FC = () => {
  return (
    <ShowcaseSection
      title="Buttons Group One"
      className="space-y-6 p-4 sm:p-5 xl:p-7.5"
    >
      <ButtonGroup activeIndex={0} items={BUTTONS} />

      <ButtonGroup activeIndex={0} shape={"rounded"} items={BUTTONS} />

      <ButtonGroup activeIndex={0} shape={"full"} items={BUTTONS} />
    </ShowcaseSection>
  );
};

export default ButtonsGroupOne;
