import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();

  return NextResponse.json({
    appointmentId: payload.appointmentId,
    previousStatus: payload.previousStatus ?? "booked",
    nextStatus: payload.nextStatus,
    updatedAt: new Date().toISOString(),
  });
}
