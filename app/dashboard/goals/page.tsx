import { DashboardNav } from "@/components/dashboard-nav";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { formatCurrency } from "@/lib/formatters";
import { getGoalPageDataAsync } from "@/lib/launch";

export default async function DashboardGoalsPage() {
  const data = await getGoalPageDataAsync();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-white/80 p-5 shadow-card sm:rounded-[32px] sm:p-6">
        <p className="text-xs uppercase tracking-[0.26em] text-rust">Goals</p>
        <div className="mt-3 flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
          <div>
            <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl md:leading-none">
              Targets and scorecards
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-walnut/75">
              Monthly and quarterly targets sit next to current actuals so you can manage the business intentionally.
            </p>
          </div>
          <DashboardNav />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.scorecards.map((item) => (
          <MetricCard key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      <SectionCard title="Goal tracker" eyebrow="Targets vs actuals">
        <div className="space-y-4">
          {data.goals.map((goal) => (
            <div key={goal.id} className="rounded-[22px] bg-parchment/80 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-ink">{goal.periodType} goal</p>
                  <p className="mt-2 text-sm text-walnut/75">{goal.startDate} → {goal.endDate}</p>
                </div>
                <p className="text-lg font-semibold text-rust">{goal.completionRate}% attained</p>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-[18px] bg-white/70 p-4">
                  <p className="font-semibold text-ink">Revenue</p>
                  <p className="mt-2 text-sm text-walnut/75">{formatCurrency(goal.snapshot.actualRevenue)} / {formatCurrency(goal.revenueTarget)}</p>
                </div>
                <div className="rounded-[18px] bg-white/70 p-4">
                  <p className="font-semibold text-ink">Appointments</p>
                  <p className="mt-2 text-sm text-walnut/75">{goal.snapshot.actualAppointments} / {goal.appointmentTarget}</p>
                </div>
                <div className="rounded-[18px] bg-white/70 p-4">
                  <p className="font-semibold text-ink">RON</p>
                  <p className="mt-2 text-sm text-walnut/75">{goal.snapshot.actualRON} / {goal.ronTarget}</p>
                </div>
                <div className="rounded-[18px] bg-white/70 p-4">
                  <p className="font-semibold text-ink">Mobile</p>
                  <p className="mt-2 text-sm text-walnut/75">{goal.snapshot.actualMobile} / {goal.mobileTarget}</p>
                </div>
                <div className="rounded-[18px] bg-white/70 p-4">
                  <p className="font-semibold text-ink">Reviews</p>
                  <p className="mt-2 text-sm text-walnut/75">{goal.snapshot.actualReviews} / {goal.reviewTarget}</p>
                </div>
                <div className="rounded-[18px] bg-white/70 p-4">
                  <p className="font-semibold text-ink">B2B outreach</p>
                  <p className="mt-2 text-sm text-walnut/75">{goal.snapshot.actualB2BOutreach} / {goal.b2bOutreachTarget}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
