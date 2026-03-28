import { NextResponse } from "next/server";

import { getGoalsAsync } from "@/lib/launch";

export async function GET() {
  return NextResponse.json(await getGoalsAsync());
}
