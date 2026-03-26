import { SectionCard } from "@/components/section-card";

export default function ContactPage() {
  return (
    <SectionCard title="Contact" eyebrow="Fastest ways to reach us">
      <ul className="space-y-3">
        <li>- Text-first booking and same-day requests</li>
        <li>- Email for document previews and business accounts</li>
        <li>- Portal messaging for booked clients and follow-up requests</li>
      </ul>
    </SectionCard>
  );
}
