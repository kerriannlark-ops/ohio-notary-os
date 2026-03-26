import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();

  return NextResponse.json({
    appointmentId: payload.appointmentId,
    status: "cancel_requested",
    message: "Cancellation request received. Policy review may still apply.",
  });
}
