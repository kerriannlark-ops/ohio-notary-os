import { NextResponse } from "next/server";

import { canCompleteServiceAsync } from "@/lib/launch";

export async function POST(request: Request) {
  const payload = await request.json();
  const unresolvedBlockingFlags = Number(payload.unresolvedBlockingFlags ?? 0);
  const readiness =
    payload.nextStatus === "completed"
      ? await canCompleteServiceAsync(payload.serviceMode === "ron" ? "ron" : "in_person", unresolvedBlockingFlags)
      : { ok: true, blockers: [] as string[] };

  return NextResponse.json({
    appointmentId: payload.appointmentId,
    previousStatus: payload.previousStatus ?? "booked",
    nextStatus: readiness.ok ? payload.nextStatus : payload.previousStatus ?? "booked",
    readiness,
    updatedAt: new Date().toISOString(),
  });
}
