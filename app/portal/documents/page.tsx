import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { getPortalDocuments } from "@/lib/portal";

export default function PortalDocumentsPage() {
  return (
    <PortalShell title="Documents">
      <SectionCard title="Uploaded files" eyebrow="Portal storage">
        <div className="space-y-3">
          {getPortalDocuments().map((document) => (
            <div key={document.id} className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">{document.fileName}</p>
              <p className="mt-2 text-sm text-walnut/75">
                {document.mimeType} · {document.reviewed ? "Reviewed" : "Pending review"}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </PortalShell>
  );
}
