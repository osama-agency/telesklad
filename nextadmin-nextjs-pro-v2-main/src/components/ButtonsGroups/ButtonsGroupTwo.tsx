import { DesignToolsIcon, MessageOutlineIcon, UserIcon } from "@/assets/icons";
import { ButtonGroup } from ".";
import { ShowcaseSection } from "../Layouts/showcase-section";

const BUTTONS = [
  { label: "About", icon: <UserIcon /> },
  { label: "Profile", icon: <MessageOutlineIcon /> },
  { label: "Services", icon: <DesignToolsIcon /> },
];

const ButtonsGroupTwo = () => {
  return (
    <ShowcaseSection
      title="Buttons Group Two"
      className="space-y-6 p-4 sm:p-5 xl:p-7.5"
    >
      <ButtonGroup activeIndex={0} items={BUTTONS} />

      <ButtonGroup
        activeIndex={0}
        shape={"rounded"}
        size={"small"}
        items={BUTTONS}
      />

      <ButtonGroup activeIndex={0} shape={"full"} items={BUTTONS} />
    </ShowcaseSection>
  );
};

export default ButtonsGroupTwo;
