import { NextResponse } from "next/server";

import { buildRevenueCsv } from "@/lib/exports";

export async function GET() {
  return new NextResponse(buildRevenueCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="revenue-export.csv"',
    },
  });
}
