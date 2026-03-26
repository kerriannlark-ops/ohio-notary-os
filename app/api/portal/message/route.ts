import { NextResponse } from "next/server";

import { createPortalMessage } from "@/lib/portal";

export async function POST(request: Request) {
  const payload = await request.json();
  return NextResponse.json(createPortalMessage(payload.body, payload.appointmentId));
}
