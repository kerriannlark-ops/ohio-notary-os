import { NextResponse } from "next/server";

import { updateMilestoneAsync } from "@/lib/launch";

export async function POST(request: Request) {
  const payload = await request.json();
  return NextResponse.json(await updateMilestoneAsync(payload));
}
