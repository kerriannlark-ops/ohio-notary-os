import { NextResponse } from "next/server";

import { buildMileageCsv } from "@/lib/exports";

export async function GET() {
  return new NextResponse(buildMileageCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="mileage-export.csv"',
    },
  });
}
