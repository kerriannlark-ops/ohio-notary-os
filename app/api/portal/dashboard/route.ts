import { NextResponse } from "next/server";

import { getPortalDashboard } from "@/lib/portal";

export async function GET() {
  return NextResponse.json(getPortalDashboard());
}
