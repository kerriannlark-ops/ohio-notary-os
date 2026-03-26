import Link from "next/link";

import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/formatters";
import { mockAppointments } from "@/lib/mockData";

export default function JournalPage() {
  const journalReady = mockAppointments.filter(
    (appointment) => appointment.status === "completed" || appointment.serviceMode === "ron",
  );

  return (
    <SectionCard title="Journal queue" eyebrow="Traditional + RON">
      <div className="mb-5">
        <Link
          href="/api/journal/export"
          className="rounded-full bg-ink px-4 py-2 text-sm text-parchment"
        >
          Export journal CSV
        </Link>
      </div>
      <div className="space-y-3">
        {journalReady.map((appointment) => (
          <Link
            key={appointment.id}
            href={`/journal/${appointment.id}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-parchment/80 p-4 transition hover:bg-white"
          >
            <div>
              <p className="font-semibold text-ink">{appointment.clientName}</p>
              <p className="text-sm text-walnut/75">{formatDateTime(appointment.scheduledStart)}</p>
            </div>
            <div className="flex gap-2">
              <StatusBadge label={appointment.serviceMode === "ron" ? "ron" : "traditional"} tone={appointment.serviceMode === "ron" ? "success" : "default"} />
              <StatusBadge label={appointment.status} tone={appointment.status === "completed" ? "success" : "warning"} />
            </div>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
