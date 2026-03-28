import { NextResponse } from "next/server";

import { startRonSession } from "@/lib/ron";

export async function POST(request: Request) {
  const payload = await request.json();
  return NextResponse.json(await startRonSession(payload));
}
