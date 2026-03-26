import { NextResponse } from "next/server";

import { getPortalAppointments } from "@/lib/portal";

export async function GET() {
  return NextResponse.json(getPortalAppointments());
}
