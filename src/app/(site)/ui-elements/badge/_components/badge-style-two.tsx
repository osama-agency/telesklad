import { BadgeTwo } from "@/components/Badges/BadgeTwo";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";

export default function StyleTwoBadges() {
  return (
    <ShowcaseSection title="Badge Style 2">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4.5">
        <BadgeTwo variant="primary">Primary</BadgeTwo>
        <BadgeTwo variant="secondary">Secondary</BadgeTwo>
        <BadgeTwo variant="dark">Dark</BadgeTwo>
        <BadgeTwo variant="gray">Gray</BadgeTwo>
        <BadgeTwo variant="light">Light</BadgeTwo>
        <BadgeTwo variant="warning">Warning</BadgeTwo>
        <BadgeTwo variant="danger">Danger</BadgeTwo>
        <BadgeTwo variant="success">Success</BadgeTwo>
        <BadgeTwo variant="info">Info</BadgeTwo>
      </div>
    </ShowcaseSection>
  );
}
