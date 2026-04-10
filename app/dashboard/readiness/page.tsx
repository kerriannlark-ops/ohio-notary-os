import { DashboardNav } from "@/components/dashboard-nav";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getReadinessPageDataAsync } from "@/lib/launch";

export default async function DashboardReadinessPage() {
  const data = await getReadinessPageDataAsync();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-white/80 p-5 shadow-card sm:rounded-[32px] sm:p-6">
        <p className="text-xs uppercase tracking-[0.26em] text-rust">Readiness matrix</p>
        <div className="mt-3 flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
          <div>
            <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl md:leading-none">
              Service permissions and gating rules
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-walnut/75">
              Explicit permission matrix for what the system should and should not allow.
            </p>
          </div>
          <DashboardNav />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Allowed service modes" eyebrow="Current state">
          <p className="text-2xl font-semibold text-ink">{data.readiness.currentAllowedServiceModes.replaceAll("_", " ")}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge label={data.readiness.permissionMatrix.canBookInPerson ? "Book in-person allowed" : "Book in-person blocked"} tone={data.readiness.permissionMatrix.canBookInPerson ? "success" : "danger"} />
            <StatusBadge label={data.readiness.permissionMatrix.canCompleteInPerson ? "Complete in-person allowed" : "Complete in-person blocked"} tone={data.readiness.permissionMatrix.canCompleteInPerson ? "success" : "danger"} />
            <StatusBadge label={data.readiness.permissionMatrix.canBookRON ? "Book RON allowed" : "Book RON blocked"} tone={data.readiness.permissionMatrix.canBookRON ? "success" : "danger"} />
            <StatusBadge label={data.readiness.permissionMatrix.canCompleteRON ? "Complete RON allowed" : "Complete RON blocked"} tone={data.readiness.permissionMatrix.canCompleteRON ? "success" : "danger"} />
          </div>
        </SectionCard>

        <SectionCard title="Control checklist" eyebrow="High-signal statuses">
          <div className="space-y-3">
            {data.milestoneSummary.map((milestone) => (
              <div key={milestone.id} className="rounded-[22px] bg-parchment/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-ink">{milestone.title}</p>
                  <StatusBadge label={milestone.status} tone={milestone.status === "COMPLETED" ? "success" : milestone.status === "IN_PROGRESS" ? "brand" : milestone.status === "BLOCKED" ? "danger" : "warning"} />
                </div>
                <p className="mt-2 text-sm text-walnut/75">{milestone.description}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
