import { NextResponse } from "next/server";

import { getLaunchTaskQueueAsync } from "@/lib/launch";

export async function GET() {
  return NextResponse.json(await getLaunchTaskQueueAsync());
}
