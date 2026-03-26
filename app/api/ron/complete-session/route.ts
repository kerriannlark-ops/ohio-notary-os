import { NextResponse } from "next/server";

import { completeRonSession } from "@/lib/ron";

export async function POST(request: Request) {
  const payload = await request.json();
  return NextResponse.json(completeRonSession(payload));
}
