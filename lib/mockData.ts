import { createOhioQuote } from "./pricing";
import { ServiceType, SpecialLocationType } from "./ohioRules";

export type Channel = "employer" | "private";
export type ServiceMode = "in_person" | "electronic_in_person" | "ron";
export type AppointmentStatus =
  | "lead"
  | "awaiting_documents"
  | "awaiting_id_confirmation"
  | "quoted"
  | "booked"
  | "en_route"
  | "signer_not_ready"
  | "completed"
  | "refused"
  | "cancelled"
  | "no_show"
  | "follow_up_needed";

export type ClientPortalStatus =
  | "inquiry_received"
  | "under_review"
  | "quote_sent"
  | "awaiting_acceptance"
  | "booked"
  | "awaiting_documents"
  | "awaiting_id_confirmation"
  | "ready_for_appointment"
  | "in_progress"
  | "completed"
  | "invoice_due"
  | "closed"
  | "could_not_complete";

export interface DemoAppointment {
  id: string;
  clientName: string;
  channel: Channel;
  serviceMode: ServiceMode;
  serviceType: ServiceType;
  status: AppointmentStatus;
  scheduledStart: string;
  zip: string;
  facilityType: string;
  travelMiles: number;
  actCount: number;
  total: number;
  afterHours: boolean;
  blocked: boolean;
  blockedReason?: string;
  complianceFlags: string[];
  reviewSent: boolean;
}

interface DemoSeedInput {
  id: string;
  clientName: string;
  channel: Channel;
  serviceMode: ServiceMode;
  serviceType: ServiceType;
  status: AppointmentStatus;
  scheduledStart: string;
  zip: string;
  facilityType: string;
  travelMiles?: number;
  actCount?: number;
  afterHours?: boolean;
  travelFeeAccepted?: boolean;
  techFeeRequested?: number;
  blockedReason?: string;
  complianceFlags?: string[];
  reviewSent?: boolean;
}

