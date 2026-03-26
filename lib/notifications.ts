import { AppearanceType, ServiceType } from "./ohioRules";

export interface ReminderInput {
  clientName: string;
  appointmentDate: string;
  appearanceType: AppearanceType;
  serviceType: ServiceType;
  locationLabel: string;
}

export interface ReviewRequestInput {
  clientName: string;
  reviewLink: string;
  serviceType: ServiceType;
}

export interface ReminderBundle {
  sms: string;
  emailSubject: string;
  emailBody: string;
}

export function buildAppointmentReminder(input: ReminderInput): ReminderBundle {
  const appearanceLabel =
    input.appearanceType === "ron" ? "online notarization" : "mobile notary appointment";

  return {
    sms:
      `Reminder: your ${appearanceLabel} for ${formatServiceType(input.serviceType)} ` +
      `is scheduled for ${input.appointmentDate} at ${input.locationLabel}. ` +
      "Please have photo ID and unsigned documents ready.",
    emailSubject: `Reminder for your ${formatServiceType(input.serviceType)} appointment`,
    emailBody:
      `Hi ${input.clientName},\n\n` +
      `This is a reminder that your ${appearanceLabel} is set for ${input.appointmentDate} ` +
      `at ${input.locationLabel}.\n\n` +
      buildChecklistText(input.appearanceType) +
      "\n\nReply if anything has changed before the appointment.",
  };
}

export function buildReviewRequest(input: ReviewRequestInput): ReminderBundle {
  return {
    sms:
      `Thank you, ${input.clientName}. If today's ${formatServiceType(input.serviceType)} ` +
      `appointment was helpful, would you leave a quick review? ${input.reviewLink}`,
    emailSubject: "Thank you for choosing Ohio Notary OS",
    emailBody:
      `Hi ${input.clientName},\n\n` +
      "Thank you for trusting Ohio Notary OS with your appointment.\n\n" +
      `If you have a minute, please leave a review here: ${input.reviewLink}\n\n` +
      "Your feedback helps future clients feel confident booking.",
  };
}

export function buildDocumentChecklist(appearanceType: AppearanceType): string[] {
  const checklist = [
    "Bring or upload the full document packet before the appointment.",
    "Do not sign until instructed during the notarization.",
    "Have an acceptable ID available.",
  ];

  if (appearanceType === "ron") {
    checklist.push("Use a device with a camera, microphone, and stable internet.");
    checklist.push("Expect credential analysis and identity proofing before the notarization.");
  }

  return checklist;
}

function buildChecklistText(appearanceType: AppearanceType): string {
  return (
    "Before we meet:\n- " + buildDocumentChecklist(appearanceType).join("\n- ")
  );
}

function formatServiceType(serviceType: ServiceType): string {
  return serviceType.replaceAll("_", " ");
}
