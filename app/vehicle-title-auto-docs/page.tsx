import { ComplianceBanner } from "@/components/compliance-banner";
import { PublicHero } from "@/components/public-hero";
import { SectionCard } from "@/components/section-card";

export default function VehicleTitlePage() {
  return (
    <div className="space-y-6">
      <PublicHero title="Ohio vehicle title and auto-document appointments with extra screening." subtitle="Title-related requests are reviewed carefully because blank transfer sections and incomplete title details can block the appointment." />
      <SectionCard title="Title warning" eyebrow="High-risk workflow">
        <ComplianceBanner
          items={[
            "Do not book if buyer, seller, reassignment, or other required title fields are blank.",
            "The notary cannot decide whether title paperwork is legally sufficient.",
            "Bring matching ID and the final title packet to the appointment.",
          ]}
          title="Ohio title-transfer warning"
        />
      </SectionCard>
    </div>
  );
}
