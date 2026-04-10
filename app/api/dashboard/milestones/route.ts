import { NextResponse } from "next/server";

import { getLaunchMilestonesAsync } from "@/lib/launch";

export async function GET() {
  return NextResponse.json(await getLaunchMilestonesAsync());
}
