import { SectionCard } from "@/components/section-card";

export default function PricingSettingsPage() {
  return (
    <SectionCard title="Pricing settings" eyebrow="Fee controls">
      <ul className="space-y-3">
        <li>- Traditional and in-person electronic fee cap: $5 per act.</li>
        <li>- RON fee cap: $30 per act.</li>
        <li>- RON technology fee cap: $10 per session.</li>
        <li>- Travel fee only appears when disclosed and accepted.</li>
        <li>- After-hours and specialty surcharges remain separately itemized.</li>
      </ul>
    </SectionCard>
  );
}
