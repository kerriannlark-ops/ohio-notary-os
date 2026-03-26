import { PortalShell } from "@/components/portal-shell";
import { SectionCard } from "@/components/section-card";
import { formatCurrency } from "@/lib/formatters";
import { getPortalInvoices } from "@/lib/portal";

export default function PortalInvoicesPage() {
  return (
    <PortalShell title="Invoices + payments">
      <SectionCard title="Open balances" eyebrow="Billing">
        <div className="space-y-3">
          {getPortalInvoices().map((invoice) => (
            <div key={invoice.id} className="rounded-[22px] bg-parchment/80 p-4">
              <p className="font-semibold text-ink">{invoice.invoiceNumber}</p>
              <p className="mt-2 text-sm text-walnut/75">
                {invoice.status} · {formatCurrency(invoice.total)}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>
    </PortalShell>
  );
}
