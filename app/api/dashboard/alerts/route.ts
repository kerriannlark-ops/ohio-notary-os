import { NextResponse } from "next/server";

import { getLaunchAlertsAsync } from "@/lib/launch";

export async function GET() {
  return NextResponse.json(await getLaunchAlertsAsync());
}
