import { SectionCard } from "@/components/section-card";

export default function ComplianceSettingsPage() {
  return (
    <SectionCard title="Compliance settings" eyebrow="Ohio rules">
      <ul className="space-y-3">
        <li>- Block copy certification and incomplete documents.</li>
        <li>- Require signer appearance and ID capture on every workflow.</li>
        <li>- Keep title-transfer warning banners visible until owner clears them.</li>
        <li>- Require RON journal, recording metadata, and credential checks before completion.</li>
      </ul>
    </SectionCard>
  );
}
