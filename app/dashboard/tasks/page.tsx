import Link from "next/link";

import { DashboardNav } from "@/components/dashboard-nav";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { formatDate } from "@/lib/formatters";
import { getLaunchTaskQueueAsync } from "@/lib/launch";

export default async function DashboardTasksPage() {
  const tasks = await getLaunchTaskQueueAsync();

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] bg-white/80 p-5 shadow-card sm:rounded-[32px] sm:p-6">
        <p className="text-xs uppercase tracking-[0.26em] text-rust">Task queue</p>
        <div className="mt-3 flex flex-col gap-4 2xl:flex-row 2xl:items-end 2xl:justify-between">
          <div>
            <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl md:leading-none">
              Actionable launch tasks only
            </h1>
            <p className="mt-3 max-w-3xl text-sm text-walnut/75">
              This strips the system down to what still needs to be handled.
            </p>
          </div>
          <DashboardNav />
        </div>
      </section>

      <SectionCard title="Open tasks" eyebrow={`${tasks.length} action items`}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-[22px] bg-parchment/80 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-ink">{task.title}</p>
                    <StatusBadge label={task.status} tone={task.status === "IN_PROGRESS" ? "brand" : task.status === "BLOCKED" ? "danger" : "warning"} />
                    <StatusBadge label={task.phase} tone="default" />
                  </div>
                  <p className="mt-2 text-sm text-walnut/75">{task.milestoneTitle}</p>
                  {task.blockerReason ? <p className="mt-2 text-sm text-rust">{task.blockerReason}</p> : null}
                </div>
                <div className="text-sm text-walnut/70 md:text-right">
                  {task.dueDate ? <p>Due {formatDate(task.dueDate)}</p> : null}
                  <Link href={task.href} className="mt-2 inline-flex rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-parchment">
                    Open
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
