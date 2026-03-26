import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { formatCurrency } from "@/lib/formatters";
import { getPortalAppointments } from "@/lib/portal";

export default function PortalQuotesPage() {
  return (
    <PortalShell title="Quotes">
      <SectionCard title="Accepted and pending quotes" eyebrow="Client review">
        <div className="space-y-3">
          {getPortalAppointments().map((appointment) => (
            <div key={appointment.id} className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">{appointment.serviceLabel}</p>
              <p className="mt-2 text-sm text-walnut/75">
                Estimated total {formatCurrency(appointment.quoteTotal)}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </PortalShell>
  );
}
