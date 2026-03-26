import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { formatDateTime } from "@/lib/formatters";
import { getPortalMessages } from "@/lib/portal";

export default function PortalMessagesPage() {
  return (
    <PortalShell title="Messages">
      <SectionCard title="Portal messages" eyebrow="Client communication">
        <div className="space-y-3">
          {getPortalMessages().map((message) => (
            <div key={message.id} className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">{message.messageType.replaceAll("_", " ")}</p>
              <p className="mt-2 text-sm text-walnut/75">{message.body}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-rust">
                {formatDateTime(message.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </PortalShell>
  );
}
