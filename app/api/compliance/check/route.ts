import { NextResponse } from "next/server";

import { validateAppointmentCompliance } from "@/lib/compliance";

export async function POST(request: Request) {
  const payload = await request.json();
  return NextResponse.json(validateAppointmentCompliance(payload));
}
