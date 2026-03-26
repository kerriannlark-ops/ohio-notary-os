import { SectionCard } from "@/components/section-card";

const intakeFields = [
  "Client name, phone, email, and preferred contact method",
  "Service type, document type, signer count, and act count",
  "Requested date/time and employer vs private channel",
  "Address or online mode, facility type, zip code, and mileage",
  "Expected ID method, witness needs, and document completeness",
  "Travel fee disclosure acceptance and urgency level",
];

const ruleChecks = [
  "Traditional and in-person electronic acts cap at $5 per act.",
  "RON acts cap at $30 per act with tech fees capped at $10 per session.",
  "Travel fees appear only when disclosed and accepted.",
  "Copy certification stays blocked.",
  "Vehicle title work triggers elevated warning flow.",
];

export default function NewBookingPage() {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <SectionCard title="Intake form blueprint" eyebrow="Booking engine">
        <ul className="space-y-3">
          {intakeFields.map((field) => (
            <li key={field}>- {field}</li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Live validation rules" eyebrow="Quote guardrails">
        <ul className="space-y-3">
          {ruleChecks.map((check) => (
            <li key={check}>- {check}</li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
