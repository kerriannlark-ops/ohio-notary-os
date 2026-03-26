import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { mockAppointments } from "@/lib/mockData";

export default function ClientsPage() {
  const clients = Array.from(
    new Map(
      mockAppointments.map((appointment) => [
        appointment.clientName,
        {
          name: appointment.clientName,
          channel: appointment.channel,
          serviceType: appointment.serviceType,
        },
      ]),
    ).values(),
  );

  return (
    <SectionCard title="Clients" eyebrow="CRM">
      <div className="grid gap-3 md:grid-cols-2">
        {clients.map((client) => (
          <div key={client.name} className="rounded-[22px] bg-parchment/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-ink">{client.name}</p>
              <StatusBadge label={client.channel} tone={client.channel === "employer" ? "brand" : "default"} />
            </div>
            <p className="mt-2 text-sm text-walnut/75">{client.serviceType.replaceAll("_", " ")}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
