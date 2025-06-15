import { ShowcaseSection } from "../Layouts/showcase-section";
import { Progress } from "../ui-elements/progress";

const ProgressTwo: React.FC = () => {
  return (
    <ShowcaseSection title="Progress Style 2" className="space-y-10">
      <Progress progress={75} withMarker />

      <Progress progress={50} withMarker />

      <Progress progress={80} withMarker />
    </ShowcaseSection>
  );
};

export default ProgressTwo;
