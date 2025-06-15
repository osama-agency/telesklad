import { BadgeOne } from "@/components/Badges/BadgeOne";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";

export default function StyleOneBadges() {
  return (
    <ShowcaseSection title="Badge Style 1">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4.5">
        <BadgeOne variant="primary">Primary</BadgeOne>
        <BadgeOne variant="secondary">Secondary</BadgeOne>
        <BadgeOne variant="dark">Dark</BadgeOne>
        <BadgeOne variant="gray">Gray</BadgeOne>
        <BadgeOne variant="light">Light</BadgeOne>
        <BadgeOne variant="warning">Warning</BadgeOne>
        <BadgeOne variant="danger">Danger</BadgeOne>
        <BadgeOne variant="success">Success</BadgeOne>
        <BadgeOne variant="info">Info</BadgeOne>
      </div>
    </ShowcaseSection>
  );
}
