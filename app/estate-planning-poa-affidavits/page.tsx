import { PublicHero } from "@/components/public-hero";
import { SectionCard } from "@/components/section-card";

export default function EstatePlanningPage() {
  return (
    <div className="space-y-6">
      <PublicHero title="Estate planning, powers of attorney, affidavits, and acknowledgment-ready documents." subtitle="Ideal for home visits, attorney referrals, and RON-friendly document sets when the session type fits." />
      <SectionCard title="Common appointments" eyebrow="Service types">
        <ul className="space-y-3">
          <li>- Powers of attorney</li>
          <li>- Affidavits and sworn statements</li>
          <li>- Estate planning acknowledgments</li>
          <li>- School or employment verification documents</li>
        </ul>
      </SectionCard>
    </div>
  );
}
