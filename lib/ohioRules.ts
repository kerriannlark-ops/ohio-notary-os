export type AppearanceType = "in_person" | "ron";

export type ServiceType =
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

export type SpecialLocationType =
  | "standard"
  | "hospital"
  | "nursing_home"
  | "hospice"
  | "jail"
  | "title_office";

export type IdDocumentType =
  | "drivers_license"
  | "state_id"
  | "passport"
  | "military_id"
  | "government_id"
  | "personal_knowledge"
  | "credible_witness";

export type IdCaptureMethod =
  | "personal_knowledge"
  | "government_id"
  | "credible_witness"
  | "credential_analysis";

export interface NotarialCertificateData {
  venueState?: string;
  venueCounty?: string;
  notarizedAt?: string;
  commissionExpirationDate?: string;
  sealApplied?: boolean;
}

export interface OhioRuleSummary {
  rule: string;
  description: string;
}

export const OHIO_FEE_LIMITS = {
  inPersonActMax: 5,
  ronActMax: 30,
  ronTechnologyFeeMax: 10,
} as const;

export const OHIO_VALIDITY_WINDOWS = {
  bciMaxAgeMonths: 6,
  educationMaxAgeMonths: 12,
  idExpirationGraceYears: 3,
  journalRetentionYears: 10,
} as const;

export const OHIO_COMMISSION_TERM_YEARS = 5;

export const UNSUPPORTED_SERVICE_TYPES: ServiceType[] = ["copy_certification"];

export const SPECIAL_LOCATION_SURCHARGES: Record<SpecialLocationType, number> = {
  standard: 0,
  hospital: 20,
  nursing_home: 20,
  hospice: 20,
  jail: 40,
  title_office: 0,
};

export const OHIO_RULE_SUMMARY: OhioRuleSummary[] = [
  {
    rule: "personal_appearance_required",
    description:
      "The signer must appear before the notary in person or through a compliant Ohio RON session.",
  },
  {
    rule: "id_required",
    description:
      "The signer must be identified by personal knowledge or satisfactory evidence from an allowed ID method.",
  },
  {
    rule: "id_expiration_limit",
    description:
      "An in-person ID must be current or expired no more than 3 years before the notarization date.",
  },
  {
    rule: "no_blank_documents",
    description: "Do not notarize incomplete documents or blank title sections.",
  },
  {
    rule: "no_copy_certification",
    description:
      "Ohio notaries should not certify that a document is a true copy of another record.",
  },
  {
    rule: "traditional_fee_cap",
    description: "In-person notarial acts are capped at $5 per act.",
  },
  {
    rule: "ron_fee_cap",
    description:
      "Online notarizations are capped at $30 per act plus up to $10 in technology fees per session.",
  },
  {
    rule: "travel_fee_disclosure",
    description:
      "Travel fees are allowed only when separately disclosed and agreed to in advance.",
  },
  {
    rule: "ron_journal_required",
    description:
      "RON acts require an electronic journal entry and audiovisual record retention.",
  },
];

export function getMaximumActFee(isRon: boolean): number {
  return isRon ? OHIO_FEE_LIMITS.ronActMax : OHIO_FEE_LIMITS.inPersonActMax;
}

export function isUnsupportedServiceType(serviceType: ServiceType): boolean {
  return UNSUPPORTED_SERVICE_TYPES.includes(serviceType);
}

export function requiresTitleChecklist(serviceType: ServiceType): boolean {
  return serviceType === "auto_title";
}

export function requiresElectronicJournal(appearanceType: AppearanceType): boolean {
  return appearanceType === "ron";
}

export function requiresCredentialAnalysis(appearanceType: AppearanceType): boolean {
  return appearanceType === "ron";
}

export function requiresIdentityProofing(appearanceType: AppearanceType): boolean {
  return appearanceType === "ron";
}

export function isAllowedIdDocument(idType: IdDocumentType): boolean {
  return [
    "drivers_license",
    "state_id",
    "passport",
    "military_id",
    "government_id",
    "personal_knowledge",
    "credible_witness",
  ].includes(idType);
}

export function isValidOhioIdExpiration(
  expirationDate?: string | null,
  referenceDate?: string | null,
): boolean {
  if (!expirationDate) {
    return false;
  }

  const expiration = new Date(expirationDate);
  const reference = referenceDate ? new Date(referenceDate) : new Date();

  if (Number.isNaN(expiration.getTime()) || Number.isNaN(reference.getTime())) {
    return false;
  }

  if (expiration >= reference) {
    return true;
  }

  const cutoff = new Date(reference);
  cutoff.setFullYear(
    cutoff.getFullYear() - OHIO_VALIDITY_WINDOWS.idExpirationGraceYears,
  );

  return expiration >= cutoff;
}

export function isBeforeCommissionStart(
  appointmentDate?: string | null,
  commissionStartDate?: string | null,
): boolean {
  if (!appointmentDate || !commissionStartDate) {
    return false;
  }

  const appointment = new Date(appointmentDate);
  const commissionStart = new Date(commissionStartDate);

  if (Number.isNaN(appointment.getTime()) || Number.isNaN(commissionStart.getTime())) {
    return false;
  }

  return appointment < commissionStart;
}

export function hasCompleteCertificateData(
  certificate: NotarialCertificateData | undefined,
): boolean {
  if (!certificate) {
    return false;
  }

  return Boolean(
    certificate.venueState &&
      certificate.venueCounty &&
      certificate.notarizedAt &&
      certificate.commissionExpirationDate &&
      certificate.sealApplied,
  );
}