const appointmentSeeds: DemoSeedInput[] = [
  { id: "apt-001", clientName: "Maya Carter", channel: "private", serviceMode: "in_person", serviceType: "general_notary", status: "completed", scheduledStart: "2026-03-26T10:00:00-04:00", zip: "43215", facilityType: "office", travelMiles: 4, actCount: 2, travelFeeAccepted: true, reviewSent: true },
  { id: "apt-002", clientName: "Calvin Reed", channel: "private", serviceMode: "in_person", serviceType: "power_of_attorney", status: "booked", scheduledStart: "2026-03-26T19:30:00-04:00", zip: "43224", facilityType: "home", travelMiles: 8, actCount: 1, afterHours: true, travelFeeAccepted: true },
  { id: "apt-003", clientName: "Avery Patel", channel: "private", serviceMode: "in_person", serviceType: "hospital_notarization", status: "completed", scheduledStart: "2026-03-27T14:00:00-04:00", zip: "43210", facilityType: "hospital", travelMiles: 6, actCount: 2, travelFeeAccepted: true, complianceFlags: ["capacity_check_documented"] },
  { id: "apt-004", clientName: "Jordan Brooks", channel: "private", serviceMode: "in_person", serviceType: "auto_title", status: "refused", scheduledStart: "2026-03-27T16:30:00-04:00", zip: "43207", facilityType: "title_auto", travelMiles: 12, actCount: 1, travelFeeAccepted: true, blockedReason: "Blank buyer assignment fields on Ohio title.", complianceFlags: ["title_blank_fields"] },
  { id: "apt-005", clientName: "Elena Flores", channel: "private", serviceMode: "in_person", serviceType: "affidavit", status: "completed", scheduledStart: "2026-03-28T09:00:00-04:00", zip: "43220", facilityType: "home", travelMiles: 7, actCount: 1, travelFeeAccepted: true, reviewSent: true },
  { id: "apt-006", clientName: "Noah Kim", channel: "private", serviceMode: "in_person", serviceType: "estate_planning", status: "completed", scheduledStart: "2026-03-28T20:15:00-04:00", zip: "43085", facilityType: "home", travelMiles: 14, actCount: 3, afterHours: true, travelFeeAccepted: true },
  { id: "apt-007", clientName: "Tessa Long", channel: "private", serviceMode: "in_person", serviceType: "copy_certification", status: "refused", scheduledStart: "2026-03-29T11:00:00-04:00", zip: "43201", facilityType: "office", travelMiles: 3, actCount: 1, blockedReason: "Copy certification is blocked in Ohio.", complianceFlags: ["copy_certification_blocked"] },
  { id: "apt-008", clientName: "Easton Gray", channel: "private", serviceMode: "in_person", serviceType: "school_form", status: "completed", scheduledStart: "2026-03-29T13:00:00-04:00", zip: "43235", facilityType: "office", travelMiles: 9, actCount: 1, travelFeeAccepted: true },
  { id: "apt-009", clientName: "Harper Nguyen", channel: "private", serviceMode: "in_person", serviceType: "hospital_notarization", status: "booked", scheduledStart: "2026-03-29T21:00:00-04:00", zip: "43214", facilityType: "hospital", travelMiles: 11, actCount: 2, afterHours: true, travelFeeAccepted: true },
  { id: "apt-010", clientName: "Rory Hayes", channel: "private", serviceMode: "in_person", serviceType: "lease_document", status: "completed", scheduledStart: "2026-03-30T15:00:00-04:00", zip: "43123", facilityType: "home", travelMiles: 17, actCount: 1, travelFeeAccepted: true },
  { id: "apt-011", clientName: "Midtown Realty HR", channel: "employer", serviceMode: "in_person", serviceType: "general_notary", status: "completed", scheduledStart: "2026-03-26T13:00:00-04:00", zip: "43215", facilityType: "employer_internal", actCount: 4, travelMiles: 0, travelFeeAccepted: false },
  { id: "apt-012", clientName: "Riverside Compliance", channel: "employer", serviceMode: "electronic_in_person", serviceType: "affidavit", status: "completed", scheduledStart: "2026-03-27T09:30:00-04:00", zip: "43215", facilityType: "employer_internal", actCount: 2, travelMiles: 0 },
  { id: "apt-013", clientName: "Summit Logistics", channel: "employer", serviceMode: "in_person", serviceType: "general_notary", status: "follow_up_needed", scheduledStart: "2026-03-28T10:30:00-04:00", zip: "43215", facilityType: "employer_internal", actCount: 5, travelMiles: 0, complianceFlags: ["missing_secondary_signer_email"] },
  { id: "apt-014", clientName: "North Bank Ops", channel: "employer", serviceMode: "in_person", serviceType: "power_of_attorney", status: "completed", scheduledStart: "2026-03-28T14:30:00-04:00", zip: "43215", facilityType: "employer_internal", actCount: 1, travelMiles: 0 },
  { id: "apt-015", clientName: "Capital Legal Intake", channel: "employer", serviceMode: "in_person", serviceType: "estate_planning", status: "quoted", scheduledStart: "2026-03-31T11:00:00-04:00", zip: "43215", facilityType: "employer_internal", actCount: 2, travelMiles: 0 },
  { id: "apt-016", clientName: "Brenna Wells", channel: "private", serviceMode: "ron", serviceType: "affidavit", status: "completed", scheduledStart: "2026-03-26T18:00:00-04:00", zip: "online", facilityType: "online", actCount: 1, techFeeRequested: 10, reviewSent: true },
  { id: "apt-017", clientName: "Oscar Diaz", channel: "private", serviceMode: "ron", serviceType: "power_of_attorney", status: "completed", scheduledStart: "2026-03-27T12:00:00-04:00", zip: "online", facilityType: "online", actCount: 2, techFeeRequested: 10 },
  { id: "apt-018", clientName: "Priya Shah", channel: "private", serviceMode: "ron", serviceType: "estate_planning", status: "booked", scheduledStart: "2026-03-27T17:30:00-04:00", zip: "online", facilityType: "online", actCount: 3, techFeeRequested: 10 },
  { id: "apt-019", clientName: "Landon Pierce", channel: "private", serviceMode: "ron", serviceType: "copy_certification", status: "refused", scheduledStart: "2026-03-28T11:30:00-04:00", zip: "online", facilityType: "online", actCount: 1, techFeeRequested: 10, blockedReason: "Copy certification request blocked before RON session launch.", complianceFlags: ["copy_certification_blocked"] },
  { id: "apt-020", clientName: "Mae Thompson", channel: "private", serviceMode: "ron", serviceType: "general_notary", status: "follow_up_needed", scheduledStart: "2026-03-30T08:30:00-04:00", zip: "online", facilityType: "online", actCount: 1, techFeeRequested: 10, complianceFlags: ["recording_storage_missing"] },
  { id: "apt-021", clientName: "Hope Memorial", channel: "private", serviceMode: "in_person", serviceType: "hospital_notarization", status: "completed", scheduledStart: "2026-03-30T12:30:00-04:00", zip: "43213", facilityType: "hospital", travelMiles: 10, actCount: 2, travelFeeAccepted: true },
  { id: "apt-022", clientName: "Marcus Owen", channel: "private", serviceMode: "in_person", serviceType: "auto_title", status: "refused", scheduledStart: "2026-03-30T17:45:00-04:00", zip: "43004", facilityType: "title_auto", travelMiles: 21, actCount: 1, afterHours: true, travelFeeAccepted: true, blockedReason: "Seller section partially blank on title assignment.", complianceFlags: ["title_blank_fields"] },
  { id: "apt-023", clientName: "Selene Ward", channel: "private", serviceMode: "in_person", serviceType: "jail_notarization", status: "lead", scheduledStart: "2026-03-31T18:30:00-04:00", zip: "43223", facilityType: "jail_detention", travelMiles: 13, actCount: 1, afterHours: true, travelFeeAccepted: true, complianceFlags: ["facility_clearance_required"] },
  { id: "apt-024", clientName: "Brighton Title", channel: "private", serviceMode: "in_person", serviceType: "loan_signing", status: "quoted", scheduledStart: "2026-03-31T15:30:00-04:00", zip: "43017", facilityType: "real_estate", travelMiles: 18, actCount: 6, travelFeeAccepted: true },
  { id: "apt-025", clientName: "Delia Ross", channel: "private", serviceMode: "in_person", serviceType: "general_notary", status: "no_show", scheduledStart: "2026-03-31T09:00:00-04:00", zip: "43110", facilityType: "home", travelMiles: 16, actCount: 1, travelFeeAccepted: true, complianceFlags: ["no_show_policy_review"] },
];

