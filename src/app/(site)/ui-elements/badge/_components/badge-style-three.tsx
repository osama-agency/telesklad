import { BadgeThree } from "@/components/Badges/BadgeThree";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";

export default function StyleThreeBadges() {
  return (
    <ShowcaseSection title="Badge Style 3">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4.5">
        <BadgeThree variant="primary">Primary</BadgeThree>
        <BadgeThree variant="secondary">Secondary</BadgeThree>
        <BadgeThree variant="dark">Dark</BadgeThree>
        <BadgeThree variant="gray">Gray</BadgeThree>
        <BadgeThree variant="light">Light</BadgeThree>
        <BadgeThree variant="warning">Warning</BadgeThree>
        <BadgeThree variant="danger">Danger</BadgeThree>
        <BadgeThree variant="success">Success</BadgeThree>
        <BadgeThree variant="info">Info</BadgeThree>
      </div>
    </ShowcaseSection>
  );
}
