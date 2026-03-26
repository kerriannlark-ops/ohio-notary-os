import { validateAppointmentCompliance } from "../lib/compliance";
import { createOhioQuote, QuoteInput } from "../lib/pricing";

export interface QuoteBookingRequest extends QuoteInput {
  signerPresent: boolean;
  documentComplete: boolean;
  hasNotarialCertificate: boolean;
  titleFieldsComplete?: boolean;
}

export function quoteBooking(request: QuoteBookingRequest) {
  const quote = createOhioQuote(request);
  const compliance = validateAppointmentCompliance({
    appointmentDate: new Date().toISOString(),
    appearanceType: request.isRON ? "ron" : "in_person",
    serviceType: request.actType,
    signerPresent: request.signerPresent,
    documentComplete: request.documentComplete,
    hasNotarialCertificate: request.hasNotarialCertificate,
    titleFieldsComplete: request.titleFieldsComplete,
    signerMentallyCapable: true,
    idDocumentType: request.isRON ? "passport" : "drivers_license",
    idExpirationDate: "2028-01-01",
    idCaptureMethod: request.isRON ? "credential_analysis" : "government_id",
    ronAuthorized: request.ronAuthorized,
    credentialAnalysisPassed: request.isRON ? true : undefined,
    identityProofingPassed: request.isRON ? true : undefined,
    electronicJournalCreated: request.isRON ? true : undefined,
  });

  return {
    quote,
    compliance,
    blocked: !quote.isValid || !compliance.ok,
  };
}
