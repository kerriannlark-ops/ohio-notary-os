export interface DeliveryPayload {
  to: string;
  subject?: string;
  body: string;
}

export interface CalendarPayload {
  title: string;
  startsAt: string;
  endsAt: string;
  location?: string;
}

export async function sendMockEmail(payload: DeliveryPayload) {
  return {
    provider: "resend-mock",
    status: "queued",
    payload,
  };
}

export async function sendMockSms(payload: DeliveryPayload) {
  return {
    provider: "twilio-mock",
    status: "queued",
    payload,
  };
}

export async function createMockCalendarEvent(payload: CalendarPayload) {
  return {
    provider: "google-calendar-mock",
    status: "created",
    payload,
  };
}

export async function createMockReviewLink(appointmentId: string) {
  return {
    provider: "review-link-mock",
    url: `https://reviews.local/${appointmentId}`,
  };
}
