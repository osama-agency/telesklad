import React from "react";
import { ShowcaseSection } from "../Layouts/showcase-section";
import { Progress } from "../ui-elements/progress";

const ProgressOne: React.FC = () => {
  return (
    <ShowcaseSection title="Progress Style 1" className="space-y-7">
      <Progress progress={85} />

      <Progress progress={65} />

      <Progress progress={90} />
    </ShowcaseSection>
  );
};

export default ProgressOne;