export const mockAppointments: DemoAppointment[] = appointmentSeeds.map((seed) => {
  const quote =
    seed.blockedReason
      ? { total: 0 }
      : createOhioQuote({
          actType: seed.serviceType,
          actCount: seed.actCount ?? 1,
          isRON: seed.serviceMode === "ron",
          ronAuthorized: seed.serviceMode === "ron",
          travelMiles: seed.serviceMode === "ron" ? 0 : seed.travelMiles ?? 0,
          travelFeeAccepted: seed.travelFeeAccepted,
          isAfterHours: seed.afterHours,
          specialLocationType: mapFacilityToSpecialLocation(seed.facilityType),
          techFeeRequested: seed.techFeeRequested ?? 0,
        });

  return {
    id: seed.id,
    clientName: seed.clientName,
    channel: seed.channel,
    serviceMode: seed.serviceMode,
    serviceType: seed.serviceType,
    status: seed.status,
    scheduledStart: seed.scheduledStart,
    zip: seed.zip,
    facilityType: seed.facilityType,
    travelMiles: seed.travelMiles ?? 0,
    actCount: seed.actCount ?? 1,
    total: quote.total,
    afterHours: Boolean(seed.afterHours),
    blocked: Boolean(seed.blockedReason),
    blockedReason: seed.blockedReason,
    complianceFlags: seed.complianceFlags ?? [],
    reviewSent: Boolean(seed.reviewSent),
  };
});

export interface PublicLead {
  id: string;
  source: string;
  landingPage: string;
  serviceModeRequested: "in_person" | "ron" | "not_sure";
  documentType: string;
  urgencyLevel: "standard" | "same_day" | "rush" | "after_hours";
  locationType: string;
  zip: string;
  quoted: boolean;
  booked: boolean;
  createdAt: string;
}

export interface PortalAppointmentSummary {
  id: string;
  clientName: string;
  serviceLabel: string;
  portalStatus: ClientPortalStatus;
  scheduledStart: string;
  quoteTotal: number;
  paymentDue: number;
  missingItems: string[];
  uploadCount: number;
  locationLabel: string;
  modeLabel: string;
}

export interface PortalMessage {
  id: string;
  appointmentId: string;
  senderType: "notary" | "client" | "system";
  messageType:
    | "booking_confirmation"
    | "reminder"
    | "missing_info_request"
    | "upload_request"
    | "quote_accepted"
    | "invoice_sent"
    | "appointment_follow_up"
    | "review_request"
    | "repeat_client_outreach";
  body: string;
  readAt?: string;
  createdAt: string;
}

