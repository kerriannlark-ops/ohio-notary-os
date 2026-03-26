import { DashboardNav } from "@/components/dashboard-nav";
import { SectionCard } from "@/components/section-card";
import {
  businessLanes,
  marketSignals,
  monetizationLadder,
  observedPricingSignals,
  revenueRoadmap,
  servicePackages,
} from "@/lib/dashboardData";

export default function DashboardRevenuePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-white/80 p-6 shadow-card">
        <p className="text-xs uppercase tracking-[0.26em] text-rust">Revenue view</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-4xl text-ink md:text-5xl">How the business starts making money</h1>
            <p className="mt-3 max-w-3xl text-sm text-walnut/75">
              Build from employer and low-risk mobile work into RON, specialty appointments, and signing-agent packages.
            </p>
          </div>
          <DashboardNav />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Revenue roadmap" eyebrow="30 / 90 / 180 days">
          <div className="space-y-3">
            {revenueRoadmap.map((item) => (
              <div key={item.title} className="rounded-[22px] bg-parchment/80 p-4">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-2 text-sm text-walnut/75">{item.body}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Monetization ladder" eyebrow="Sequence matters">
          <ul className="space-y-3">
            {monetizationLadder.map((step) => (
              <li key={step}>- {step}</li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <SectionCard title="Three-lane business model" eyebrow="Build all 3, not just 1">
        <div className="grid gap-4 md:grid-cols-3">
          {businessLanes.map((lane) => (
            <div key={lane.title} className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">{lane.title}</p>
              <p className="mt-2 text-sm text-walnut/75">{lane.body}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Service packages" eyebrow="Offer design">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {servicePackages.map((service) => (
            <div key={service.title} className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">{service.title}</p>
              <p className="mt-2 text-sm text-walnut/75">{service.body}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Observed pricing signals" eyebrow="Local market patterns">
          <div className="space-y-3">
            {observedPricingSignals.map((item) => (
              <div key={item.title} className="rounded-[22px] bg-parchment/80 p-4">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-2 text-sm text-walnut/75">{item.body}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Market signals" eyebrow="Why Columbus is attractive">
          <div className="space-y-3">
            {marketSignals.map((item) => (
              <div key={item.title} className="rounded-[22px] bg-parchment/80 p-4">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-2 text-sm text-walnut/75">{item.body}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
