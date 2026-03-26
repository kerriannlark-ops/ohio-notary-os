import { PublicHero } from "@/components/public-hero";
import { SectionCard } from "@/components/section-card";

export default function SameDayNotaryColumbusPage() {
  return (
    <div className="space-y-6">
      <PublicHero title="Same-day notary Columbus" subtitle="A local landing page focused on urgent Columbus-area appointments, rush routing, and clear convenience pricing." />
      <SectionCard title="Best fit" eyebrow="Rush lead funnel">
        <ul className="space-y-3">
          <li>- Powers of attorney and affidavits</li>
          <li>- Hospital and bedside coordination</li>
          <li>- Employer/internal overflow or urgent business forms</li>
        </ul>
      </SectionCard>
    </div>
  );
}
