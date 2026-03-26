import { ServiceType } from "./ohioRules";
import { createOhioQuote } from "./pricing";

export interface IntakeRequest {
  clientName: string;
  serviceType: ServiceType;
  documentType: string;
  actCount: number;
  requestedDate: string;
  requestedMode: "in_person" | "electronic_in_person" | "ron";
  facilityType: string;
  mileageEstimate?: number;
  travelFeeAccepted?: boolean;
  documentComplete?: boolean;
  signerHasPhysicalId?: boolean;
  ronAuthorized?: boolean;
  titleFieldsComplete?: boolean;
}

export function evaluateIntake(request: IntakeRequest) {
  const warnings: string[] = [];
  const checklist = [
    "Bring or upload the full document packet.",
    "Do not sign until instructed during the notarization.",
    "Have acceptable ID ready at the appointment.",
  ];

  if (request.serviceType === "copy_certification") {
    return {
      eligibility: "blocked",
      serviceMode: request.requestedMode,
      complianceWarnings: ["Copy certification is not supported in Ohio."],
      requiredChecklist: checklist,
      quoteInputs: null,
      schedulingSlotOptions: [],
    };
  }

  if (request.serviceType === "auto_title") {
    warnings.push("Title transfer workflow requires confirmation that no required title fields are blank.");
  }

  if (request.documentComplete === false) {
    warnings.push("Document appears incomplete and should be reviewed before booking.");
  }

  if (request.signerHasPhysicalId === false && request.requestedMode !== "ron") {
    warnings.push("In-person workflow requires acceptable ID or personal knowledge.");
  }

  if (request.requestedMode === "ron") {
    checklist.push("Signer must complete credential analysis and identity proofing.");
    checklist.push("Use a device with stable internet, camera, and microphone.");
  }

  const quote = createOhioQuote({
    actType: request.serviceType,
    actCount: request.actCount,
    isRON: request.requestedMode === "ron",
    ronAuthorized: request.ronAuthorized,
    travelMiles: request.requestedMode === "ron" ? 0 : request.mileageEstimate ?? 0,
    travelFeeAccepted: request.travelFeeAccepted,
    techFeeRequested: request.requestedMode === "ron" ? 10 : 0,
  });

  const blocked =
    quote.complianceErrors.length > 0 ||
    (request.serviceType === "auto_title" && request.titleFieldsComplete === false);

  return {
    eligibility: blocked ? "needs_review" : "bookable",
    serviceMode: request.requestedMode,
    complianceWarnings: [...warnings, ...quote.complianceErrors],
    requiredChecklist: checklist,
    quoteInputs: request,
    quote,
    schedulingSlotOptions: buildSchedulingSlots(request.requestedDate),
  };
}

function buildSchedulingSlots(requestedDate: string): string[] {
  const requested = new Date(requestedDate);

  if (Number.isNaN(requested.getTime())) {
    return [];
  }

  return [0, 2, 4].map((offsetHours) =>
    new Date(requested.getTime() + offsetHours * 60 * 60 * 1000).toISOString(),
  );
}
