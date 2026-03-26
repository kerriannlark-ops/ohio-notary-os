import { notFound } from "next/navigation";

import { SectionCard } from "@/components/section-card";
import { formatCurrency, formatLabel } from "@/lib/formatters";
import { mockAppointments } from "@/lib/mockData";
import { createOhioQuote } from "@/lib/pricing";

export default function QuoteDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const appointment = mockAppointments.find((item) => item.id === params.id);

  if (!appointment) {
    notFound();
  }

  const quote = createOhioQuote({
    actType: appointment.serviceType,
    actCount: appointment.actCount,
    isRON: appointment.serviceMode === "ron",
    ronAuthorized: appointment.serviceMode === "ron",
    travelMiles: appointment.travelMiles,
    travelFeeAccepted: appointment.travelMiles > 0,
    isAfterHours: appointment.afterHours,
    techFeeRequested: appointment.serviceMode === "ron" ? 10 : 0,
  });

  return (
    <SectionCard title={`Quote ${appointment.id}`} eyebrow="Fee explanation">
      <div className="space-y-3">
        {quote.lineItems.map((lineItem) => (
          <div
            key={lineItem.code}
            className="flex items-center justify-between rounded-[20px] bg-parchment/80 px-4 py-3"
          >
            <p>{formatLabel(lineItem.label)}</p>
            <p className="font-semibold text-ink">{formatCurrency(lineItem.amount)}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-walnut/75">
        Ohio caps notarial acts at {appointment.serviceMode === "ron" ? "$30 per act" : "$5 per act"}.
        Travel appears only after disclosure and acceptance. RON tech fees stay at or under $10 per session.
      </p>
      <p className="mt-4 text-xl font-semibold text-ink">Total: {formatCurrency(quote.total)}</p>
    </SectionCard>
  );
}
