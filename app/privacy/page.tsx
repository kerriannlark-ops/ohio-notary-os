import { SectionCard } from "@/components/section-card";

export default function PrivacyPage() {
  return (
    <SectionCard title="Privacy" eyebrow="Client data handling">
      <p className="text-sm text-walnut/75">Uploads, payment actions, and disclosure acceptance are designed for signed URLs, encrypted storage, and minimal client-facing PII exposure.</p>
    </SectionCard>
  );
}
