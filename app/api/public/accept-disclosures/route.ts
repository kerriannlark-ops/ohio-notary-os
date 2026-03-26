import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = await request.json();
  const headerStore = await headers();

  return NextResponse.json({
    appointmentId: payload.appointmentId,
    travelFeeAccepted: Boolean(payload.travelFeeAccepted),
    cancellationPolicyAccepted: Boolean(payload.cancellationPolicyAccepted),
    privacyPolicyAccepted: Boolean(payload.privacyPolicyAccepted),
    portalTermsAccepted: Boolean(payload.portalTermsAccepted),
    acceptedAt: new Date().toISOString(),
    acceptedIp:
      headerStore.get("x-forwarded-for") ??
      headerStore.get("x-real-ip") ??
      "127.0.0.1",
  });
}
