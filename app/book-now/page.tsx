import { ProgressSteps } from "@/components/progress-steps";
import { PublicHero } from "@/components/public-hero";
import { QuoteBreakdown } from "@/components/quote-breakdown";
import { SectionCard } from "@/components/section-card";
import { bookingSteps } from "@/lib/publicSite";
import { createOhioQuote } from "@/lib/pricing";

export default function BookNowPage() {
  const quote = createOhioQuote({
    actType: "power_of_attorney",
    actCount: 2,
    isRON: false,
    travelMiles: 12,
    travelFeeAccepted: true,
    isAfterHours: true,
    specialLocationType: "standard",
  });

  return (
    <div className="space-y-6">
      <PublicHero title="Book your appointment in one guided flow." subtitle="The booking engine screens readiness, applies Ohio fee rules, blocks unsupported services, and creates a secure client portal after quote acceptance." />
      <ProgressSteps steps={bookingSteps} active={5} />
      <div className="grid gap-6 2xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="Public booking flow" eyebrow="Eight steps">
          <ol className="space-y-3 text-sm text-walnut/78">
            <li>1. Choose service mode: mobile, RON, or not sure.</li>
            <li>2. Choose document type and service category.</li>
            <li>3. Enter signer names, signer count, and act count.</li>
            <li>4. Add location, time, urgency, and access details.</li>
            <li>5. Complete readiness screening and title/RON checks.</li>
            <li>6. Review the line-item quote and accept disclosures.</li>
            <li>7. Create your portal account with email magic link flow.</li>
            <li>8. Receive confirmation, prep checklist, and upload prompts.</li>
          </ol>
        </SectionCard>
        <SectionCard title="Example quote" eyebrow="Public pricing UI">
          <QuoteBreakdown quote={quote} />
          <p className="mt-4 text-sm text-walnut/75">
            Travel fees remain separate from notarial act fees, and public users cannot override Ohio caps.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
