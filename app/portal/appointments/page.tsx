import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { getPortalAppointments } from "@/lib/portal";

export default function PortalAppointmentsPage() {
  const appointments = getPortalAppointments();

  return (
    <PortalShell title="Appointments">
      <SectionCard title="Upcoming + active appointments" eyebrow="Portal timeline">
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">{appointment.clientName}</p>
              <p className="mt-1 text-sm text-walnut/75">
                {appointment.serviceLabel} · {formatDateTime(appointment.scheduledStart)}
              </p>
              <p className="mt-2 text-sm text-walnut/75">
                {appointment.portalStatus.replaceAll("_", " ")} · {formatCurrency(appointment.quoteTotal)}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </PortalShell>
  );
}
