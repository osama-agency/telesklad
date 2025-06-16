import { BadgeFour } from "@/components/Badges/BadgeFour";
import { ShowcaseSection } from "@/components/Layouts/showcase-section";

export default function StyleFourBadges() {
  return (
    <ShowcaseSection title="Badge Style 4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4.5">
        <BadgeFour variant="primary">Primary</BadgeFour>
        <BadgeFour variant="secondary">Secondary</BadgeFour>
        <BadgeFour variant="dark">Dark</BadgeFour>
        <BadgeFour variant="gray">Gray</BadgeFour>
        <BadgeFour variant="light">Light</BadgeFour>
        <BadgeFour variant="warning">Warning</BadgeFour>
        <BadgeFour variant="danger">Danger</BadgeFour>
        <BadgeFour variant="success">Success</BadgeFour>
        <BadgeFour variant="info">Info</BadgeFour>
      </div>
    </ShowcaseSection>
  );
}
