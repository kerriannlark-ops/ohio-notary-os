import { notFound } from "next/navigation";

import { ComplianceBanner } from "@/components/compliance-banner";
import { SectionCard } from "@/components/section-card";
import { formatDateTime, formatLabel } from "@/lib/formatters";
import { mockAppointments } from "@/lib/mockData";

export default function JournalDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const appointment = mockAppointments.find((item) => item.id === params.id);

  if (!appointment) {
    notFound();
  }

  const journalFields =
    appointment.serviceMode === "ron"
      ? [
          "Date and time of the act",
          "Act type and document title",
          "Principal printed name and address",
          "Electronic signature and credential-analysis metadata",
          "Session recording reference",
          "Platform used and notes",
        ]
      : ["Date and time", "Act type", "Signer name", "ID method", "Notes"];

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
      <SectionCard title={`Journal ${appointment.id}`} eyebrow="Entry requirements">
        <p className="text-sm text-walnut/75">
          {appointment.clientName} · {formatDateTime(appointment.scheduledStart)} · {formatLabel(appointment.serviceType)}
        </p>
        <ul className="mt-5 space-y-3">
          {journalFields.map((field) => (
            <li key={field}>- {field}</li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Closeout status" eyebrow="Audit">
        <ComplianceBanner items={appointment.complianceFlags} title="Journal blockers or warnings" />
        <p className="mt-4 text-sm text-walnut/75">
          RON entries must remain tamper-evident and exportable. Traditional entries stay optional but supported for consistent logging.
        </p>
      </SectionCard>
    </div>
  );
}
