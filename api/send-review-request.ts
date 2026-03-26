import { buildReviewRequest } from "../lib/notifications";

export interface SendReviewRequestInput {
  clientName: string;
  serviceType:
    | "general_notary"
    | "auto_title"
    | "power_of_attorney"
    | "affidavit"
    | "school_form"
    | "lease_document"
    | "estate_planning"
    | "loan_signing"
    | "hospital_notarization"
    | "jail_notarization"
    | "copy_certification"
    | "other";
  reviewLink: string;
}

export function sendReviewRequest(input: SendReviewRequestInput) {
  return buildReviewRequest(input);
}
