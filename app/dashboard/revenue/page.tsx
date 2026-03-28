import { DashboardNav } from "@/components/dashboard-nav";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/formatters";
import { getCommandCenterDataAsync } from "@/lib/launch";

export default async function DashboardRevenuePage() {
  const commandCenter = await getCommandCenterDataAsync();
  const monthlyGoal = commandCenter.goals[0];

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-white/80 p-5 shadow-card sm:rounded-[32px] sm:p-6">
        <p className="text-xs uppercase tracking-[0.26em] text-rust">Revenue view</p>
        <div className="mt-3 flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
          <div>
            <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl md:leading-none">
              Revenue targets, actuals, and first-dollar milestones
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-walnut/75">
              This view separates targets, actual performance, pipeline counts, and milestone wins.
            </p>
          </div>
          <DashboardNav />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Month target" value={formatCurrency(monthlyGoal?.revenueTarget ?? 0)} />
        <MetricCard label="Month actual" value={formatCurrency(commandCenter.revenue.thisMonth)} note={`${monthlyGoal?.completionRate ?? 0}% of target`} />
        <MetricCard label="Appointment target" value={`${monthlyGoal?.appointmentTarget ?? 0}`} note={`${monthlyGoal?.snapshot.actualAppointments ?? 0} completed`} />
        <MetricCard label="RON target" value={`${monthlyGoal?.ronTarget ?? 0}`} note={`${monthlyGoal?.snapshot.actualRON ?? 0} completed`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Revenue by lane" eyebrow="Employer vs mobile vs RON">
          <div className="space-y-3">
            {commandCenter.revenue.revenueByLane.map((lane) => (
              <div key={lane.label} className="rounded-[22px] bg-parchment/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{lane.label}</p>
                  <p className="text-lg font-semibold text-rust">{formatCurrency(lane.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Review and efficiency metrics" eyebrow="Quality of revenue">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">Revenue per mile</p>
              <p className="mt-2 text-lg font-semibold text-rust">{formatCurrency(commandCenter.revenue.travelEfficiency.revenuePerMile)}</p>
            </div>
            <div className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">Travel fee revenue</p>
              <p className="mt-2 text-lg font-semibold text-rust">{formatCurrency(commandCenter.revenue.travelEfficiency.travelRevenue)}</p>
            </div>
            <div className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">Reviews sent</p>
              <p className="mt-2 text-lg font-semibold text-rust">{commandCenter.revenue.reviewStats.sent}</p>
            </div>
            <div className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">Review conversion</p>
              <p className="mt-2 text-lg font-semibold text-rust">{commandCenter.revenue.reviewStats.conversionRate}%</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Pipeline" eyebrow="Lead → quote → booked → completed">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="First-dollar milestones" eyebrow="Operational wins">
          <div className="space-y-3">
            {commandCenter.revenue.firstsAchieved.map((milestone) => (
              <div key={milestone.id} className="rounded-[22px] bg-parchment/80 p-4">
                <p className="font-semibold text-ink">{milestone.title}</p>
                <p className="mt-2 text-sm text-walnut/75">{milestone.description}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Service mix" eyebrow="Where completions are happening">
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
