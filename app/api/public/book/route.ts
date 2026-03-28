import { NextResponse } from "next/server";

import { createBooking } from "@/api/create-booking";
import { createMockCalendarEvent } from "@/lib/integrations/mocks";

export async function POST(request: Request) {
  const payload = await request.json();
  const booking = await createBooking(payload);
  const calendar = await createMockCalendarEvent({
    title: `${payload.clientName} notary appointment`,
    startsAt: payload.appointmentDate,
    endsAt: payload.appointmentDate,
    location: payload.locationLabel ?? "TBD",
  });

  return NextResponse.json({
    booking,
    calendar,
    portalNextStep: "Create or log into your client portal account to upload documents.",
  });
}
