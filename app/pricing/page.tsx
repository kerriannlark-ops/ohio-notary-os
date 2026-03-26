import { QuoteBreakdown } from "@/components/quote-breakdown";
import { PublicHero } from "@/components/public-hero";
import { SectionCard } from "@/components/section-card";
import { createOhioQuote } from "@/lib/pricing";

export default function PricingPage() {
  const quote = createOhioQuote({
    actType: "power_of_attorney",
    actCount: 2,
    isRON: false,
    travelMiles: 8,
    travelFeeAccepted: true,
    isAfterHours: true,
  });

  return (
    <div className="space-y-6">
      <PublicHero title="Transparent pricing with Ohio fee caps clearly separated." subtitle="Statutory act fees, travel, after-hours, specialty surcharges, and RON technology fees are shown as distinct line items." />
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Pricing rules" eyebrow="Client-facing disclosures">
          <ul className="space-y-3">
            <li>- In-person and in-person electronic notarial acts are capped by Ohio law at up to $5 per act.</li>
            <li>- RON notarial acts are capped at up to $30 per act.</li>
            <li>- RON technology fees are capped at up to $10 per online session.</li>
            <li>- Travel fees are separate from notarial fees and require agreement in advance.</li>
            <li>- After-hours, hospital, jail, and specialty logistics fees appear as separate convenience items.</li>
          </ul>
        </SectionCard>
        <SectionCard title="Sample quote" eyebrow="Line-item example">
          <QuoteBreakdown quote={quote} />
        </SectionCard>
      </div>
    </div>
  );
}
