import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();

  return NextResponse.json({
    appointmentId: payload.appointmentId,
    requestedTime: payload.requestedTime,
    status: "under_review",
    message: "Reschedule request received and routed for manual review.",
  });
}
