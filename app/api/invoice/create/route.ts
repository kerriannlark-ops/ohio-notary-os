import { NextResponse } from "next/server";

import { createInvoice } from "@/api/create-invoice";

export async function POST(request: Request) {
  const payload = await request.json();
  return NextResponse.json(createInvoice(payload));
}
