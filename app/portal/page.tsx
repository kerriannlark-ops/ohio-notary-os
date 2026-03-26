import { MetricCard } from "@/components/metric-card";
import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { formatCurrency } from "@/lib/formatters";
import { getPortalDashboard } from "@/lib/portal";

export default function PortalPage() {
  const dashboard = getPortalDashboard();

  return (
    <PortalShell title="Client dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Payment due" value={formatCurrency(dashboard.paymentDue)} />
        <MetricCard label="Uploads" value={`${dashboard.uploadedDocumentCount}`} />
        <MetricCard label="Unread messages" value={`${dashboard.unreadMessages}`} />
        <MetricCard label="Missing items" value={`${dashboard.missingItems}`} />
      </div>
      <SectionCard title="Next appointment" eyebrow="Upcoming">
        {dashboard.nextAppointment ? (
          <div className="rounded-[22px] bg-parchment/80 p-4">
            <p className="text-lg font-semibold text-ink">{dashboard.nextAppointment.clientName}</p>
            <p className="mt-2 text-sm text-walnut/75">
              {dashboard.nextAppointment.serviceLabel} · {dashboard.nextAppointment.locationLabel}
            </p>
          </div>
        ) : (
          <p className="text-sm text-walnut/75">No open portal appointments right now.</p>
        )}
      </SectionCard>
    </PortalShell>
  );
}