export interface PortalChecklistItem {
  id: string;
  appointmentId: string;
  type: "id" | "document" | "witness" | "disclosure" | "ron" | "payment";
  label: string;
  completed: boolean;
  completedAt?: string;
}

export interface DocumentUpload {
  id: string;
  appointmentId: string;
  uploadedByPortalUserId: string;
  fileName: string;
  storagePath: string;
  mimeType: string;
  reviewed: boolean;
  flagged: boolean;
  createdAt: string;
}

export interface PortalInvoice {
  id: string;
  appointmentId: string;
  invoiceNumber: string;
  total: number;
  status: "draft" | "due" | "paid";
  dueAt: string;
  paymentReceiptUrl?: string;
}

export interface LandingPageStat {
  slug: string;
  title: string;
  visits: number;
  conversions: number;
}

export const publicLeads: PublicLead[] = [
  { id: "lead-001", source: "organic", landingPage: "columbus-mobile-notary", serviceModeRequested: "in_person", documentType: "power_of_attorney", urgencyLevel: "same_day", locationType: "home", zip: "43215", quoted: true, booked: true, createdAt: "2026-03-25T08:10:00-04:00" },
  { id: "lead-002", source: "google_business_profile", landingPage: "hospital-notary-columbus", serviceModeRequested: "in_person", documentType: "hospital consent packet", urgencyLevel: "after_hours", locationType: "hospital", zip: "43210", quoted: true, booked: false, createdAt: "2026-03-25T10:22:00-04:00" },
  { id: "lead-003", source: "organic", landingPage: "remote-online-notary-ohio", serviceModeRequested: "ron", documentType: "affidavit", urgencyLevel: "standard", locationType: "online", zip: "online", quoted: true, booked: true, createdAt: "2026-03-25T11:45:00-04:00" },
  { id: "lead-004", source: "referral", landingPage: "vehicle-title-notary-columbus", serviceModeRequested: "in_person", documentType: "vehicle title", urgencyLevel: "rush", locationType: "title_auto", zip: "43004", quoted: false, booked: false, createdAt: "2026-03-25T13:00:00-04:00" },
  { id: "lead-005", source: "organic", landingPage: "power-of-attorney-notary-columbus", serviceModeRequested: "not_sure", documentType: "power of attorney", urgencyLevel: "standard", locationType: "home", zip: "43220", quoted: true, booked: false, createdAt: "2026-03-25T16:25:00-04:00" },
];

export const landingPageStats: LandingPageStat[] = [
  { slug: "columbus-mobile-notary", title: "Columbus Mobile Notary", visits: 420, conversions: 41 },
  { slug: "franklin-county-notary", title: "Franklin County Mobile Notary", visits: 260, conversions: 22 },
  { slug: "same-day-notary-columbus", title: "Same-Day Notary Columbus", visits: 318, conversions: 36 },
  { slug: "hospital-notary-columbus", title: "Hospital Notary Columbus", visits: 145, conversions: 19 },
  { slug: "nursing-home-notary-columbus", title: "Nursing Home Notary Columbus", visits: 131, conversions: 13 },
  { slug: "remote-online-notary-ohio", title: "Remote Online Notary Ohio", visits: 385, conversions: 33 },
  { slug: "vehicle-title-notary-columbus", title: "Vehicle Title Notary Columbus", visits: 170, conversions: 11 },
  { slug: "power-of-attorney-notary-columbus", title: "Power of Attorney Notary Columbus", visits: 222, conversions: 24 },
];

export const portalAppointments: PortalAppointmentSummary[] = [
  {
    id: "portal-001",
    clientName: "Maya Carter",
    serviceLabel: "Mobile general notary",
    portalStatus: "closed",
    scheduledStart: "2026-03-26T10:00:00-04:00",
    quoteTotal: 40,
    paymentDue: 0,
    missingItems: [],
    uploadCount: 2,
    locationLabel: "Downtown Columbus",
    modeLabel: "In person",
  },
  {
    id: "portal-002",
    clientName: "Calvin Reed",
    serviceLabel: "Power of attorney",
    portalStatus: "awaiting_documents",
    scheduledStart: "2026-03-26T19:30:00-04:00",
    quoteTotal: 60,
    paymentDue: 60,
    missingItems: ["Upload full document packet", "Accept travel fee disclosure"],
    uploadCount: 0,
    locationLabel: "North Linden",
    modeLabel: "Mobile",
  },
  {
    id: "portal-003",
    clientName: "Brenna Wells",
    serviceLabel: "RON affidavit",
    portalStatus: "completed",
    scheduledStart: "2026-03-26T18:00:00-04:00",
    quoteTotal: 40,
    paymentDue: 0,
    missingItems: [],
    uploadCount: 1,
    locationLabel: "Online",
    modeLabel: "RON",
  },
  {
    id: "portal-004",
    clientName: "Priya Shah",
    serviceLabel: "RON estate planning",
    portalStatus: "ready_for_appointment",
    scheduledStart: "2026-03-27T17:30:00-04:00",
    quoteTotal: 100,
    paymentDue: 100,
    missingItems: ["Complete RON tech check"],
    uploadCount: 3,
    locationLabel: "Online",
    modeLabel: "RON",
  },
];

