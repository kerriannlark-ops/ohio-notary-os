import Link from "next/link";

import { ComplianceBanner } from "@/components/compliance-banner";
import { DashboardNav } from "@/components/dashboard-nav";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import {
  businessLanes,
  complianceRules,
  dashboardMetricsSummary,
  feeReferences,
  filingWindows,
  immediateNextSteps,
  launchPhases,
  marketSignals,
  monetizationLadder,
  observedPricingSignals,
  revenueRoadmap,
  servicePackages,
} from "@/lib/dashboardData";

function toneForStatus(status: "done" | "in_progress" | "next" | "blocked") {
  if (status === "done") return "success";
  if (status === "blocked") return "danger";
  if (status === "in_progress") return "brand";
  return "warning";
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-white/80 p-5 shadow-card sm:rounded-[32px] sm:p-6">
        <p className="text-xs uppercase tracking-[0.26em] text-rust">Dashboard app first</p>
        <div className="mt-3 flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
          <div>
            <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl md:leading-none">Ohio Notary Launch Command Center</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-walnut/75">
              This dashboard now tracks the full journey: commission prep, Ohio filing steps,
              oath and seal readiness, RON expansion, business formation, pricing, and the first
              revenue lanes for Columbus mobile notary work.
            </p>
          </div>
          <DashboardNav />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Launch completion" value={dashboardMetricsSummary.launchCompletion} note="Across commission, operations, RON, and business setup." />
        <MetricCard label="Commission" value={dashboardMetricsSummary.commissionReadiness} note="BCI is done; education and filing are next." />
        <MetricCard label="RON" value={dashboardMetricsSummary.ronReadiness} note="The app is ready to track authorization and session controls." />
        <MetricCard label="Business" value={dashboardMetricsSummary.businessReadiness} note="Public site and portal exist; legal entity tasks remain." />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Immediate next steps" eyebrow="Do these now">
          <div className="space-y-3">
            {immediateNextSteps.map((task) => (
              <div key={task.title} className="rounded-[22px] bg-parchment/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{task.title}</p>
                  <StatusBadge label={task.status.replaceAll("_", " ")} tone={toneForStatus(task.status)} />
                </div>
                <p className="mt-2 text-sm text-walnut/75">{task.note}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Compliance non-negotiables" eyebrow="Keep visible">
          <ComplianceBanner items={complianceRules} title="Ohio operating rules" />
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Ohio fee and filing references" eyebrow="Budget + timing">
          <div className="space-y-3">
            {feeReferences.map((item) => (
              <div key={item.label} className="rounded-[22px] bg-parchment/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{item.label}</p>
                  <p className="text-lg font-semibold text-rust">{item.amount}</p>
                </div>
                <p className="mt-2 text-sm text-walnut/75">{item.note}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Application windows" eyebrow="Do not miss timing">
          <div className="space-y-3">
            {filingWindows.map((item) => (
              <div key={item.title} className="rounded-[22px] bg-parchment/80 p-4">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-2 text-sm text-walnut/75">{item.body}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Launch phases" eyebrow="From zero to operating business">
        <div className="grid gap-4 2xl:grid-cols-2">
          {launchPhases.map((phase) => (
            <Link
              key={phase.slug}
              href={phase.href}
              className="rounded-[24px] bg-parchment/80 p-5 transition hover:bg-white"
            >
              <p className="text-xl font-semibold text-ink">{phase.title}</p>
              <p className="mt-2 text-sm text-walnut/75">{phase.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {phase.tasks.map((task) => (
                  <StatusBadge key={task.title} label={task.status.replaceAll("_", " ")} tone={toneForStatus(task.status)} />
                ))}
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Three-lane business model" eyebrow="How to launch without overreaching">
          <div className="space-y-3">
            {businessLanes.map((lane) => (
              <div key={lane.title} className="rounded-[22px] bg-parchment/80 p-4">
                <p className="font-semibold text-ink">{lane.title}</p>
                <p className="mt-2 text-sm text-walnut/75">{lane.body}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Service packages to launch" eyebrow="Money-making lanes">
          <div className="space-y-3">
            {servicePackages.map((service) => (
              <div key={service.title} className="rounded-[22px] bg-parchment/80 p-4">
                <p className="font-semibold text-ink">{service.title}</p>
                <p className="mt-2 text-sm text-walnut/75">{service.body}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Revenue roadmap" eyebrow="30 / 90 / 180 days">
          <div className="space-y-3">
            {revenueRoadmap.map((item) => (
              <div key={item.title} className="rounded-[22px] bg-parchment/80 p-4">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-2 text-sm text-walnut/75">{item.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[22px] bg-ink p-4 text-parchment">
            <p className="text-xs uppercase tracking-[0.18em]">Monetization ladder</p>
            <ul className="mt-3 space-y-2 text-sm">
              {monetizationLadder.map((step) => (
                <li key={step}>- {step}</li>
              ))}
            </ul>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Observed pricing signals" eyebrow="Market-informed, not statutory caps">
          <div className="space-y-3">
            {observedPricingSignals.map((item) => (
              <div key={item.title} className="rounded-[22px] bg-parchment/80 p-4">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-2 text-sm text-walnut/75">{item.body}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Columbus and Ohio market signals" eyebrow="Why this launch can work">
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
