export interface MockPaymentInput {
  appointmentId: string;
  invoiceId?: string;
  amount: number;
  provider?: "stripe" | "manual";
}

export function createMockPaymentIntent(input: MockPaymentInput) {
  return {
    id: `pi_${input.appointmentId}`,
    appointmentId: input.appointmentId,
    invoiceId: input.invoiceId ?? null,
    amount: input.amount,
    provider: input.provider ?? "stripe",
    status: "pending",
    clientSecret: `mock_secret_${input.appointmentId}`,
  };
}

export function markMockPaymentPaid(input: MockPaymentInput) {
  return {
    id: `pi_${input.appointmentId}`,
    appointmentId: input.appointmentId,
    amount: input.amount,
    provider: input.provider ?? "stripe",
    status: "succeeded",
    paidAt: new Date().toISOString(),
    receiptUrl: `/portal/invoices/${input.appointmentId}`,
  };
}
