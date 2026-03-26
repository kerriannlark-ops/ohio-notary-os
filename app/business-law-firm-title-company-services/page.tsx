import { PublicHero } from "@/components/public-hero";
import { SectionCard } from "@/components/section-card";

export default function BusinessServicesPage() {
  return (
    <div className="space-y-6">
      <PublicHero title="Business, law firm, and title company notary support." subtitle="Built for referral partners who want fast scheduling, cleaner prep, and employer-versus-private workflow separation." />
      <SectionCard title="B2B fit" eyebrow="Referral relationships">
        <ul className="space-y-3">
          <li>- Law firms and estate planners</li>
          <li>- Title companies and escrow partners</li>
          <li>- HR, compliance, and employer/internal queues</li>
        </ul>
      </SectionCard>
    </div>
  );
}
