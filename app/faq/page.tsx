import { SectionCard } from "@/components/section-card";
import { publicFaqs } from "@/lib/publicSite";

export default function FaqPage() {
  return (
    <SectionCard title="Frequently asked questions" eyebrow="Client education">
      <div className="space-y-4">
        {publicFaqs.map((faq) => (
          <article key={faq.question} className="rounded-[22px] bg-parchment/80 p-4">
            <h3 className="text-lg font-semibold text-ink">{faq.question}</h3>
            <p className="mt-2 text-sm leading-6 text-walnut/76">{faq.answer}</p>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
