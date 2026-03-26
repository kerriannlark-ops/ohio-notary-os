import Link from "next/link";

import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDateTime, formatLabel } from "@/lib/formatters";
import { mockAppointments } from "@/lib/mockData";

export default function BookingsPage() {
  return (
    <SectionCard title="Appointment queue" eyebrow="Kanban-ready list">
      <div className="space-y-4">
        {mockAppointments.map((appointment) => (
          <Link
            key={appointment.id}
            href={`/bookings/${appointment.id}`}
            className="grid gap-3 rounded-[24px] border border-black/5 bg-parchment/80 p-4 transition hover:bg-white md:grid-cols-[1.4fr_1fr_auto]"
          >
            <div>
              <p className="text-lg font-semibold text-ink">{appointment.clientName}</p>
              <p className="text-sm text-walnut/70">
                {formatDateTime(appointment.scheduledStart)} · {formatLabel(appointment.serviceType)}
              </p>
            </div>
            <div className="text-sm text-walnut/75">
              <p>{appointment.facilityType.replaceAll("_", " ")}</p>
              <p>{formatCurrency(appointment.total)}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge label={appointment.channel} tone={appointment.channel === "employer" ? "brand" : "default"} />
              <StatusBadge label={appointment.status} tone={appointment.blocked ? "danger" : "warning"} />
            </div>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
