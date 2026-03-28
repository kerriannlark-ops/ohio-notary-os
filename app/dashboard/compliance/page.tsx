import { ComplianceBanner } from "@/components/compliance-banner";
import { DashboardNav } from "@/components/dashboard-nav";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { formatDate, formatPercent } from "@/lib/formatters";
import { getReadinessPageDataAsync, type LaunchMilestoneStatus } from "@/lib/launch";

function toneForMilestone(status: LaunchMilestoneStatus) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "BLOCKED") return "danger" as const;
  if (status === "IN_PROGRESS") return "brand" as const;
  if (status === "LOCKED") return "default" as const;
  return "warning" as const;
}

export default async function DashboardCompliancePage() {
  const data = await getReadinessPageDataAsync();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-white/80 p-5 shadow-card sm:rounded-[32px] sm:p-6">
        <p className="text-xs uppercase tracking-[0.26em] text-rust">Readiness + compliance</p>
        <div className="mt-3 flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
          <div>
            <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl md:leading-none">
              Legal gating and operational permissions
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-walnut/75">
              This view shows what can legally be offered, what still blocks RON or scale,
              and which deadlines or controls need attention.
            </p>
          </div>
          <DashboardNav />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SectionCard title={formatPercent(data.readiness.commissionReadiness)} eyebrow="Commission readiness">
          <StatusBadge label={data.readiness.commissionActive ? "Commission active" : "Commission blocked"} tone={data.readiness.commissionActive ? "success" : "danger"} />
        </SectionCard>
        <SectionCard title={formatPercent(data.readiness.ronReadiness)} eyebrow="RON readiness">
          <StatusBadge label={data.readiness.ronActive ? "RON active" : "RON blocked"} tone={data.readiness.ronActive ? "success" : "danger"} />
        </SectionCard>
        <SectionCard title={data.readiness.permissionMatrix.canBookInPerson ? "Allowed" : "Blocked"} eyebrow="In-person acts">
          <p className="text-sm text-walnut/75">Booking and completion for in-person appointments.</p>
        </SectionCard>
        <SectionCard title={data.readiness.permissionMatrix.canBookRON ? "Allowed" : "Blocked"} eyebrow="RON acts">
          <p className="text-sm text-walnut/75">Booking and completion for Ohio online notarization.</p>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionCard title="Blocking issues" eyebrow="Must fix">
          <ComplianceBanner items={data.readiness.blockingIssues} title="Permission blockers" />
        </SectionCard>

        <SectionCard title="Expiring or due soon" eyebrow="Deadlines">
          <div className="space-y-3">
            {data.alerts.slice(0, 6).map((alert) => (
              <div key={alert.id} className="rounded-[22px] bg-parchment/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{alert.title}</p>
                  <StatusBadge label={alert.severity} tone={alert.severity === "block" ? "danger" : alert.severity === "warning" ? "warning" : "default"} />
                </div>
                <p className="mt-2 text-sm text-walnut/75">{alert.body}</p>
                {alert.dueDate ? <p className="mt-2 text-xs uppercase tracking-[0.16em] text-walnut/60">Due {formatDate(alert.dueDate)}</p> : null}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Permission matrix" eyebrow="What the system should allow right now">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Book in-person", ok: data.readiness.permissionMatrix.canBookInPerson },
            { label: "Complete in-person", ok: data.readiness.permissionMatrix.canCompleteInPerson },
            { label: "Book RON", ok: data.readiness.permissionMatrix.canBookRON },
            { label: "Complete RON", ok: data.readiness.permissionMatrix.canCompleteRON },
          ].map((item) => (
            <div key={item.label} className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">{item.label}</p>
              <div className="mt-3">
                <StatusBadge label={item.ok ? "allowed" : "blocked"} tone={item.ok ? "success" : "danger"} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Readiness-critical milestones" eyebrow="Controls that gate service delivery">
        <div className="space-y-3">
          {data.milestoneSummary.map((milestone) => (
            <div key={milestone.id} className="rounded-[22px] bg-parchment/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-ink">{milestone.title}</p>
                <StatusBadge label={milestone.status} tone={toneForMilestone(milestone.status)} />
              </div>
              <p className="mt-2 text-sm text-walnut/75">{milestone.description}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
