import { PublicHero } from "@/components/public-hero";
import { SectionCard } from "@/components/section-card";

export default function RemoteOnlineNotaryPage() {
  return (
    <div className="space-y-6">
      <PublicHero title="Remote online notarization for Ohio-ready digital closings." subtitle="RON is available only when the notary is actively authorized in Ohio and the signer can complete identity proofing, credential analysis, and live audio-video." />
      <SectionCard title="RON requirements" eyebrow="Ohio workflow">
        <ul className="space-y-3">
          <li>- Device with camera, microphone, and stable internet.</li>
          <li>- Acceptable ID for credential analysis and identity proofing.</li>
          <li>- Upload the final document packet before session start.</li>
        </ul>
      </SectionCard>
    </div>
  );
}
