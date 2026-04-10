import { NextResponse } from "next/server";

import { getReadinessSummaryAsync } from "@/lib/launch";

export async function GET() {
  return NextResponse.json(await getReadinessSummaryAsync());
}
