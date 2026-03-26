import { SectionCard } from "@/components/section-card";
import { formatDateTime, formatLabel } from "@/lib/formatters";
import { mockAppointments } from "@/lib/mockData";

export default function CalendarPage() {
  const grouped = Object.entries(
    mockAppointments.reduce<Record<string, typeof mockAppointments>>((accumulator, appointment) => {
      const day = appointment.scheduledStart.slice(0, 10);
      accumulator[day] ??= [];
      accumulator[day].push(appointment);
      return accumulator;
    }, {}),
  );

  return (
    <SectionCard title="Calendar view" eyebrow="Agenda">
      <div className="space-y-6">
        {grouped.map(([day, appointments]) => (
          <div key={day}>
            <p className="text-xs uppercase tracking-[0.22em] text-rust">{day}</p>
            <div className="mt-3 space-y-3">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="rounded-[22px] bg-parchment/80 p-4">
                  <p className="font-semibold text-ink">{appointment.clientName}</p>
                  <p className="text-sm text-walnut/75">
                    {formatDateTime(appointment.scheduledStart)} · {formatLabel(appointment.serviceType)} · {appointment.facilityType.replaceAll("_", " ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
