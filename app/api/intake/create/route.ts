import { NextResponse } from "next/server";

import { evaluateIntake } from "@/lib/intake";

export async function POST(request: Request) {
  const payload = await request.json();
  return NextResponse.json(evaluateIntake(payload));
}
