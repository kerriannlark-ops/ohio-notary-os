import {
  AppearanceType,
  IdCaptureMethod,
  IdDocumentType,
  NotarialCertificateData,
  ServiceType,
  hasCompleteCertificateData,
  isAllowedIdDocument,
  isBeforeCommissionStart,
  isUnsupportedServiceType,
  isValidOhioIdExpiration,
  requiresCredentialAnalysis,
  requiresElectronicJournal,
  requiresIdentityProofing,
  requiresTitleChecklist,
} from "./ohioRules";

export type ComplianceSeverity = "error" | "warning";

export interface ComplianceFlag {
  code: string;
  severity: ComplianceSeverity;
  message: string;
}

export interface AppointmentComplianceInput {
  appointmentDate?: string;
  commissionStartDate?: string;
  appearanceType: AppearanceType;
  serviceType: ServiceType;
  signerPresent: boolean;
  documentComplete: boolean;
  hasNotarialCertificate: boolean;
  certificate?: NotarialCertificateData;
  requestedCopyCertification?: boolean;
  titleFieldsComplete?: boolean;
  signerCoerced?: boolean;
  signerMentallyCapable?: boolean;
  idDocumentType?: IdDocumentType;
  idExpirationDate?: string | null;
  idCaptureMethod?: IdCaptureMethod;
  signerKnownPersonally?: boolean;
  ronAuthorized?: boolean;
  credentialAnalysisPassed?: boolean;
  identityProofingPassed?: boolean;
  electronicJournalCreated?: boolean;
  audioVideoRecordingStored?: boolean;
}

export interface ComplianceResult {
  ok: boolean;
  blockingIssues: ComplianceFlag[];
  warnings: ComplianceFlag[];
}

export function validateAppointmentCompliance(
  input: AppointmentComplianceInput,
): ComplianceResult {
  const blockingIssues: ComplianceFlag[] = [];
  const warnings: ComplianceFlag[] = [];

  if (isBeforeCommissionStart(input.appointmentDate, input.commissionStartDate)) {
    blockingIssues.push({
      code: "commission_not_started",
      severity: "error",
      message: "Reject booking because the requested date is before commission start.",
    });
  }

  if (!input.signerPresent) {
    blockingIssues.push({
      code: "signer_absent",
      severity: "error",
      message: "The signer must personally appear for in-person or compliant RON notarization.",
    });
  }

  if (!input.documentComplete) {
    blockingIssues.push({
      code: "incomplete_document",
      severity: "error",
      message: "Do not proceed with blank or incomplete documents.",
    });
  }

  if (!input.hasNotarialCertificate) {
    blockingIssues.push({
      code: "missing_certificate",
      severity: "error",
      message: "A complete notarial certificate is required before completion.",
    });
  }

  if (input.hasNotarialCertificate && !hasCompleteCertificateData(input.certificate)) {
    warnings.push({
      code: "certificate_incomplete",
      severity: "warning",
      message:
        "Certificate exists but venue, date, commission expiration, or seal data is still incomplete.",
    });
  }

  if (input.requestedCopyCertification || isUnsupportedServiceType(input.serviceType)) {
    blockingIssues.push({
      code: "copy_certification_blocked",
      severity: "error",
      message: "Copy certification requests should be blocked for Ohio notarial work.",
    });
  }

  if (requiresTitleChecklist(input.serviceType) && input.titleFieldsComplete === false) {
    blockingIssues.push({
      code: "title_blank_fields",
      severity: "error",
      message: "Ohio vehicle title work cannot proceed with blank title fields.",
    });
  }

  if (input.signerCoerced) {
    blockingIssues.push({
      code: "coercion_flag",
      severity: "error",
      message: "Stop the notarization if the signer appears coerced.",
    });
  }

  if (input.signerMentallyCapable === false) {
    blockingIssues.push({
      code: "capacity_flag",
      severity: "error",
      message: "Stop the notarization if the signer does not appear mentally capable.",
    });
  }

  const identifiedByKnowledge = Boolean(input.signerKnownPersonally);
  const identifiedByAllowedDocument = input.idDocumentType
    ? isAllowedIdDocument(input.idDocumentType)
    : false;

  if (!identifiedByKnowledge && !identifiedByAllowedDocument) {
    blockingIssues.push({
      code: "invalid_id_method",
      severity: "error",
      message:
        "Signer identification must come from personal knowledge or a permitted Ohio ID method.",
    });
  }

  if (!input.idCaptureMethod) {
    blockingIssues.push({
      code: "missing_id_capture",
      severity: "error",
      message: "ID capture method must be stored for every appointment.",
    });
  }

  if (
    input.appearanceType === "in_person" &&
    input.idDocumentType &&
    input.idDocumentType !== "personal_knowledge" &&
    input.idDocumentType !== "credible_witness" &&
    !isValidOhioIdExpiration(input.idExpirationDate, input.appointmentDate)
  ) {
    blockingIssues.push({
      code: "id_expired",
      severity: "error",
      message:
        "In-person ID must be current or expired no more than 3 years before the appointment.",
    });
  }

  if (input.appearanceType === "ron" && !input.ronAuthorized) {
    blockingIssues.push({
      code: "ron_not_authorized",
      severity: "error",
      message: "RON cannot proceed until the notary's Ohio online authorization is active.",
    });
  }

  if (
    requiresCredentialAnalysis(input.appearanceType) &&
    !input.credentialAnalysisPassed
  ) {
    blockingIssues.push({
      code: "credential_analysis_missing",
      severity: "error",
      message: "RON requires successful credential analysis before completion.",
    });
  }

  if (requiresIdentityProofing(input.appearanceType) && !input.identityProofingPassed) {
    blockingIssues.push({
      code: "identity_proofing_missing",
      severity: "error",
      message: "RON requires identity proofing before completion.",
    });
  }

  if (
    requiresElectronicJournal(input.appearanceType) &&
    !input.electronicJournalCreated
  ) {
    blockingIssues.push({
      code: "electronic_journal_missing",
      severity: "error",
      message: "RON appointments require an electronic journal entry.",
    });
  }

  if (
    requiresElectronicJournal(input.appearanceType) &&
    !input.audioVideoRecordingStored
  ) {
    warnings.push({
      code: "recording_storage_missing",
      severity: "warning",
      message:
        "RON appointments should store an audiovisual recording with backup retention controls.",
    });
  }

  return {
    ok: blockingIssues.length === 0,
    blockingIssues,
    warnings,
  };
}
