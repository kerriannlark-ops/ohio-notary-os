import { NextResponse } from "next/server";

import { createJournalEntryDraft } from "@/lib/journal";

export async function POST(request: Request) {
  const payload = await request.json();
  return NextResponse.json(createJournalEntryDraft(payload));
}
