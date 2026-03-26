import { QuoteResult } from "../lib/pricing";

export interface CreateInvoiceRequest {
  appointmentId: string;
  clientName: string;
  channel: "employer" | "private";
  quote: QuoteResult;
}

export function createInvoice(request: CreateInvoiceRequest) {
  const invoiceNumber = `INV-${request.appointmentId.toUpperCase()}`;

  return {
    invoiceNumber,
    appointmentId: request.appointmentId,
    billTo: request.clientName,
    channel: request.channel,
    subtotal: request.quote.subtotal,
    total: request.quote.total,
    lineItems: request.quote.lineItems,
    paymentStatus: "draft",
    taxesEnabled: false,
  };
}
