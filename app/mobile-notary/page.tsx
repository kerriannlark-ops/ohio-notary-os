import { PublicHero } from "@/components/public-hero";
import { SectionCard } from "@/components/section-card";

export default function MobileNotaryPage() {
  return (
    <div className="space-y-6">
      <PublicHero title="Mobile notary appointments at your home, office, or facility." subtitle="Travel is quoted separately from notarial act fees and must be accepted in advance." />
      <SectionCard title="What to bring" eyebrow="Preparation">
        <ul className="space-y-3">
          <li>- Government ID or other acceptable identification.</li>
          <li>- Complete document packet with signature lines left unsigned unless instructed otherwise.</li>
          <li>- Any access details, parking notes, or witness coordination details.</li>
        </ul>
      </SectionCard>
    </div>
  );
}
