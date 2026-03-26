import Link from "next/link";

import { ComplianceBanner } from "@/components/compliance-banner";
import { InfoGrid } from "@/components/info-grid";
import { PublicHero } from "@/components/public-hero";
import { SectionCard } from "@/components/section-card";
import {
  bookingSteps,
  complianceMessages,
  homepageHighlights,
  pricingSnapshot,
} from "@/lib/publicSite";
import { landingPageStats } from "@/lib/mockData";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <PublicHero
        title="Mobile + remote online notary support built for Columbus."
        subtitle="Book a mobile notary, request a compliant Ohio quote, upload documents, and complete pre-appointment tasks through a secure portal."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {homepageHighlights.map((item) => (
          <div key={item} className="rounded-[24px] bg-parchment/85 p-5 text-sm font-semibold text-walnut">
            {item}
          </div>
        ))}
      </div>

      <SectionCard title="How it works" eyebrow="Booking flow">
        <InfoGrid
          items={bookingSteps.map((step, index) => ({
            title: `Step ${index + 1}`,
            body: step,
          }))}
        />
      </SectionCard>

      <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Pricing snapshot" eyebrow="Ohio-compliant quoting">
          <ul className="space-y-3 text-sm text-walnut/80">
            {pricingSnapshot.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/pricing" className="rounded-full bg-ink px-4 py-2 text-sm text-parchment">
              Full pricing
            </Link>
            <Link href="/book-now" className="rounded-full bg-parchment px-4 py-2 text-sm text-walnut">
              Get a quote
            </Link>
          </div>
        </SectionCard>

        <SectionCard title="Service area + traction" eyebrow="Columbus lead funnel">
          <div className="grid gap-3 md:grid-cols-2">
            {landingPageStats.slice(0, 4).map((page) => (
              <div key={page.slug} className="rounded-[20px] bg-parchment/80 p-4">
                <p className="font-semibold text-ink">{page.title}</p>
                <p className="mt-2 text-sm text-walnut/75">
                  {page.visits} visits · {page.conversions} conversions
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Ohio compliance notes" eyebrow="Visible on the public site">
        <ComplianceBanner items={complianceMessages} title="Required client-facing notices" />
      </SectionCard>
    </div>
  );
}
