import { QuoteResult } from "@/lib/pricing";
import { formatCurrency } from "@/lib/formatters";

export function QuoteBreakdown({ quote }: { quote: QuoteResult }) {
  return (
    <div className="space-y-3">
      {quote.lineItems.map((item) => (
        <div key={item.code} className="flex items-center justify-between rounded-[20px] bg-parchment/80 px-4 py-3">
          <span className="text-sm text-walnut/80">{item.label}</span>
          <span className="font-semibold text-ink">{formatCurrency(item.amount)}</span>
        </div>
      ))}
      <div className="flex items-center justify-between rounded-[22px] bg-ink px-4 py-3 text-parchment">
        <span className="font-semibold">Estimated total</span>
        <span className="font-semibold">{formatCurrency(quote.total)}</span>
      </div>
    </div>
  );
}
