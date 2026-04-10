import Link from "next/link";

import { ComplianceBanner } from "@/components/compliance-banner";
import { DashboardNav } from "@/components/dashboard-nav";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { getCommandCenterDataAsync, type LaunchMilestoneStatus } from "@/lib/launch";

function toneForMilestone(status: LaunchMilestoneStatus) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "BLOCKED") return "danger" as const;
  if (status === "IN_PROGRESS") return "brand" as const;
  if (status === "LOCKED") return "default" as const;
  return "warning" as const;
}

export default async function DashboardPage() {
  const commandCenter = await getCommandCenterDataAsync();
  const monthlyGoal = commandCenter.goals[0];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-white/80 p-5 shadow-card sm:rounded-[32px] sm:p-6">
        <p className="text-xs uppercase tracking-[0.26em] text-rust">Command center</p>
        <div className="mt-3 flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
          <div>
            <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl md:leading-none">
              Launch-to-Revenue Command Center
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-walnut/75">
              One place to see what is legally allowed, what is blocked, what is due soon,
              and which business milestones are still between the current state and more revenue.
            </p>
          </div>
          <DashboardNav />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Commission readiness" value={formatPercent(commandCenter.readiness.commissionReadiness)} note={commandCenter.readiness.commissionActive ? "Commission gates are active." : "Commission work is still blocked."} />
        <MetricCard label="RON readiness" value={formatPercent(commandCenter.readiness.ronReadiness)} note={commandCenter.readiness.ronActive ? "RON can be offered and completed." : "RON is not fully active yet."} />
        <MetricCard label="Business setup" value={formatPercent(commandCenter.readiness.businessSetupReadiness)} note="LLC, EIN, banking, insurance, and workflow separation." />
        <MetricCard label="Revenue this month" value={formatCurrency(commandCenter.revenue.thisMonth)} note={`Target ${formatCurrency(monthlyGoal?.revenueTarget ?? 0)} · ${monthlyGoal?.completionRate ?? 0}% attained`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Start here" eyebrow="Primary action">
          {commandCenter.startHere.nextAction ? (
            <div className="rounded-[24px] bg-ink p-5 text-parchment">
              <p className="text-xs uppercase tracking-[0.18em]">Next critical action</p>
              <p className="mt-2 text-2xl font-semibold">{commandCenter.startHere.nextAction.title}</p>
              <p className="mt-2 text-sm text-parchment/80">{commandCenter.startHere.nextAction.description}</p>
              <Link
                href={commandCenter.startHere.nextAction.href}
                className="mt-4 inline-flex rounded-full bg-parchment px-4 py-2 text-sm font-semibold text-ink"
              >
                Open workflow
              </Link>
            </div>
          ) : (
            <p className="text-sm text-walnut/75">No critical next action is open right now.</p>
          )}

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[22px] bg-parchment/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-rust">Allowed service modes</p>
              <p className="mt-2 text-lg font-semibold text-ink">
                {commandCenter.readiness.currentAllowedServiceModes.replaceAll("_", " ")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge
                  label={commandCenter.readiness.permissionMatrix.canBookInPerson ? "Can perform in-person acts" : "In-person blocked"}
                  tone={commandCenter.readiness.permissionMatrix.canBookInPerson ? "success" : "danger"}
                />
                <StatusBadge
                  label={commandCenter.readiness.permissionMatrix.canBookRON ? "Can perform RON acts" : "RON blocked"}
                  tone={commandCenter.readiness.permissionMatrix.canBookRON ? "success" : "danger"}
                />
              </div>
            </div>
            <div className="rounded-[22px] bg-parchment/80 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-rust">Due soon</p>
              <ul className="mt-3 space-y-2 text-sm text-walnut/75">
                {commandCenter.startHere.dueSoon.slice(0, 3).map((alert) => (
                  <li key={alert.id}>- {alert.title}</li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Blockers" eyebrow="Resolve before scale">
          <ComplianceBanner items={commandCenter.startHere.blockers} title="Blocking issues" />
          <div className="mt-5 space-y-3">
            {commandCenter.alerts
              .filter((alert) => alert.severity === "warning")
              .slice(0, 3)
              .map((alert) => (
                <div key={alert.id} className="rounded-[22px] bg-parchment/80 p-4">
                  <p className="font-semibold text-ink">{alert.title}</p>
                  <p className="mt-2 text-sm text-walnut/75">{alert.body}</p>
                </div>
              ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Licensing progress" eyebrow="By phase">
          <div className="space-y-4">
            {commandCenter.progressByPhase.map((phase) => (
              <div key={phase.phase} className="rounded-[22px] bg-parchment/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{phase.label}</p>
                  <p className="text-sm text-walnut/70">{phase.completed}/{phase.total}</p>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/70">
                  <div className="h-full rounded-full bg-rust" style={{ width: `${phase.progressPercent}%` }} />
                </div>
                <p className="mt-2 text-sm text-walnut/75">{formatPercent(phase.progressPercent)} complete</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Business readiness" eyebrow="Operational posture">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">Entity and tax setup</p>
              <p className="mt-2 text-sm text-walnut/75">
                LLC {commandCenter.profile.llcFormed ? "formed" : "open"} · EIN {commandCenter.profile.einObtainedDate ? "recorded" : "open"}
              </p>
            </div>
            <div className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">Workflow separation</p>
              <p className="mt-2 text-sm text-walnut/75">
                Employer/private separation {commandCenter.profile.employerPrivateSeparationConfirmed ? "confirmed" : "not confirmed"}
              </p>
            </div>
            <div className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">Insurance and controls</p>
              <p className="mt-2 text-sm text-walnut/75">
                E&amp;O {commandCenter.profile.eoInsuranceActive ? "active" : "not active"} · Recording storage {commandCenter.profile.recordingStorageConfigured ? "configured" : "open"}
              </p>
            </div>
            <div className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">Client acquisition</p>
              <p className="mt-2 text-sm text-walnut/75">
                Website {commandCenter.profile.websiteLive ? "live" : "offline"} · Google Business Profile {commandCenter.profile.googleBusinessProfileLive ? "live" : "offline"}
              </p>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Revenue engine" eyebrow="Actuals + lane mix">
          <div className="grid gap-3 md:grid-cols-2">
            {commandCenter.revenue.revenueByLane.map((lane) => (
              <div key={lane.label} className="rounded-[22px] bg-parchment/80 p-4">
                <p className="font-semibold text-ink">{lane.label}</p>
                <p className="mt-2 text-lg font-semibold text-rust">{formatCurrency(lane.value)}</p>
              </div>
            ))}
            <div className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">Travel efficiency</p>
              <p className="mt-2 text-lg font-semibold text-rust">{formatCurrency(commandCenter.revenue.travelEfficiency.revenuePerMile)}/mile</p>
              <p className="mt-2 text-sm text-walnut/75">
                {commandCenter.revenue.travelEfficiency.totalMiles} miles · {formatCurrency(commandCenter.revenue.travelEfficiency.travelRevenue)} travel revenue
              </p>
            </div>
            <div className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">Reviews</p>
              <p className="mt-2 text-sm text-walnut/75">
                Sent {commandCenter.revenue.reviewStats.sent} · Pending {commandCenter.revenue.reviewStats.pending} · Conversion {commandCenter.revenue.reviewStats.conversionRate}%
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Pipeline counts" eyebrow="Lead to paid workflow">
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(commandCenter.revenue.pipelineCounts).map(([status, count]) => (
              <div key={status} className="rounded-[22px] bg-parchment/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{status.replaceAll("_", " ")}</p>
                  <StatusBadge label={`${count}`} tone="brand" />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Firsts achieved" eyebrow="Milestone wins">
          <div className="space-y-3">
            {commandCenter.revenue.firstsAchieved.map((milestone) => (
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

        <SectionCard title="Service mix" eyebrow="Where volume is coming from">
          <div className="space-y-3">
            {commandCenter.revenue.serviceMix.map((item) => (
              <div key={item.label} className="rounded-[22px] bg-parchment/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{item.label}</p>
                  <p className="text-lg font-semibold text-rust">{item.count}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
