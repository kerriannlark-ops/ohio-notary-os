import { NextResponse } from "next/server";

import { quoteBooking } from "@/api/quote-booking";

export async function POST(request: Request) {
  const payload = await request.json();
  return NextResponse.json(quoteBooking(payload));
}
