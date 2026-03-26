import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/formatters";
import { mockAppointments } from "@/lib/mockData";

export default function InvoicesPage() {
  const billable = mockAppointments.filter((appointment) => appointment.total > 0);

  return (
    <SectionCard title="Invoices" eyebrow="Billing">
      <div className="space-y-3">
        {billable.map((appointment) => (
          <div key={appointment.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] bg-parchment/80 p-4">
            <div>
              <p className="font-semibold text-ink">INV-{appointment.id.toUpperCase()}</p>
              <p className="text-sm text-walnut/75">{appointment.clientName}</p>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-semibold text-ink">{formatCurrency(appointment.total)}</p>
              <StatusBadge label={appointment.channel === "employer" ? "internal" : "draft"} tone={appointment.channel === "employer" ? "brand" : "default"} />
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
