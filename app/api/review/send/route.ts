import { NextResponse } from "next/server";

import { sendReviewRequest } from "@/api/send-review-request";
import { sendMockEmail, sendMockSms } from "@/lib/integrations/mocks";

export async function POST(request: Request) {
  const payload = await request.json();
  const draft = sendReviewRequest(payload);

  const delivery =
    payload.channel === "sms"
      ? await sendMockSms({
          to: payload.to,
          body: draft.sms,
        })
      : await sendMockEmail({
          to: payload.to,
          subject: draft.emailSubject,
          body: draft.emailBody,
        });

  return NextResponse.json({
    draft,
    delivery,
  });
}