export const portalChecklistItems: PortalChecklistItem[] = [
  { id: "check-001", appointmentId: "portal-002", type: "document", label: "Upload complete document packet", completed: false },
  { id: "check-002", appointmentId: "portal-002", type: "disclosure", label: "Accept travel fee disclosure", completed: false },
  { id: "check-003", appointmentId: "portal-002", type: "id", label: "Confirm signer ID readiness", completed: true, completedAt: "2026-03-25T17:00:00-04:00" },
  { id: "check-004", appointmentId: "portal-004", type: "ron", label: "Confirm camera, microphone, and stable internet", completed: false },
  { id: "check-005", appointmentId: "portal-004", type: "document", label: "Upload final estate-planning packet", completed: true, completedAt: "2026-03-25T14:10:00-04:00" },
];

export const portalMessages: PortalMessage[] = [
  { id: "msg-001", appointmentId: "portal-002", senderType: "system", messageType: "booking_confirmation", body: "Your booking request is in review. Upload your document packet to speed up approval.", createdAt: "2026-03-25T17:05:00-04:00" },
  { id: "msg-002", appointmentId: "portal-002", senderType: "notary", messageType: "missing_info_request", body: "Please confirm whether any witnesses are needed for this POA signing.", createdAt: "2026-03-25T17:12:00-04:00" },
  { id: "msg-003", appointmentId: "portal-004", senderType: "system", messageType: "reminder", body: "Complete your RON tech check before tomorrow's session.", createdAt: "2026-03-25T18:00:00-04:00" },
];

export const documentUploads: DocumentUpload[] = [
  { id: "upload-001", appointmentId: "portal-001", uploadedByPortalUserId: "pu-001", fileName: "poa-draft.pdf", storagePath: "mock/uploads/poa-draft.pdf", mimeType: "application/pdf", reviewed: true, flagged: false, createdAt: "2026-03-25T09:05:00-04:00" },
  { id: "upload-002", appointmentId: "portal-004", uploadedByPortalUserId: "pu-004", fileName: "estate-package.pdf", storagePath: "mock/uploads/estate-package.pdf", mimeType: "application/pdf", reviewed: false, flagged: false, createdAt: "2026-03-25T13:48:00-04:00" },
];

export const portalInvoices: PortalInvoice[] = [
  { id: "pinv-001", appointmentId: "portal-002", invoiceNumber: "INV-PORTAL-002", total: 60, status: "due", dueAt: "2026-03-26T18:30:00-04:00" },
  { id: "pinv-002", appointmentId: "portal-003", invoiceNumber: "INV-PORTAL-003", total: 40, status: "paid", dueAt: "2026-03-26T18:00:00-04:00", paymentReceiptUrl: "/receipts/portal-003" },
  { id: "pinv-003", appointmentId: "portal-004", invoiceNumber: "INV-PORTAL-004", total: 100, status: "due", dueAt: "2026-03-27T16:30:00-04:00" },
];

export const portalDisclosures = [
  {
    appointmentId: "portal-002",
    travelFeeAccepted: false,
    cancellationPolicyAccepted: false,
    privacyPolicyAccepted: true,
    portalTermsAccepted: true,
    acceptedAt: undefined,
    acceptedIp: undefined,
  },
  {
    appointmentId: "portal-004",
    travelFeeAccepted: true,
    cancellationPolicyAccepted: true,
    privacyPolicyAccepted: true,
    portalTermsAccepted: true,
    acceptedAt: "2026-03-25T15:10:00-04:00",
    acceptedIp: "127.0.0.1",
  },
];

