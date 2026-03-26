import { QuoteResult } from "@/lib/pricing";
import { formatCurrency } from "@/lib/formatters";

export function QuoteBreakdown({ quote }: { quote: QuoteResult }) {
  return (
    <div className="space-y-3">
      {quote.lineItems.map((item) => (
        <div
          key={item.code}
          className="flex flex-col gap-1 rounded-[20px] bg-parchment/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
        >
          <span className="text-sm text-walnut/80">{item.label}</span>
          <span className="font-semibold text-ink sm:text-right">{formatCurrency(item.amount)}</span>
        </div>
      ))}
      <div className="flex flex-col gap-1 rounded-[22px] bg-ink px-4 py-3 text-parchment sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span className="font-semibold">Estimated total</span>
        <span className="font-semibold sm:text-right">{formatCurrency(quote.total)}</span>
      </div>
    </div>
  );
}
