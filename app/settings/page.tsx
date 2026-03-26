import Link from "next/link";

import { SectionCard } from "@/components/section-card";

const settingAreas = [
  { href: "/settings/compliance", label: "Compliance settings", note: "Fee caps, blockers, title warnings, and journal requirements." },
  { href: "/settings/pricing", label: "Pricing settings", note: "Travel zones, after-hours surcharges, and disclosure rules." },
  { href: "/settings/notary-profile", label: "Notary profile", note: "Commission, RON, BCI, oath, and platform readiness." },
] as const;

export default function SettingsPage() {
  return (
    <SectionCard title="Settings" eyebrow="Owner controls">
      <div className="grid gap-4 md:grid-cols-3">
        {settingAreas.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[24px] bg-parchment/80 p-5 transition hover:bg-white"
          >
            <p className="text-lg font-semibold text-ink">{item.label}</p>
            <p className="mt-2 text-sm text-walnut/75">{item.note}</p>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
