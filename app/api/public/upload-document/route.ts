import { NextResponse } from "next/server";

import { createMockUpload } from "@/lib/uploads";

export async function POST(request: Request) {
  const payload = await request.json();
  return NextResponse.json(createMockUpload(payload));
}
