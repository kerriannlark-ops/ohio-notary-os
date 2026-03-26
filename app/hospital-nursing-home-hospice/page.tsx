import { PublicHero } from "@/components/public-hero";
import { SectionCard } from "@/components/section-card";

export default function CareFacilitiesPage() {
  return (
    <div className="space-y-6">
      <PublicHero title="Hospital, nursing home, and hospice notarization support." subtitle="Readiness, awareness, access, and witness logistics are confirmed before the appointment so bedside visits go smoothly." />
      <SectionCard title="Before you book" eyebrow="Facility checklist">
        <ul className="space-y-3">
          <li>- Confirm the signer can properly appear and communicate.</li>
          <li>- Confirm unit, room, and visitor access details.</li>
          <li>- Let us know if witnesses, family, or staff coordination is needed.</li>
        </ul>
      </SectionCard>
    </div>
  );
}
