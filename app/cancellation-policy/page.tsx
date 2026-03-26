import { SectionCard } from "@/components/section-card";

export default function CancellationPolicyPage() {
  return (
    <SectionCard title="Cancellation policy" eyebrow="Booking rules">
      <ul className="space-y-3">
        <li>- Cancellation and no-show acceptance is captured as a booking disclosure.</li>
        <li>- Scope changes require an updated quote before new charges are applied.</li>
        <li>- Variable add-ons are not auto-charged without review.</li>
      </ul>
    </SectionCard>
  );
}
