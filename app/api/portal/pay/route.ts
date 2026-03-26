import { NextResponse } from "next/server";

import { createMockPaymentIntent, markMockPaymentPaid } from "@/lib/payments";

export async function POST(request: Request) {
  const payload = await request.json();

  return NextResponse.json({
    intent: createMockPaymentIntent(payload),
    paidPreview: markMockPaymentPaid(payload),
  });
}
