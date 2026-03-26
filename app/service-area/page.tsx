import { SectionCard } from "@/components/section-card";
import { landingPageStats } from "@/lib/mockData";

export default function ServiceAreaPage() {
  return (
    <SectionCard title="Service area" eyebrow="Columbus + nearby coverage">
      <p className="mb-5 text-sm text-walnut/75">
        Columbus is the primary base, with Franklin County and nearby suburbs supported through disclosed travel zones.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {landingPageStats.slice(0, 6).map((item) => (
          <div key={item.slug} className="rounded-[22px] bg-parchment/80 p-4">
            <p className="font-semibold text-ink">{item.title}</p>
            <p className="mt-2 text-sm text-walnut/75">{item.visits} local visitors tracked</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
