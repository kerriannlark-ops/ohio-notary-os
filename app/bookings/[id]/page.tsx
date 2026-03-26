import { notFound } from "next/navigation";

import { ComplianceBanner } from "@/components/compliance-banner";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { formatCurrency, formatDateTime, formatLabel } from "@/lib/formatters";
import { mockAppointments } from "@/lib/mockData";

export default function BookingDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const appointment = mockAppointments.find((item) => item.id === params.id);

  if (!appointment) {
    notFound();
  }

  return (
    <div className="grid gap-6 2xl:grid-cols-[1.35fr_1fr]">
      <SectionCard title={appointment.clientName} eyebrow="Appointment detail">
        <div className="flex flex-wrap gap-2">
          <StatusBadge label={appointment.status} tone={appointment.blocked ? "danger" : "warning"} />
          <StatusBadge label={appointment.channel} tone={appointment.channel === "employer" ? "brand" : "default"} />
          <StatusBadge label={appointment.serviceMode} tone={appointment.serviceMode === "ron" ? "success" : "default"} />
        </div>
        <dl className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-rust">Scheduled</dt>
            <dd className="mt-1 text-base text-ink">{formatDateTime(appointment.scheduledStart)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-rust">Service</dt>
            <dd className="mt-1 text-base text-ink">{formatLabel(appointment.serviceType)}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-rust">Facility</dt>
            <dd className="mt-1 text-base text-ink">{appointment.facilityType.replaceAll("_", " ")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.18em] text-rust">Quote total</dt>
            <dd className="mt-1 text-base text-ink">{formatCurrency(appointment.total)}</dd>
          </div>
        </dl>
      </SectionCard>

      <SectionCard title="Warnings + next step" eyebrow="Compliance">
        <ComplianceBanner items={appointment.complianceFlags} />
        {appointment.blockedReason ? (
          <p className="mt-4 rounded-[24px] bg-rust/10 p-4 text-sm text-rust">
            {appointment.blockedReason}
          </p>
        ) : (
          <p className="mt-4 text-sm text-walnut/75">
            This appointment is ready for the next workflow step. Keep ID capture,
            certificate completion, and journal requirements aligned before closeout.
          </p>
        )}
      </SectionCard>
    </div>
  );
}