export const dashboardMetrics = {
  leads: mockAppointments.length,
  booked: mockAppointments.filter((appointment) => appointment.status === "booked").length,
  completed: mockAppointments.filter((appointment) => appointment.status === "completed").length,
  refused: mockAppointments.filter((appointment) => appointment.status === "refused").length,
  ronCount: mockAppointments.filter((appointment) => appointment.serviceMode === "ron").length,
  employerCount: mockAppointments.filter((appointment) => appointment.channel === "employer").length,
  revenue: mockAppointments.reduce((total, appointment) => total + appointment.total, 0),
  mileage: mockAppointments.reduce((total, appointment) => total + appointment.travelMiles, 0),
};

export const serviceCards = [
  {
    slug: "mobile-notary",
    title: "Mobile Notary",
    summary: "Travel-based in-person notarization across Columbus and nearby Franklin County areas.",
    details: "Ideal for homes, offices, hospitals, and same-day convenience requests.",
  },
  {
    slug: "remote-online-notary",
    title: "Remote Online Notary",
    summary: "Ohio RON sessions for signers who are ready for identity proofing and live audio-video.",
    details: "Best for fast-turn documents without drive time when the notary is RON-authorized.",
  },
  {
    slug: "vehicle-title-auto-docs",
    title: "Vehicle Title / Auto Docs",
    summary: "High-attention workflow for Ohio title transfers and title-related affidavits.",
    details: "Blank title sections trigger a block and manual review before booking.",
  },
  {
    slug: "estate-planning-poa-affidavits",
    title: "Estate Planning / POA / Affidavits",
    summary: "Support for acknowledgments, jurats, powers of attorney, and estate documents.",
    details: "Preparation guidance helps reduce appointment-day delays.",
  },
];

export const seoLandingPages = [
  {
    slug: "columbus-mobile-notary",
    title: "Columbus Mobile Notary",
    intro: "On-site notarization for homes, offices, hospitals, and after-hours requests across Columbus.",
    checklist: ["Have acceptable ID ready", "Complete blank fields before the visit", "Do not sign until instructed"],
  },
  {
    slug: "franklin-county-notary",
    title: "Franklin County Mobile Notary",
    intro: "Mobile notary availability throughout Franklin County with travel disclosed separately in advance.",
    checklist: ["Confirm address and access details", "Prepare all signers", "Upload documents if you want a pre-check"],
  },
  {
    slug: "same-day-notary-columbus",
    title: "Same-Day Notary Columbus",
    intro: "Fast-turn appointments for urgent affidavits, POAs, employer matters, and convenience requests.",
    checklist: ["Choose your preferred window", "Confirm document readiness", "Expect after-hours or rush fees to be itemized"],
  },
  {
    slug: "hospital-notary-columbus",
    title: "Hospital Notary Columbus",
    intro: "Hospital and bedside notarization support with extra capacity and readiness checks.",
    checklist: ["Confirm signer awareness", "Coordinate visitor access", "Have nurse/family contact ready if needed"],
  },
  {
    slug: "nursing-home-notary-columbus",
    title: "Nursing Home Notary Columbus",
    intro: "Mobile notarization for assisted living, nursing home, and long-term care settings.",
    checklist: ["Confirm room/access instructions", "Prepare signer ID", "Check whether witnesses are needed"],
  },
  {
    slug: "remote-online-notary-ohio",
    title: "Remote Online Notary Ohio",
    intro: "Ohio-based RON sessions with identity proofing, credential analysis, and live audio-video.",
    checklist: ["Use a stable device", "Complete tech readiness", "Upload your document before session start"],
  },
  {
    slug: "vehicle-title-notary-columbus",
    title: "Vehicle Title Notary Columbus",
    intro: "Ohio title-transfer support with strict blank-field screening before any appointment is approved.",
    checklist: ["Review all title fields", "Bring matching ID", "Do not leave buyer/seller sections incomplete"],
  },
  {
    slug: "power-of-attorney-notary-columbus",
    title: "Power of Attorney Notary Columbus",
    intro: "POA acknowledgments and related estate-planning support for home, office, or RON-friendly workflows.",
    checklist: ["Confirm the signer can appear", "Have the full document ready", "Know whether witnesses are needed"],
  },
];

function mapFacilityToSpecialLocation(
  facilityType: string,
): SpecialLocationType {
  if (facilityType === "hospital") {
    return "hospital";
  }

  if (facilityType === "nursing_home") {
    return "nursing_home";
  }

  if (facilityType === "hospice") {
    return "hospice";
  }

  if (facilityType === "jail_detention") {
    return "jail";
  }

  return "standard";
}
