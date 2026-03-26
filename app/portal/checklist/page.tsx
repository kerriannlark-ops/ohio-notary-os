import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { getPortalChecklist } from "@/lib/portal";

export default function PortalChecklistPage() {
  return (
    <PortalShell title="Prep checklist">
      <SectionCard title="Missing items" eyebrow="Complete before appointment">
        <div className="space-y-3">
          {getPortalChecklist().map((item) => (
            <div key={item.id} className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">{item.label}</p>
              <p className="mt-2 text-sm text-walnut/75">
                {item.completed ? "Completed" : "Still needed"}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </PortalShell>
  );
}
