import Link from "next/link";

import { InfoGrid } from "@/components/info-grid";
import { PublicHero } from "@/components/public-hero";
import { SectionCard } from "@/components/section-card";
import { getServiceCards } from "@/lib/publicSite";

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <PublicHero
        title="Notary services built around convenience, compliance, and clarity."
        subtitle="Choose the workflow that fits your document, location, timing, and readiness level."
      />
      <SectionCard title="Service lines" eyebrow="What we handle">
        <InfoGrid
          items={getServiceCards().map((service) => ({
            title: service.title,
            body: `${service.summary} ${service.details}`,
          }))}
        />
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/book-now" className="rounded-full bg-ink px-4 py-2 text-sm text-parchment">
            Start booking
          </Link>
        </div>
      </SectionCard>
    </div>
  );
}
