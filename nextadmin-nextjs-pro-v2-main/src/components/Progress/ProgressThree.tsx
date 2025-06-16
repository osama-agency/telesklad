import React from "react";
import { ShowcaseSection } from "../Layouts/showcase-section";
import { Progress } from "../ui-elements/progress";

const ProgressThree: React.FC = () => {
  return (
    <ShowcaseSection title="Progress Style 3" className="space-y-7">
      <Progress
        progress={50}
        className={{
          wrapper: "h-4",
        }}
        withLabel
      />

      <Progress
        progress={80}
        className={{
          wrapper: "h-4",
        }}
        withLabel
      />
      <Progress
        progress={75}
        className={{
          wrapper: "h-4",
        }}
        withLabel
      />
    </ShowcaseSection>
  );
};

export default ProgressThree;
