import { NextResponse } from "next/server";

import { createBooking } from "@/api/create-booking";

export async function POST(request: Request) {
  const payload = await request.json();
  return NextResponse.json(await createBooking(payload));
}
