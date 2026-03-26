import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { getPortalAppointments } from "@/lib/portal";

export default function PortalHistoryPage() {
  const history = getPortalAppointments().filter(
    (appointment) =>
      appointment.portalStatus === "completed" || appointment.portalStatus === "closed",
  );

  return (
    <PortalShell title="Appointment history">
      <SectionCard title="Completed matters" eyebrow="History">
        <div className="space-y-3">
          {history.map((appointment) => (
            <div key={appointment.id} className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">{appointment.clientName}</p>
              <p className="mt-2 text-sm text-walnut/75">{appointment.serviceLabel}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </PortalShell>
  );
}
