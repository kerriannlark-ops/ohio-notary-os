import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();

  return NextResponse.json({
    invoiceNumber: payload.invoiceNumber,
    paymentStatus: "paid",
    paidAt: new Date().toISOString(),
    paymentMethod: payload.paymentMethod ?? "unknown",
  });
}
