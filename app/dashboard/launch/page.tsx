import { DashboardNav } from "@/components/dashboard-nav";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/formatters";
import { getCommandCenterDataAsync, type LaunchMilestoneStatus, type LaunchPhase } from "@/lib/launch";

function toneForMilestone(status: LaunchMilestoneStatus) {
  if (status === "COMPLETED") return "success" as const;
  if (status === "BLOCKED") return "danger" as const;
  if (status === "IN_PROGRESS") return "brand" as const;
  if (status === "LOCKED") return "default" as const;
  return "warning" as const;
}

const phaseOrder: LaunchPhase[] = ["COMMISSION", "OPERATIONS", "RON", "BUSINESS", "REVENUE_SCALE"];

export default async function DashboardLaunchPage() {
  const commandCenter = await getCommandCenterDataAsync();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-white/80 p-5 shadow-card sm:rounded-[32px] sm:p-6">
        <p className="text-xs uppercase tracking-[0.26em] text-rust">Launch view</p>
        <div className="mt-3 flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
          <div>
            <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl md:leading-none">
              Milestones, dependencies, and due dates
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-walnut/75">
              This page is the structured path from course and filing through operations,
              RON, business setup, and scale milestones.
            </p>
          </div>
          <DashboardNav />
        </div>
      </section>

      {phaseOrder.map((phase) => {
        const phaseSummary = commandCenter.progressByPhase.find((item) => item.phase === phase);
        const milestones = commandCenter.milestones.filter((milestone) => milestone.phase === phase);

        return (
          <SectionCard
            key={phase}
            title={phaseSummary?.label ?? phase.replaceAll("_", " ")}
            eyebrow={`${phaseSummary?.completed ?? 0}/${phaseSummary?.total ?? 0} complete`}
          >
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <div key={milestone.id} className="rounded-[22px] bg-parchment/80 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-semibold text-ink">{milestone.title}</p>
                        <StatusBadge label={milestone.status} tone={toneForMilestone(milestone.status)} />
                        <StatusBadge label={milestone.sourceType} tone="default" />
                      </div>
                      <p className="mt-2 text-sm text-walnut/75">{milestone.description}</p>
                    </div>
                    <div className="text-sm text-walnut/70 md:text-right">
                      {milestone.dueDate ? <p>Due {formatDate(milestone.dueDate)}</p> : null}
                      {milestone.completedAt ? <p>Completed {formatDate(milestone.completedAt)}</p> : null}
                    </div>
                  </div>

                  {milestone.dependencyCodes.length > 0 ? (
                    <p className="mt-3 text-sm text-walnut/75">
                      Depends on: {milestone.dependencyCodes.map((code) => code.replaceAll("_", " ")).join(", ")}
                    </p>
                  ) : null}

                  {milestone.blockerReason ? (
                    <p className="mt-3 rounded-[18px] bg-rust/10 px-4 py-3 text-sm text-rust">
                      {milestone.blockerReason}
                    </p>
                  ) : null}

                  {milestone.ownerNotes ? (
                    <p className="mt-3 rounded-[18px] bg-white/70 px-4 py-3 text-sm text-walnut/75">
                      {milestone.ownerNotes}
                    </p>
                  ) : null}

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {milestone.tasks.map((task) => (
                      <div key={task.id} className="rounded-[18px] bg-white/70 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-ink">{task.title}</p>
                          <StatusBadge label={task.status} tone={task.status === "COMPLETED" ? "success" : task.status === "IN_PROGRESS" ? "brand" : task.status === "BLOCKED" ? "danger" : "warning"} />
                        </div>
                        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-walnut/60">
                          Evidence: {task.evidenceType.replaceAll("_", " ")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        );
      })}
    </div>
  );
}
