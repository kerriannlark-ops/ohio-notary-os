import { NextResponse } from "next/server";

import { getPortalInvoices } from "@/lib/portal";

export async function GET() {
  return NextResponse.json(getPortalInvoices());
}
