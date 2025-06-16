import { ShowcaseSection } from "../Layouts/showcase-section";
import { Progress } from "../ui-elements/progress";

const ProgressFour = () => {
  return (
    <ShowcaseSection title="Progress Style 4" className="space-y-7">
      <Progress progress={85} />

      <Progress
        progress={65}
        className={{
          progress: "bg-green",
        }}
      />

      <Progress
        progress={90}
        className={{
          progress: "bg-[#F9C107]",
        }}
      />

      <Progress
        progress={35}
        className={{
          progress: "bg-[#DC3545]",
        }}
      />

      <Progress
        progress={25}
        className={{
          progress: "bg-[#3BA2B8]",
        }}
      />
    </ShowcaseSection>
  );
};

export default ProgressFour;
