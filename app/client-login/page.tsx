import { SectionCard } from "@/components/section-card";

export default function ClientLoginPage() {
  return (
    <SectionCard title="Client login" eyebrow="Passwordless portal access">
      <p className="text-sm text-walnut/75">
        Phase 2 is set up for magic-link or SMS-based client access. Portal users can review quotes, upload documents, complete checklists, pay invoices, and message the notary without seeing internal compliance notes.
      </p>
    </SectionCard>
  );
}
