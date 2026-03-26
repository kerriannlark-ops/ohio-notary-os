import { NextResponse } from "next/server";

import { getPortalMessages } from "@/lib/portal";

export async function GET() {
  return NextResponse.json(getPortalMessages());
}
