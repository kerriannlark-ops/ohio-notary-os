import { validateAppointmentCompliance } from "../lib/compliance";

export interface CompleteAppointmentRequest {
  appointmentId: string;
  appearanceType: "in_person" | "ron";
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
  appointmentDate: string;
  commissionStartDate: string;
  signerPresent: boolean;
  documentComplete: boolean;
  hasNotarialCertificate: boolean;
  certificate: {
    venueState: string;
    venueCounty: string;
    notarizedAt: string;
    commissionExpirationDate: string;
    sealApplied: boolean;
  };
  idDocumentType: "drivers_license" | "passport" | "state_id" | "government_id" | "personal_knowledge";
  idCaptureMethod: "government_id" | "credential_analysis" | "personal_knowledge";
  idExpirationDate?: string;
  ronAuthorized?: boolean;
  credentialAnalysisPassed?: boolean;
  identityProofingPassed?: boolean;
  electronicJournalCreated?: boolean;
  audioVideoRecordingStored?: boolean;
  titleFieldsComplete?: boolean;
}

export function completeAppointment(request: CompleteAppointmentRequest) {
  const compliance = validateAppointmentCompliance({
    appointmentDate: request.appointmentDate,
    commissionStartDate: request.commissionStartDate,
    appearanceType: request.appearanceType,
    serviceType: request.serviceType,
    signerPresent: request.signerPresent,
    documentComplete: request.documentComplete,
    hasNotarialCertificate: request.hasNotarialCertificate,
    certificate: request.certificate,
    idDocumentType: request.idDocumentType,
    idCaptureMethod: request.idCaptureMethod,
    idExpirationDate: request.idExpirationDate,
    signerMentallyCapable: true,
    ronAuthorized: request.ronAuthorized,
    credentialAnalysisPassed: request.credentialAnalysisPassed,
    identityProofingPassed: request.identityProofingPassed,
    electronicJournalCreated: request.electronicJournalCreated,
    audioVideoRecordingStored: request.audioVideoRecordingStored,
    titleFieldsComplete: request.titleFieldsComplete,
  });

  return {
    appointmentId: request.appointmentId,
    status: compliance.ok ? "completed" : "blocked",
    compliance,
  };
}
