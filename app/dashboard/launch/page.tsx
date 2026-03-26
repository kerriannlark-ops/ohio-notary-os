import { DashboardNav } from "@/components/dashboard-nav";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { feeReferences, filingWindows, launchPhases } from "@/lib/dashboardData";

function toneForStatus(status: "done" | "in_progress" | "next" | "blocked") {
  if (status === "done") return "success";
  if (status === "blocked") return "danger";
  if (status === "in_progress") return "brand";
  return "warning";
}

export default function DashboardLaunchPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] bg-white/80 p-6 shadow-card">
        <p className="text-xs uppercase tracking-[0.26em] text-rust">Launch view</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="font-serif text-4xl text-ink md:text-5xl">Commission + business launch plan</h1>
            <p className="mt-3 max-w-3xl text-sm text-walnut/75">
              A task-by-task view of the Ohio commission path, RON add-on, and business formation sequence.
            </p>
          </div>
          <DashboardNav />
        </div>
      </section>

      <div className="space-y-6">
        <SectionCard title="Core filing references" eyebrow="Budget + paperwork">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {feeReferences.map((item) => (
              <div key={item.label} className="rounded-[22px] bg-parchment/80 p-4">
                <p className="font-semibold text-ink">{item.label}</p>
                <p className="mt-2 text-lg font-semibold text-rust">{item.amount}</p>
                <p className="mt-2 text-sm text-walnut/75">{item.note}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Critical timing windows" eyebrow="Do not miss these">
          <div className="grid gap-4 md:grid-cols-3">
            {filingWindows.map((item) => (
              <div key={item.title} className="rounded-[22px] bg-parchment/80 p-4">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="mt-2 text-sm text-walnut/75">{item.body}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        {launchPhases.map((phase) => (
          <SectionCard key={phase.slug} title={phase.title} eyebrow="Launch checklist">
            <p className="mb-4 text-sm text-walnut/75">{phase.description}</p>
            <div className="space-y-3">
              {phase.tasks.map((task) => (
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
        ))}
      </div>
    </div>
  );
}
