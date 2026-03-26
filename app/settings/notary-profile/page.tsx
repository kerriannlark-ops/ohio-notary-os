import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";

export default function NotaryProfileSettingsPage() {
  return (
    <SectionCard title="Notary profile" eyebrow="Commission status">
      <div className="flex flex-wrap gap-2">
        <StatusBadge label="commission active" tone="success" />
        <StatusBadge label="ron authorized" tone="success" />
        <StatusBadge label="oath complete" tone="success" />
        <StatusBadge label="seal ordered" tone="success" />
      </div>
      <dl className="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-[0.18em] text-rust">Base city</dt>
          <dd className="mt-1 text-base text-ink">Columbus, Ohio</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.18em] text-rust">Commission term</dt>
          <dd className="mt-1 text-base text-ink">March 1, 2026 to March 1, 2031</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.18em] text-rust">BCI date</dt>
          <dd className="mt-1 text-base text-ink">February 15, 2026</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.18em] text-rust">RON platform</dt>
          <dd className="mt-1 text-base text-ink">Configured</dd>
        </div>
      </dl>
    </SectionCard>
  );
}
