import { NextResponse } from "next/server";

import { getCommandCenterDataAsync } from "@/lib/launch";

export async function GET() {
  return NextResponse.json(await getCommandCenterDataAsync());
}
