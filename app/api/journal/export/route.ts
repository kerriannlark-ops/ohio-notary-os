import { NextResponse } from "next/server";

import { buildJournalCsv } from "@/lib/exports";

export async function POST() {
  return new NextResponse(buildJournalCsv(), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="journal-export.csv"',
    },
  });
}
