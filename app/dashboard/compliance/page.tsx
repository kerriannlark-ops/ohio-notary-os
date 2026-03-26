import { ComplianceBanner } from "@/components/compliance-banner";
import { DashboardNav } from "@/components/dashboard-nav";
import { SectionCard } from "@/components/section-card";
import { complianceRules, lawfulActChecklist, ohioRiskPoints } from "@/lib/dashboardData";

export default function DashboardCompliancePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-white/80 p-6 shadow-card">
        <p className="text-xs uppercase tracking-[0.26em] text-rust">Compliance view</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-4xl text-ink md:text-5xl">Ohio compliance guardrails</h1>
            <p className="mt-3 max-w-3xl text-sm text-walnut/75">
              Keep these rules in front of you while you commission, start offering services, and later add RON.
            </p>
          </div>
          <DashboardNav />
        </div>
      </section>

      <SectionCard title="Never-bury rules" eyebrow="Core blockers">
        <ComplianceBanner items={complianceRules} title="Operational rules that should stay visible in the app" />
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Lawful act checklist" eyebrow="Every appointment">
          <ul className="space-y-3">
            {lawfulActChecklist.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Highest-risk mistake zones" eyebrow="Protect the commission">
          <div className="space-y-3">
            {ohioRiskPoints.map((item) => (
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
