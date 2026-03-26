import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime } from "@/lib/formatters";
import { mockAppointments } from "@/lib/mockData";

const ronChecklist = [
  "Notary physically located in Ohio",
  "Live two-way audio-video verified",
  "Credential analysis passed",
  "Identity proofing passed",
  "Recording reference stored",
  "Electronic journal entry completed",
];

export default function RonPage() {
  const ronAppointments = mockAppointments.filter(
    (appointment) => appointment.serviceMode === "ron",
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.9fr]">
      <SectionCard title="RON queue" eyebrow="Online sessions">
        <div className="space-y-3">
          {ronAppointments.map((appointment) => (
            <div key={appointment.id} className="rounded-[22px] bg-parchment/80 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{appointment.clientName}</p>
                  <p className="text-sm text-walnut/75">{formatDateTime(appointment.scheduledStart)}</p>
                </div>
                <StatusBadge
                  label={appointment.status}
                  tone={appointment.status === "completed" ? "success" : appointment.blocked ? "danger" : "warning"}
                />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Mandatory checklist" eyebrow="Ohio RON">
        <ul className="space-y-3">
          {ronChecklist.map((item) => (
            <li key={item}>- {item}</li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
