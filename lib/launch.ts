import { getAnalyticsSummary } from "./analytics";
import { formatLabel } from "./formatters";
import { mockAppointments, portalInvoices, publicLeads } from "./mockData";
import { prisma } from "./prisma";

export type LaunchPhase =
  | "COMMISSION"
  | "OPERATIONS"
  | "RON"
  | "BUSINESS"
  | "REVENUE_SCALE";

export type LaunchMilestoneStatus =
  | "LOCKED"
  | "AVAILABLE"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "BLOCKED";

export type LaunchMilestoneSourceType = "MANUAL" | "DERIVED";
export type LaunchTaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
export type GoalPeriodType = "MONTH" | "QUARTER";
export type AllowedServiceMode = "NONE" | "IN_PERSON_ONLY" | "IN_PERSON_AND_RON";
export type LaunchAlertSeverity = "info" | "warning" | "block";
export type LaunchTaskEvidenceType = "DATE" | "BOOLEAN" | "FILE_REF" | "NOTE";

export interface CommandCenterNotaryProfile {
  legalName: string;
  commissionNumber: string;
  commissionIssueDate: string;
  commissionExpirationDate: string;
  commissionApprovedDate?: string;
  ronAuthorized: boolean;
  ronIssueDate?: string;
  ronExpirationDate?: string;
  oathCompleted: boolean;
  bciDate?: string;
  sealOrdered: boolean;
  sealReceivedDate?: string;
  journalTypeConfigured?: string;
  eSignatureConfigured: boolean;
  eSealConfigured: boolean;
  ronPlatformConfigured: boolean;
  initialEducationCompleted: boolean;
  ronEducationCompleted: boolean;
  initialApplicationFiled: boolean;
  ronApplicationFiled: boolean;
  llcFormed: boolean;
  llcFormedDate?: string;
  einObtainedDate?: string;
  businessBankingReady: boolean;
  eoInsuranceActive: boolean;
  eoInsuranceRenewalDate?: string;
  googleBusinessProfileLive: boolean;
  websiteLive: boolean;
  employerPrivateSeparationConfirmed: boolean;
  intakeWorkflowReady: boolean;
  pricingPolicyReady: boolean;
  travelZonePolicyReady: boolean;
  recordingStorageConfigured: boolean;
}

export interface LaunchTask {
  id: string;
  milestoneCode: string;
  title: string;
  status: LaunchTaskStatus;
  completedAt?: string;
  requiresManualConfirmation: boolean;
  evidenceType: LaunchTaskEvidenceType;
  evidenceValue?: string;
}

export interface LaunchMilestone {
  id: string;
  phase: LaunchPhase;
  code: string;
  title: string;
  description: string;
  status: LaunchMilestoneStatus;
  dueDate?: string;
  completedAt?: string;
  sortOrder: number;
  dependencyCodes: string[];
  blockerReason?: string;
  ownerNotes?: string;
  sourceType: LaunchMilestoneSourceType;
  dependenciesMet: boolean;
  tasks: LaunchTask[];
}

export interface LaunchAlert {
  id: string;
  code: string;
  severity: LaunchAlertSeverity;
  title: string;
  body: string;
  relatedMilestoneCode?: string;
  dueDate?: string;
  resolvedAt?: string;
}

export interface Goal {
  id: string;
  periodType: GoalPeriodType;
  startDate: string;
  endDate: string;
  revenueTarget: number;
  appointmentTarget: number;
  ronTarget: number;
  mobileTarget: number;
  reviewTarget: number;
  b2bOutreachTarget: number;
}

export interface GoalSnapshot {
  goalId: string;
  actualRevenue: number;
  actualAppointments: number;
  actualRON: number;
  actualMobile: number;
  actualReviews: number;
  actualB2BOutreach: number;
  updatedAt: string;
}

export interface ReadinessSummary {
  commissionReadiness: number;
  commissionActive: boolean;
  ronReadiness: number;
  ronActive: boolean;
  businessSetupReadiness: number;
  revenueReadiness: number;
  currentAllowedServiceModes: AllowedServiceMode;
  nextCriticalAction: {
    milestoneCode: string;
    title: string;
    description: string;
    href: string;
  } | null;
  blockingIssues: string[];
  expiringDeadlines: LaunchAlert[];
  permissionMatrix: {
    canBookInPerson: boolean;
    canCompleteInPerson: boolean;
    canBookRON: boolean;
    canCompleteRON: boolean;
  };
}

export interface CommandCenterData {
  profile: CommandCenterNotaryProfile;
  readiness: ReadinessSummary;
  milestones: LaunchMilestone[];
  alerts: LaunchAlert[];
  goals: Array<Goal & { snapshot: GoalSnapshot; completionRate: number }>;
  progressByPhase: Array<{
    phase: LaunchPhase;
    label: string;
    completed: number;
    total: number;
    progressPercent: number;
  }>;
  startHere: {
    nextAction: ReadinessSummary["nextCriticalAction"];
    blockers: string[];
    dueSoon: LaunchAlert[];
  };
  revenue: {
    thisMonth: number;
    pipelineCounts: Record<string, number>;
    revenueByLane: Array<{ label: string; value: number }>;
    firstsAchieved: LaunchMilestone[];
    travelEfficiency: {
      revenuePerMile: number;
      travelRevenue: number;
      totalMiles: number;
    };
    reviewStats: {
      sent: number;
      completed: number;
      pending: number;
      conversionRate: number;
    };
    serviceMix: Array<{ label: string; count: number }>;
  };
}

interface MilestoneBlueprint {
  phase: LaunchPhase;
  code: string;
  title: string;
  description: string;
  sourceType: LaunchMilestoneSourceType;
  sortOrder: number;
  dependencyCodes: string[];
  dueDate?: string;
  href: string;
  manualDefaultStatus?: Exclude<LaunchMilestoneStatus, "LOCKED" | "COMPLETED">;
  manualNotes?: string;
  tasks: Array<{
    title: string;
    requiresManualConfirmation: boolean;
    evidenceType: LaunchTaskEvidenceType;
  }>;
}

interface ManualMilestoneState {
  status?: Exclude<LaunchMilestoneStatus, "LOCKED" | "COMPLETED">;
  completedAt?: string;
  ownerNotes?: string;
}

const DEMO_NOW = new Date("2026-03-27T09:00:00-04:00");

const defaultCommandCenterProfile: CommandCenterNotaryProfile = {
  legalName: "Kerri Ann Lark",
  commissionNumber: "OH-2026-0001",
  commissionIssueDate: "2026-02-10",
  commissionExpirationDate: "2031-02-10",
  commissionApprovedDate: "2026-02-08",
  ronAuthorized: true,
  ronIssueDate: "2026-03-05",
  ronExpirationDate: "2031-02-10",
  oathCompleted: true,
  bciDate: "2025-12-18",
  sealOrdered: true,
  sealReceivedDate: "2026-02-12",
  journalTypeConfigured: "hybrid",
  eSignatureConfigured: true,
  eSealConfigured: true,
  ronPlatformConfigured: true,
  initialEducationCompleted: true,
  ronEducationCompleted: true,
  initialApplicationFiled: true,
  ronApplicationFiled: true,
  llcFormed: false,
  businessBankingReady: false,
  eoInsuranceActive: false,
  googleBusinessProfileLive: true,
  websiteLive: true,
  employerPrivateSeparationConfirmed: true,
  intakeWorkflowReady: true,
  pricingPolicyReady: true,
  travelZonePolicyReady: false,
  recordingStorageConfigured: false,
};

const defaultManualMilestoneState: Record<string, ManualMilestoneState> = {
  course_enrolled: { completedAt: "2025-12-20" },
  exam_passed: { completedAt: "2026-01-04" },
  intake_workflow_ready: { completedAt: "2026-02-14" },
  pricing_policy_ready: { completedAt: "2026-02-16" },
  travel_zone_policy_ready: {
    status: "IN_PROGRESS",
    ownerNotes: "Finish outer-ring pricing and no-show disclosure language.",
  },
  recording_storage_configured: {
    status: "IN_PROGRESS",
    ownerNotes: "Pick the long-term storage/repository workflow before scale.",
  },
  business_banking_setup: {
    status: "AVAILABLE",
    ownerNotes: "Choose bank and separate private/business cash flow before more volume.",
  },
  first_b2b_account: {
    status: "IN_PROGRESS",
    ownerNotes: "Employer/internal work exists, but direct external account outreach is still open.",
  },
};

const defaultGoalStore: Goal[] = [
  {
    id: "goal-mar-2026",
    periodType: "MONTH",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    revenueTarget: 2500,
    appointmentTarget: 24,
    ronTarget: 6,
    mobileTarget: 14,
    reviewTarget: 8,
    b2bOutreachTarget: 12,
  },
  {
    id: "goal-q2-2026",
    periodType: "QUARTER",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    revenueTarget: 9000,
    appointmentTarget: 75,
    ronTarget: 20,
    mobileTarget: 42,
    reviewTarget: 24,
    b2bOutreachTarget: 36,
  },
];

let commandCenterProfile: CommandCenterNotaryProfile = {
  ...defaultCommandCenterProfile,
};

let manualMilestoneState: Record<string, ManualMilestoneState> = {
  ...defaultManualMilestoneState,
};

let goalStore: Goal[] = defaultGoalStore.map((goal) => ({ ...goal }));

const milestoneBlueprints: MilestoneBlueprint[] = [
  {
    phase: "COMMISSION",
    code: "course_enrolled",
    title: "Course enrolled",
    description: "Enroll in the approved Ohio education provider flow.",
    sourceType: "MANUAL",
    sortOrder: 10,
    dependencyCodes: [],
    href: "/dashboard/launch",
    tasks: [{ title: "Confirm provider and purchase course", requiresManualConfirmation: true, evidenceType: "NOTE" }],
  },
  {
    phase: "COMMISSION",
    code: "course_completed",
    title: "Course completed",
    description: "Complete Ohio non-attorney education and testing.",
    sourceType: "DERIVED",
    sortOrder: 20,
    dependencyCodes: ["course_enrolled"],
    href: "/dashboard/launch",
    tasks: [{ title: "Course and exam marked complete", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "COMMISSION",
    code: "exam_passed",
    title: "Exam passed",
    description: "Record final exam completion before filing.",
    sourceType: "MANUAL",
    sortOrder: 30,
    dependencyCodes: ["course_completed"],
    href: "/dashboard/launch",
    tasks: [{ title: "Upload or note proof of passing", requiresManualConfirmation: true, evidenceType: "FILE_REF" }],
  },
  {
    phase: "COMMISSION",
    code: "commission_application_filed",
    title: "Commission application filed",
    description: "File the Ohio commission application with signature, BCI, and proof of completion.",
    sourceType: "DERIVED",
    sortOrder: 40,
    dependencyCodes: ["exam_passed"],
    href: "/dashboard/launch",
    tasks: [{ title: "State filing submitted", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "COMMISSION",
    code: "commission_approved",
    title: "Commission approved",
    description: "Track state approval before the oath and seal steps.",
    sourceType: "DERIVED",
    sortOrder: 50,
    dependencyCodes: ["commission_application_filed"],
    href: "/dashboard/launch",
    tasks: [{ title: "Approval date recorded", requiresManualConfirmation: false, evidenceType: "DATE" }],
  },
  {
    phase: "COMMISSION",
    code: "oath_completed_in_person",
    title: "Oath completed in person",
    description: "Required before any Ohio notarial acts are performed.",
    sourceType: "DERIVED",
    sortOrder: 60,
    dependencyCodes: ["commission_approved"],
    href: "/dashboard/compliance",
    tasks: [{ title: "Oath completion confirmed", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "COMMISSION",
    code: "seal_ordered",
    title: "Seal ordered",
    description: "Seal must be ready before performing acts.",
    sourceType: "DERIVED",
    sortOrder: 70,
    dependencyCodes: ["commission_approved"],
    href: "/dashboard/compliance",
    tasks: [{ title: "Seal order or receipt confirmed", requiresManualConfirmation: false, evidenceType: "DATE" }],
  },
  {
    phase: "COMMISSION",
    code: "commission_active",
    title: "Commission active",
    description: "In-person service becomes legally available once commission requirements are fully satisfied.",
    sourceType: "DERIVED",
    sortOrder: 80,
    dependencyCodes: ["oath_completed_in_person", "seal_ordered"],
    href: "/dashboard/readiness",
    tasks: [{ title: "Commission readiness gates all pass", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "OPERATIONS",
    code: "intake_workflow_ready",
    title: "Intake workflow ready",
    description: "Booking, quote, and readiness workflow configured.",
    sourceType: "MANUAL",
    sortOrder: 110,
    dependencyCodes: ["commission_active"],
    href: "/dashboard/tasks",
    tasks: [{ title: "Booking and quote workflow reviewed", requiresManualConfirmation: true, evidenceType: "NOTE" }],
  },
  {
    phase: "OPERATIONS",
    code: "pricing_policy_ready",
    title: "Pricing policy ready",
    description: "Travel, urgency, specialty, and disclosure rules documented.",
    sourceType: "MANUAL",
    sortOrder: 120,
    dependencyCodes: ["intake_workflow_ready"],
    href: "/dashboard/tasks",
    tasks: [{ title: "Pricing disclosure policy confirmed", requiresManualConfirmation: true, evidenceType: "NOTE" }],
  },
  {
    phase: "OPERATIONS",
    code: "travel_zone_policy_ready",
    title: "Travel zone policy ready",
    description: "Travel zones and no-show boundaries finalized.",
    sourceType: "MANUAL",
    sortOrder: 130,
    dependencyCodes: ["pricing_policy_ready"],
    dueDate: "2026-04-02",
    href: "/dashboard/tasks",
    tasks: [{ title: "Finalize travel zones and after-hours rules", requiresManualConfirmation: true, evidenceType: "NOTE" }],
  },
  {
    phase: "OPERATIONS",
    code: "journal_habit_configured",
    title: "Journal habit configured",
    description: "Traditional and RON journaling workflows are set up.",
    sourceType: "DERIVED",
    sortOrder: 140,
    dependencyCodes: ["commission_active"],
    href: "/dashboard/compliance",
    tasks: [{ title: "Journal configuration present", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "OPERATIONS",
    code: "first_in_person_appointment_completed",
    title: "First in-person appointment completed",
    description: "First in-person revenue milestone reached.",
    sourceType: "DERIVED",
    sortOrder: 150,
    dependencyCodes: ["commission_active"],
    href: "/dashboard/revenue",
    tasks: [{ title: "At least one completed in-person appointment exists", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "OPERATIONS",
    code: "first_invoice_paid",
    title: "First invoice paid",
    description: "First payment milestone reached.",
    sourceType: "DERIVED",
    sortOrder: 160,
    dependencyCodes: ["first_in_person_appointment_completed"],
    href: "/dashboard/revenue",
    tasks: [{ title: "At least one paid invoice recorded", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "RON",
    code: "ron_course_completed",
    title: "RON course completed",
    description: "Finish the separate Ohio RON training path.",
    sourceType: "DERIVED",
    sortOrder: 210,
    dependencyCodes: ["commission_active"],
    href: "/dashboard/launch",
    tasks: [{ title: "RON education marked complete", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "RON",
    code: "ron_application_filed",
    title: "RON application filed",
    description: "Track the separate RON filing before online acts are offered.",
    sourceType: "DERIVED",
    sortOrder: 220,
    dependencyCodes: ["ron_course_completed"],
    href: "/dashboard/launch",
    tasks: [{ title: "RON application marked filed", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "RON",
    code: "ron_authorized",
    title: "RON authorized",
    description: "Ohio online authorization is active.",
    sourceType: "DERIVED",
    sortOrder: 230,
    dependencyCodes: ["ron_application_filed"],
    href: "/dashboard/readiness",
    tasks: [{ title: "RON authorization date present", requiresManualConfirmation: false, evidenceType: "DATE" }],
  },
  {
    phase: "RON",
    code: "e_signature_configured",
    title: "E-signature configured",
    description: "Electronic signature is ready and under exclusive control.",
    sourceType: "DERIVED",
    sortOrder: 240,
    dependencyCodes: ["ron_authorized"],
    href: "/dashboard/readiness",
    tasks: [{ title: "E-signature status true", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "RON",
    code: "e_seal_configured",
    title: "E-seal configured",
    description: "Electronic seal is configured and secured.",
    sourceType: "DERIVED",
    sortOrder: 250,
    dependencyCodes: ["ron_authorized"],
    href: "/dashboard/readiness",
    tasks: [{ title: "E-seal status true", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "RON",
    code: "ron_platform_configured",
    title: "RON platform configured",
    description: "Online platform is selected and configured.",
    sourceType: "DERIVED",
    sortOrder: 260,
    dependencyCodes: ["ron_authorized"],
    href: "/dashboard/readiness",
    tasks: [{ title: "RON platform status true", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "RON",
    code: "recording_storage_configured",
    title: "Recording storage configured",
    description: "Recording retention and repository workflow is documented.",
    sourceType: "MANUAL",
    sortOrder: 270,
    dependencyCodes: ["ron_platform_configured"],
    dueDate: "2026-04-04",
    href: "/dashboard/tasks",
    tasks: [{ title: "Storage and export process documented", requiresManualConfirmation: true, evidenceType: "NOTE" }],
  },
  {
    phase: "RON",
    code: "first_ron_session_completed",
    title: "First RON session completed",
    description: "First completed RON appointment milestone reached.",
    sourceType: "DERIVED",
    sortOrder: 280,
    dependencyCodes: ["ron_authorized", "recording_storage_configured"],
    href: "/dashboard/revenue",
    tasks: [{ title: "At least one completed RON session exists", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "BUSINESS",
    code: "llc_formed",
    title: "LLC formed",
    description: "Entity setup completed.",
    sourceType: "DERIVED",
    sortOrder: 310,
    dependencyCodes: ["commission_active"],
    dueDate: "2026-04-01",
    href: "/dashboard/tasks",
    tasks: [{ title: "LLC filing date recorded", requiresManualConfirmation: false, evidenceType: "DATE" }],
  },
  {
    phase: "BUSINESS",
    code: "ein_obtained",
    title: "EIN obtained",
    description: "EIN recorded for business separation.",
    sourceType: "DERIVED",
    sortOrder: 320,
    dependencyCodes: ["llc_formed"],
    dueDate: "2026-04-03",
    href: "/dashboard/tasks",
    tasks: [{ title: "EIN date recorded", requiresManualConfirmation: false, evidenceType: "DATE" }],
  },
  {
    phase: "BUSINESS",
    code: "business_banking_setup",
    title: "Business banking set up",
    description: "Dedicated banking and bookkeeping separation complete.",
    sourceType: "MANUAL",
    sortOrder: 330,
    dependencyCodes: ["ein_obtained"],
    dueDate: "2026-04-06",
    href: "/dashboard/tasks",
    tasks: [{ title: "Business bank account opened", requiresManualConfirmation: true, evidenceType: "NOTE" }],
  },
  {
    phase: "BUSINESS",
    code: "eo_obtained",
    title: "E&O obtained",
    description: "Errors and omissions coverage active.",
    sourceType: "DERIVED",
    sortOrder: 340,
    dependencyCodes: ["commission_active"],
    dueDate: "2026-04-08",
    href: "/dashboard/tasks",
    tasks: [{ title: "E&O status active", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "BUSINESS",
    code: "employer_private_separation_confirmed",
    title: "Employer/private workflow separation confirmed",
    description: "Employer and private business lanes are separated in practice.",
    sourceType: "DERIVED",
    sortOrder: 350,
    dependencyCodes: ["commission_active"],
    href: "/dashboard/readiness",
    tasks: [{ title: "Separation setting enabled", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "BUSINESS",
    code: "google_business_profile_live",
    title: "Google Business Profile live",
    description: "GBP is active for local lead capture.",
    sourceType: "DERIVED",
    sortOrder: 360,
    dependencyCodes: ["commission_active"],
    href: "/dashboard/revenue",
    tasks: [{ title: "GBP live status true", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "BUSINESS",
    code: "website_live",
    title: "Website live",
    description: "Public website is available for booking and education.",
    sourceType: "DERIVED",
    sortOrder: 370,
    dependencyCodes: ["commission_active"],
    href: "/dashboard/revenue",
    tasks: [{ title: "Website live status true", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "REVENUE_SCALE",
    code: "first_repeat_client",
    title: "First repeat client",
    description: "A client has booked more than once.",
    sourceType: "DERIVED",
    sortOrder: 410,
    dependencyCodes: ["first_invoice_paid"],
    href: "/dashboard/revenue",
    tasks: [{ title: "Repeat client event recorded", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
  {
    phase: "REVENUE_SCALE",
    code: "first_b2b_account",
    title: "First B2B account",
    description: "First direct external business account established.",
    sourceType: "MANUAL",
    sortOrder: 420,
    dependencyCodes: ["first_invoice_paid"],
    href: "/dashboard/tasks",
    tasks: [{ title: "Record first external law/title/facility account", requiresManualConfirmation: true, evidenceType: "NOTE" }],
  },
  {
    phase: "REVENUE_SCALE",
    code: "first_signing_agent_title_package",
    title: "First signing-agent/title package",
    description: "First completed higher-ticket title/signing package.",
    sourceType: "DERIVED",
    sortOrder: 430,
    dependencyCodes: ["first_b2b_account"],
    href: "/dashboard/revenue",
    tasks: [{ title: "Completed loan signing or title package exists", requiresManualConfirmation: false, evidenceType: "BOOLEAN" }],
  },
];

const phaseLabels: Record<LaunchPhase, string> = {
  COMMISSION: "Commission",
  OPERATIONS: "Operations",
  RON: "RON",
  BUSINESS: "Business",
  REVENUE_SCALE: "Revenue Scale",
};

function cloneDefaultProfile() {
  return { ...defaultCommandCenterProfile };
}

function cloneDefaultManualState() {
  return { ...defaultManualMilestoneState };
}

function cloneDefaultGoals() {
  return defaultGoalStore.map((goal) => ({ ...goal }));
}

function toIsoDate(value?: Date | string | null) {
  if (!value) {
    return undefined;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10);
}

function parseStoredDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function getPrismaClient() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  return prisma as any;
}

async function hydratePersistedState() {
  const prismaClient = getPrismaClient();
  commandCenterProfile = cloneDefaultProfile();
  manualMilestoneState = cloneDefaultManualState();
  goalStore = cloneDefaultGoals();

  if (!prismaClient) {
    return;
  }

  try {
    const owner = await prismaClient.user.findFirst({
      where: { role: "OWNER" },
      include: { profile: true },
      orderBy: { createdAt: "asc" },
    });

    if (owner?.profile) {
      commandCenterProfile = {
        ...cloneDefaultProfile(),
        legalName: owner.profile.legalName ?? defaultCommandCenterProfile.legalName,
        commissionNumber: owner.profile.commissionNumber ?? defaultCommandCenterProfile.commissionNumber,
        commissionIssueDate: toIsoDate(owner.profile.commissionIssueDate) ?? defaultCommandCenterProfile.commissionIssueDate,
        commissionExpirationDate:
          toIsoDate(owner.profile.commissionExpirationDate) ?? defaultCommandCenterProfile.commissionExpirationDate,
        commissionApprovedDate: toIsoDate(owner.profile.commissionApprovedDate),
        ronAuthorized: Boolean(owner.profile.ronAuthorized),
        ronIssueDate: toIsoDate(owner.profile.ronIssueDate),
        ronExpirationDate: toIsoDate(owner.profile.ronExpirationDate),
        oathCompleted: Boolean(owner.profile.oathCompleted),
        bciDate: toIsoDate(owner.profile.bciDate),
        sealOrdered: Boolean(owner.profile.sealOrdered),
        sealReceivedDate: toIsoDate(owner.profile.sealReceivedDate),
        journalTypeConfigured: owner.profile.journalTypeConfigured ?? defaultCommandCenterProfile.journalTypeConfigured,
        eSignatureConfigured: Boolean(owner.profile.eSignatureConfigured),
        eSealConfigured: Boolean(owner.profile.eSealConfigured),
        ronPlatformConfigured: Boolean(owner.profile.ronPlatformConfigured),
        initialEducationCompleted: Boolean(owner.profile.initialEducationCompleted),
        ronEducationCompleted: Boolean(owner.profile.ronEducationCompleted),
        initialApplicationFiled: Boolean(owner.profile.initialApplicationFiled),
        ronApplicationFiled: Boolean(owner.profile.ronApplicationFiled),
        llcFormed: Boolean(owner.profile.llcFormed),
        llcFormedDate: toIsoDate(owner.profile.llcFormedDate),
        einObtainedDate: toIsoDate(owner.profile.einObtainedDate),
        businessBankingReady: Boolean(owner.profile.businessBankingReady),
        eoInsuranceActive: Boolean(owner.profile.eoInsuranceActive),
        eoInsuranceRenewalDate: toIsoDate(owner.profile.eoInsuranceRenewalDate),
        googleBusinessProfileLive: Boolean(owner.profile.googleBusinessProfileLive),
        websiteLive: Boolean(owner.profile.websiteLive),
        employerPrivateSeparationConfirmed: Boolean(owner.profile.employerPrivateSeparationConfirmed),
      };
    }

    const persistedMilestones = await prismaClient.launchMilestone.findMany({
      where: { sourceType: "MANUAL" },
      orderBy: { sortOrder: "asc" },
    });

    persistedMilestones.forEach((milestone: any) => {
      manualMilestoneState[milestone.code] = {
        status: milestone.status === "COMPLETED" ? undefined : milestone.status,
        completedAt: milestone.completedAt ? new Date(milestone.completedAt).toISOString() : undefined,
        ownerNotes: milestone.ownerNotes ?? undefined,
      };
    });

    const persistedGoals = await prismaClient.goal.findMany({
      orderBy: [{ startDate: "asc" }],
    });

    if (persistedGoals.length > 0) {
      const mergedGoalStore = cloneDefaultGoals();

      persistedGoals.forEach((goal: any) => {
        const index = mergedGoalStore.findIndex((candidate) => candidate.id === goal.id);
        const normalized = {
          id: goal.id,
          periodType: goal.periodType,
          startDate: toIsoDate(goal.startDate) ?? DEMO_NOW.toISOString().slice(0, 10),
          endDate: toIsoDate(goal.endDate) ?? DEMO_NOW.toISOString().slice(0, 10),
          revenueTarget: goal.revenueTarget,
          appointmentTarget: goal.appointmentTarget,
          ronTarget: goal.ronTarget,
          mobileTarget: goal.mobileTarget,
          reviewTarget: goal.reviewTarget,
          b2bOutreachTarget: goal.b2bOutreachTarget,
        } satisfies Goal;

        if (index === -1) {
          mergedGoalStore.push(normalized);
        } else {
          mergedGoalStore[index] = normalized;
        }
      });

      goalStore = mergedGoalStore;
    }
  } catch (error) {
    console.error("Failed to hydrate launch state from Prisma. Falling back to in-memory defaults.", error);
    commandCenterProfile = cloneDefaultProfile();
    manualMilestoneState = cloneDefaultManualState();
    goalStore = cloneDefaultGoals();
  }
}

async function syncPersistedMilestoneTasks(
  prismaClient: any,
  milestoneId: string,
  blueprint: MilestoneBlueprint,
  milestoneStatus: LaunchMilestoneStatus,
  completedAt?: string,
) {
  await prismaClient.launchTask.deleteMany({
    where: { milestoneId },
  });

  if (blueprint.tasks.length === 0) {
    return;
  }

  await prismaClient.launchTask.createMany({
    data: blueprint.tasks.map((task) => ({
      milestoneId,
      title: task.title,
      status:
        milestoneStatus === "COMPLETED"
          ? "COMPLETED"
          : milestoneStatus === "IN_PROGRESS"
            ? "IN_PROGRESS"
            : milestoneStatus === "BLOCKED"
              ? "BLOCKED"
              : "PENDING",
      completedAt: milestoneStatus === "COMPLETED" && completedAt ? new Date(completedAt) : null,
      requiresManualConfirmation: task.requiresManualConfirmation,
      evidenceType: task.evidenceType,
      evidenceValue: null,
    })),
  });
}

function getRevenueEventSummary() {
  const analytics = getAnalyticsSummary();
  const completedAppointments = mockAppointments.filter(
    (appointment) => appointment.status === "completed",
  );
  const inPersonCompleted = completedAppointments.filter(
    (appointment) => appointment.serviceMode !== "ron",
  );
  const ronCompleted = completedAppointments.filter(
    (appointment) => appointment.serviceMode === "ron",
  );
  const firstMonthAppointments = mockAppointments.filter((appointment) =>
    appointment.scheduledStart.startsWith("2026-03"),
  );

  const serviceMix = Object.entries(
    completedAppointments.reduce<Record<string, number>>((accumulator, appointment) => {
      const key = appointment.serviceMode === "ron" ? "RON" : formatLabel(appointment.facilityType);
      accumulator[key] = (accumulator[key] ?? 0) + 1;
      return accumulator;
    }, {}),
  ).map(([label, count]) => ({ label, count }));

  return {
    analytics,
    completedAppointments,
    inPersonCompleted,
    ronCompleted,
    firstMonthAppointments,
    serviceMix,
    paidInvoiceCount: portalInvoices.filter((invoice) => invoice.status === "paid").length,
    reviewSentCount: mockAppointments.filter((appointment) => appointment.reviewSent).length,
    reviewCompletedCount: 0,
    repeatClientCount: 0,
    directB2BCount: mockAppointments.filter((appointment) => appointment.channel === "employer").length,
    titlePackageCount: mockAppointments.filter(
      (appointment) => appointment.serviceType === "loan_signing" && appointment.status === "completed",
    ).length,
  };
}

function computeBaseReadiness(profile: CommandCenterNotaryProfile) {
  const commissionChecks = [
    profile.initialEducationCompleted,
    profile.initialApplicationFiled,
    Boolean(profile.commissionApprovedDate),
    profile.oathCompleted,
    profile.sealOrdered,
  ];
  const commissionActive = commissionChecks.every(Boolean);

  const ronChecks = [
    commissionActive,
    profile.ronEducationCompleted,
    profile.ronApplicationFiled,
    profile.ronAuthorized,
    profile.eSignatureConfigured,
    profile.eSealConfigured,
    profile.ronPlatformConfigured,
  ];
  const ronReadiness = Math.round((ronChecks.filter(Boolean).length / ronChecks.length) * 100);
  const ronActive = ronChecks.every(Boolean) && profile.recordingStorageConfigured;

  const businessChecks = [
    profile.intakeWorkflowReady,
    profile.pricingPolicyReady,
    profile.travelZonePolicyReady,
    profile.googleBusinessProfileLive,
    profile.websiteLive,
    profile.employerPrivateSeparationConfirmed,
    profile.llcFormed,
    Boolean(profile.einObtainedDate),
    profile.businessBankingReady,
    profile.eoInsuranceActive,
  ];

  const revenueChecks = [
    mockAppointments.some((appointment) => appointment.status === "quoted"),
    mockAppointments.some((appointment) => appointment.status === "booked"),
    mockAppointments.some((appointment) => appointment.status === "completed"),
    portalInvoices.some((invoice) => invoice.status === "paid"),
    mockAppointments.some((appointment) => appointment.reviewSent),
  ];

  const currentAllowedServiceModes: AllowedServiceMode = ronActive
    ? "IN_PERSON_AND_RON"
    : commissionActive
      ? "IN_PERSON_ONLY"
      : "NONE";

  const blockingIssues: string[] = [];
  if (!commissionActive) {
    blockingIssues.push("Commission is not active. In-person and RON notarizations should stay blocked.");
  }
  if (commissionActive && !profile.travelZonePolicyReady) {
    blockingIssues.push("Travel zone policy is not finalized. Mobile pricing risk remains high.");
  }
  if (profile.ronAuthorized && !profile.recordingStorageConfigured) {
    blockingIssues.push("RON is authorized, but recording storage/export workflow is not fully documented.");
  }
  if (!profile.llcFormed) {
    blockingIssues.push("Business entity setup is incomplete. LLC filing is still open.");
  }
  if (!profile.businessBankingReady) {
    blockingIssues.push("Business banking is not separated from personal activity yet.");
  }
  if (!profile.eoInsuranceActive) {
    blockingIssues.push("E&O insurance is not active.");
  }

  return {
    commissionChecks,
    commissionActive,
    ronChecks,
    ronReadiness,
    ronActive,
    businessChecks,
    revenueChecks,
    currentAllowedServiceModes,
    blockingIssues,
  };
}

function buildDeadlineAlerts(
  profile: CommandCenterNotaryProfile,
  milestones: LaunchMilestone[],
  blockingIssues: string[],
) {
  const alerts: LaunchAlert[] = [];

  milestones
    .filter((milestone) => milestone.dueDate && milestone.status !== "COMPLETED")
    .forEach((milestone) => {
      const dueDate = new Date(`${milestone.dueDate}T00:00:00`);
      const daysUntilDue = Math.ceil((dueDate.getTime() - DEMO_NOW.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 14) {
        alerts.push({
          id: `alert-due-${milestone.code}`,
          code: `due_${milestone.code}`,
          severity: daysUntilDue <= 7 ? "warning" : "info",
          title: `${milestone.title} due soon`,
          body: `${milestone.title} is due in ${Math.max(daysUntilDue, 0)} day(s).`,
          relatedMilestoneCode: milestone.code,
          dueDate: milestone.dueDate,
        });
      }
    });

  if (profile.bciDate) {
    const bciAgeDays = Math.floor((DEMO_NOW.getTime() - new Date(`${profile.bciDate}T00:00:00`).getTime()) / (1000 * 60 * 60 * 24));
    if (bciAgeDays > 150 && !profile.initialApplicationFiled) {
      alerts.push({
        id: "alert-bci-window",
        code: "bci_window",
        severity: "warning",
        title: "BCI window aging",
        body: "BCI is nearing the 6-month filing window. Re-run BCI if filing will slip.",
        relatedMilestoneCode: "commission_application_filed",
      });
    }
  }

  blockingIssues.forEach((issue, index) => {
    alerts.push({
      id: `alert-blocker-${index}`,
      code: `blocker_${index}`,
      severity: "block",
      title: "Blocking issue",
      body: issue,
    });
  });

  return alerts;
}

function getDerivedMilestoneCompletion(code: string, profile: CommandCenterNotaryProfile) {
  const revenue = getRevenueEventSummary();

  switch (code) {
    case "course_completed":
      return { completed: profile.initialEducationCompleted, completedAt: profile.bciDate };
    case "commission_application_filed":
      return { completed: profile.initialApplicationFiled, completedAt: profile.commissionIssueDate };
    case "commission_approved":
      return { completed: Boolean(profile.commissionApprovedDate), completedAt: profile.commissionApprovedDate };
    case "oath_completed_in_person":
      return { completed: profile.oathCompleted, completedAt: profile.commissionIssueDate };
    case "seal_ordered":
      return { completed: profile.sealOrdered, completedAt: profile.sealReceivedDate };
    case "commission_active": {
      const readiness = computeBaseReadiness(profile);
      return { completed: readiness.commissionActive, completedAt: readiness.commissionActive ? profile.commissionIssueDate : undefined };
    }
    case "journal_habit_configured":
      return { completed: Boolean(profile.journalTypeConfigured), completedAt: profile.commissionIssueDate };
    case "first_in_person_appointment_completed":
      return { completed: revenue.inPersonCompleted.length > 0, completedAt: revenue.inPersonCompleted[0]?.scheduledStart };
    case "first_invoice_paid":
      return { completed: revenue.paidInvoiceCount > 0, completedAt: revenue.paidInvoiceCount > 0 ? "2026-03-26" : undefined };
    case "ron_course_completed":
      return { completed: profile.ronEducationCompleted, completedAt: profile.ronIssueDate };
    case "ron_application_filed":
      return { completed: profile.ronApplicationFiled, completedAt: profile.ronIssueDate };
    case "ron_authorized":
      return { completed: profile.ronAuthorized && Boolean(profile.ronIssueDate), completedAt: profile.ronIssueDate };
    case "e_signature_configured":
      return { completed: profile.eSignatureConfigured, completedAt: profile.ronIssueDate };
    case "e_seal_configured":
      return { completed: profile.eSealConfigured, completedAt: profile.ronIssueDate };
    case "ron_platform_configured":
      return { completed: profile.ronPlatformConfigured, completedAt: profile.ronIssueDate };
    case "first_ron_session_completed":
      return { completed: revenue.ronCompleted.length > 0, completedAt: revenue.ronCompleted[0]?.scheduledStart };
    case "llc_formed":
      return { completed: profile.llcFormed, completedAt: profile.llcFormedDate };
    case "ein_obtained":
      return { completed: Boolean(profile.einObtainedDate), completedAt: profile.einObtainedDate };
    case "eo_obtained":
      return { completed: profile.eoInsuranceActive, completedAt: profile.eoInsuranceRenewalDate };
    case "employer_private_separation_confirmed":
      return { completed: profile.employerPrivateSeparationConfirmed, completedAt: profile.commissionIssueDate };
    case "google_business_profile_live":
      return { completed: profile.googleBusinessProfileLive, completedAt: "2026-03-15" };
    case "website_live":
      return { completed: profile.websiteLive, completedAt: "2026-03-26" };
    case "first_repeat_client":
      return { completed: revenue.repeatClientCount > 0, completedAt: undefined };
    case "first_signing_agent_title_package":
      return { completed: revenue.titlePackageCount > 0, completedAt: undefined };
    default:
      return { completed: false, completedAt: undefined };
  }
}

export function getReadinessSummary(
  profile: CommandCenterNotaryProfile = commandCenterProfile,
): ReadinessSummary {
  const base = computeBaseReadiness(profile);
  const milestones = getLaunchMilestones(profile);

  const nextMilestone = milestones.find((milestone) =>
    milestone.status === "AVAILABLE" || milestone.status === "IN_PROGRESS" || milestone.status === "BLOCKED",
  );

  const expiringDeadlines = buildDeadlineAlerts(profile, milestones, base.blockingIssues).filter(
    (alert) => alert.severity !== "info" || alert.dueDate,
  );

  return {
    commissionReadiness: Math.round((base.commissionChecks.filter(Boolean).length / base.commissionChecks.length) * 100),
    commissionActive: base.commissionActive,
    ronReadiness: base.ronReadiness,
    ronActive: base.ronActive,
    businessSetupReadiness: Math.round((base.businessChecks.filter(Boolean).length / base.businessChecks.length) * 100),
    revenueReadiness: Math.round((base.revenueChecks.filter(Boolean).length / base.revenueChecks.length) * 100),
    currentAllowedServiceModes: base.currentAllowedServiceModes,
    nextCriticalAction: nextMilestone
      ? {
          milestoneCode: nextMilestone.code,
          title: nextMilestone.title,
          description: nextMilestone.description,
          href: getMilestoneBlueprint(nextMilestone.code)?.href ?? "/dashboard/tasks",
        }
      : null,
    blockingIssues: base.blockingIssues,
    expiringDeadlines,
    permissionMatrix: {
      canBookInPerson: base.commissionActive,
      canCompleteInPerson: base.commissionActive,
      canBookRON: base.ronActive,
      canCompleteRON: base.ronActive,
    },
  };
}

export function getLaunchMilestones(
  profile: CommandCenterNotaryProfile = commandCenterProfile,
): LaunchMilestone[] {
  const milestones = milestoneBlueprints
    .slice()
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((blueprint) => {
      const dependencyMilestones = milestoneBlueprints.filter((candidate) =>
        blueprint.dependencyCodes.includes(candidate.code),
      );
      const dependencyCodes = dependencyMilestones.map((candidate) => candidate.code);
      const dependencyStatuses = dependencyCodes.map((code) => {
        const dependencyBlueprint = getMilestoneBlueprint(code)!;
        return resolveMilestoneStatus(dependencyBlueprint, profile, true).status;
      });
      const dependenciesMet = dependencyStatuses.every((status) => status === "COMPLETED");
      const resolved = resolveMilestoneStatus(blueprint, profile, dependenciesMet);

      return {
        id: `milestone-${blueprint.code}`,
        phase: blueprint.phase,
        code: blueprint.code,
        title: blueprint.title,
        description: blueprint.description,
        status: resolved.status,
        dueDate: blueprint.dueDate,
        completedAt: resolved.completedAt,
        sortOrder: blueprint.sortOrder,
        dependencyCodes: blueprint.dependencyCodes,
        blockerReason: resolved.blockerReason,
        ownerNotes: resolved.ownerNotes,
        sourceType: blueprint.sourceType,
        dependenciesMet,
        tasks: buildMilestoneTasks(blueprint, resolved.status, resolved.completedAt),
      } satisfies LaunchMilestone;
    });

  return milestones;
}

function resolveMilestoneStatus(
  blueprint: MilestoneBlueprint,
  profile: CommandCenterNotaryProfile,
  dependenciesMet: boolean,
) {
  const manualState = manualMilestoneState[blueprint.code];

  if (blueprint.sourceType === "DERIVED") {
    const derived = getDerivedMilestoneCompletion(blueprint.code, profile);
    if (derived.completed) {
      return {
        status: "COMPLETED" as LaunchMilestoneStatus,
        completedAt: derived.completedAt,
        ownerNotes: undefined,
        blockerReason: undefined,
      };
    }

    if (!dependenciesMet) {
      return {
        status: "LOCKED" as LaunchMilestoneStatus,
        completedAt: undefined,
        ownerNotes: undefined,
        blockerReason: `Requires ${blueprint.dependencyCodes.map((code) => formatLabel(code)).join(", ")}`,
      };
    }

    return {
      status: "AVAILABLE" as LaunchMilestoneStatus,
      completedAt: undefined,
      ownerNotes: undefined,
      blockerReason: undefined,
    };
  }

  if (manualState?.completedAt) {
    return {
      status: "COMPLETED" as LaunchMilestoneStatus,
      completedAt: manualState.completedAt,
      ownerNotes: manualState.ownerNotes,
      blockerReason: undefined,
    };
  }

  if (!dependenciesMet) {
    return {
      status: "LOCKED" as LaunchMilestoneStatus,
      completedAt: undefined,
      ownerNotes: manualState?.ownerNotes ?? blueprint.manualNotes,
      blockerReason: `Requires ${blueprint.dependencyCodes.map((code) => formatLabel(code)).join(", ")}`,
    };
  }

  const status = manualState?.status ?? blueprint.manualDefaultStatus ?? "AVAILABLE";
  return {
    status,
    completedAt: undefined,
    ownerNotes: manualState?.ownerNotes ?? blueprint.manualNotes,
    blockerReason: status === "BLOCKED" ? manualState?.ownerNotes ?? "Blocked by dependency or missing evidence." : undefined,
  };
}

function buildMilestoneTasks(
  blueprint: MilestoneBlueprint,
  milestoneStatus: LaunchMilestoneStatus,
  completedAt?: string,
): LaunchTask[] {
  return blueprint.tasks.map((task, index) => ({
    id: `task-${blueprint.code}-${index + 1}`,
    milestoneCode: blueprint.code,
    title: task.title,
    status:
      milestoneStatus === "COMPLETED"
        ? "COMPLETED"
        : milestoneStatus === "IN_PROGRESS"
          ? "IN_PROGRESS"
          : milestoneStatus === "BLOCKED" || milestoneStatus === "LOCKED"
            ? "BLOCKED"
            : "PENDING",
    completedAt: milestoneStatus === "COMPLETED" ? completedAt : undefined,
    requiresManualConfirmation: task.requiresManualConfirmation,
    evidenceType: task.evidenceType,
  }));
}

function getMilestoneBlueprint(code: string) {
  return milestoneBlueprints.find((blueprint) => blueprint.code === code);
}

export function getLaunchAlerts(
  profile: CommandCenterNotaryProfile = commandCenterProfile,
): LaunchAlert[] {
  const milestones = getLaunchMilestones(profile);
  const base = computeBaseReadiness(profile);
  return buildDeadlineAlerts(profile, milestones, base.blockingIssues);
}

export function getLaunchTaskQueue(
  profile: CommandCenterNotaryProfile = commandCenterProfile,
) {
  return getLaunchMilestones(profile)
    .filter((milestone) => milestone.status === "AVAILABLE" || milestone.status === "IN_PROGRESS" || milestone.status === "BLOCKED")
    .flatMap((milestone) =>
      milestone.tasks.map((task) => ({
        ...task,
        milestoneTitle: milestone.title,
        phase: milestone.phase,
        milestoneStatus: milestone.status,
        dueDate: milestone.dueDate,
        blockerReason: milestone.blockerReason,
        href: getMilestoneBlueprint(milestone.code)?.href ?? "/dashboard/tasks",
      })),
    );
}

export function getGoals() {
  const revenue = getRevenueEventSummary();
  return goalStore.map((goal) => {
    const snapshot: GoalSnapshot = {
      goalId: goal.id,
      actualRevenue:
        goal.periodType === "MONTH"
          ? revenue.firstMonthAppointments
              .filter((appointment) => appointment.status === "completed")
              .reduce((total, appointment) => total + appointment.total, 0)
          : revenue.analytics.revenue,
      actualAppointments:
        goal.periodType === "MONTH"
          ? revenue.firstMonthAppointments.filter((appointment) => appointment.status === "completed").length
          : revenue.completedAppointments.length,
      actualRON: revenue.ronCompleted.length,
      actualMobile: revenue.inPersonCompleted.length,
      actualReviews: revenue.reviewSentCount,
      actualB2BOutreach: publicLeads.filter((lead) => lead.source === "referral" || lead.source === "google_business_profile").length,
      updatedAt: DEMO_NOW.toISOString(),
    };

    const completionRate = Math.min(
      100,
      Math.round((snapshot.actualRevenue / Math.max(goal.revenueTarget, 1)) * 100),
    );

    return { ...goal, snapshot, completionRate };
  });
}

export function getCommandCenterData(): CommandCenterData {
  const profile = commandCenterProfile;
  const readiness = getReadinessSummary(profile);
  const milestones = getLaunchMilestones(profile);
  const alerts = getLaunchAlerts(profile);
  const revenue = getRevenueEventSummary();
  const goals = getGoals();

  const progressByPhase = (Object.keys(phaseLabels) as LaunchPhase[]).map((phase) => {
    const phaseMilestones = milestones.filter((milestone) => milestone.phase === phase);
    const completed = phaseMilestones.filter((milestone) => milestone.status === "COMPLETED").length;
    return {
      phase,
      label: phaseLabels[phase],
      completed,
      total: phaseMilestones.length,
      progressPercent: Math.round((completed / Math.max(phaseMilestones.length, 1)) * 100),
    };
  });

  const revenueByLane = [
    {
      label: "Employer/internal",
      value: mockAppointments
        .filter((appointment) => appointment.channel === "employer" && appointment.status === "completed")
        .reduce((total, appointment) => total + appointment.total, 0),
    },
    {
      label: "Mobile in-person",
      value: revenue.inPersonCompleted.reduce((total, appointment) => total + appointment.total, 0),
    },
    {
      label: "RON",
      value: revenue.ronCompleted.reduce((total, appointment) => total + appointment.total, 0),
    },
  ];

  const pipelineCounts = mockAppointments.reduce<Record<string, number>>((accumulator, appointment) => {
    accumulator[appointment.status] = (accumulator[appointment.status] ?? 0) + 1;
    return accumulator;
  }, {});

  return {
    profile,
    readiness,
    milestones,
    alerts,
    goals,
    progressByPhase,
    startHere: {
      nextAction: readiness.nextCriticalAction,
      blockers: readiness.blockingIssues,
      dueSoon: alerts.filter((alert) => alert.relatedMilestoneCode).slice(0, 4),
    },
    revenue: {
      thisMonth: revenue.firstMonthAppointments
        .filter((appointment) => appointment.status === "completed")
        .reduce((total, appointment) => total + appointment.total, 0),
      pipelineCounts,
      revenueByLane,
      firstsAchieved: milestones.filter(
        (milestone) =>
          milestone.phase === "OPERATIONS" || milestone.phase === "RON" || milestone.phase === "REVENUE_SCALE",
      ).filter((milestone) => milestone.status === "COMPLETED").slice(0, 8),
      travelEfficiency: {
        revenuePerMile: Number(revenue.analytics.revenuePerMile.toFixed(2)),
        travelRevenue: revenue.analytics.travelFeeRevenue,
        totalMiles: mockAppointments.reduce((total, appointment) => total + appointment.travelMiles, 0),
      },
      reviewStats: {
        sent: revenue.reviewSentCount,
        completed: revenue.reviewCompletedCount,
        pending: Math.max(revenue.reviewSentCount - revenue.reviewCompletedCount, 0),
        conversionRate:
          revenue.reviewSentCount === 0
            ? 0
            : Number(((revenue.reviewCompletedCount / revenue.reviewSentCount) * 100).toFixed(1)),
      },
      serviceMix: revenue.serviceMix,
    },
  };
}

export function getReadinessPageData() {
  const commandCenter = getCommandCenterData();
  return {
    profile: commandCenter.profile,
    readiness: commandCenter.readiness,
    alerts: commandCenter.alerts,
    milestoneSummary: commandCenter.milestones.filter(
      (milestone) =>
        milestone.code === "commission_active" ||
        milestone.code === "ron_authorized" ||
        milestone.code === "recording_storage_configured" ||
        milestone.code === "employer_private_separation_confirmed",
    ),
  };
}

export function getGoalPageData() {
  const goals = getGoals();
  const revenue = getRevenueEventSummary();
  return {
    goals,
    scorecards: [
      { label: "Revenue target attainment", value: `${goals[0]?.completionRate ?? 0}%` },
      { label: "Appointments completed", value: `${goals[0]?.snapshot.actualAppointments ?? 0}` },
      { label: "RON completions", value: `${revenue.ronCompleted.length}` },
      { label: "Review requests sent", value: `${revenue.reviewSentCount}` },
    ],
  };
}

export async function getLaunchMilestonesAsync(
  profile?: CommandCenterNotaryProfile,
) {
  await hydratePersistedState();
  return getLaunchMilestones(profile ?? commandCenterProfile);
}

export async function getReadinessSummaryAsync(
  profile?: CommandCenterNotaryProfile,
) {
  await hydratePersistedState();
  return getReadinessSummary(profile ?? commandCenterProfile);
}

export async function getLaunchAlertsAsync(
  profile?: CommandCenterNotaryProfile,
) {
  await hydratePersistedState();
  return getLaunchAlerts(profile ?? commandCenterProfile);
}

export async function getLaunchTaskQueueAsync(
  profile?: CommandCenterNotaryProfile,
) {
  await hydratePersistedState();
  return getLaunchTaskQueue(profile ?? commandCenterProfile);
}

export async function getGoalsAsync() {
  await hydratePersistedState();
  return getGoals();
}

export async function getCommandCenterDataAsync() {
  await hydratePersistedState();
  return getCommandCenterData();
}

export async function getReadinessPageDataAsync() {
  await hydratePersistedState();
  return getReadinessPageData();
}

export async function getGoalPageDataAsync() {
  await hydratePersistedState();
  return getGoalPageData();
}

export function updateMilestone(input: {
  code: string;
  status?: Exclude<LaunchMilestoneStatus, "LOCKED" | "COMPLETED">;
  completed?: boolean;
  ownerNotes?: string;
}) {
  const existing = manualMilestoneState[input.code] ?? {};
  manualMilestoneState[input.code] = {
    ...existing,
    status: input.completed ? undefined : input.status ?? existing.status,
    completedAt: input.completed ? DEMO_NOW.toISOString() : existing.completedAt,
    ownerNotes: input.ownerNotes ?? existing.ownerNotes,
  };

  return getLaunchMilestones().find((milestone) => milestone.code === input.code);
}

export async function updateMilestoneAsync(input: {
  code: string;
  status?: Exclude<LaunchMilestoneStatus, "LOCKED" | "COMPLETED">;
  completed?: boolean;
  ownerNotes?: string;
}) {
  const blueprint = getMilestoneBlueprint(input.code);
  if (!blueprint) {
    return null;
  }

  await hydratePersistedState();

  const updated = updateMilestone(input);
  const prismaClient = getPrismaClient();

  if (!prismaClient || blueprint.sourceType !== "MANUAL") {
    return updated;
  }

  const persisted = await prismaClient.launchMilestone.upsert({
    where: { code: input.code },
    update: {
      phase: blueprint.phase,
      title: blueprint.title,
      description: blueprint.description,
      status: updated?.status ?? "AVAILABLE",
      dueDate: parseStoredDate(blueprint.dueDate),
      completedAt: updated?.completedAt ? new Date(updated.completedAt) : null,
      sortOrder: blueprint.sortOrder,
      dependencyCodes: blueprint.dependencyCodes,
      blockerReason: updated?.blockerReason ?? null,
      ownerNotes: updated?.ownerNotes ?? null,
      sourceType: blueprint.sourceType,
    },
    create: {
      code: input.code,
      phase: blueprint.phase,
      title: blueprint.title,
      description: blueprint.description,
      status: updated?.status ?? "AVAILABLE",
      dueDate: parseStoredDate(blueprint.dueDate),
      completedAt: updated?.completedAt ? new Date(updated.completedAt) : null,
      sortOrder: blueprint.sortOrder,
      dependencyCodes: blueprint.dependencyCodes,
      blockerReason: updated?.blockerReason ?? null,
      ownerNotes: updated?.ownerNotes ?? null,
      sourceType: blueprint.sourceType,
    },
  });

  await syncPersistedMilestoneTasks(
    prismaClient,
    persisted.id,
    blueprint,
    updated?.status ?? "AVAILABLE",
    updated?.completedAt,
  );

  await hydratePersistedState();
  return getLaunchMilestones().find((milestone) => milestone.code === input.code) ?? updated ?? null;
}

export function updateGoal(input: Partial<Goal> & { id: string }) {
  const index = goalStore.findIndex((goal) => goal.id === input.id);
  if (index === -1) {
    return null;
  }

  goalStore[index] = {
    ...goalStore[index],
    ...input,
  };

  return getGoals().find((goal) => goal.id === input.id) ?? null;
}

export async function updateGoalAsync(input: Partial<Goal> & { id: string }) {
  await hydratePersistedState();

  const updated = updateGoal(input);
  if (!updated) {
    return null;
  }

  const prismaClient = getPrismaClient();
  if (!prismaClient) {
    return updated;
  }

  await prismaClient.goal.upsert({
    where: { id: updated.id },
    update: {
      periodType: updated.periodType,
      startDate: parseStoredDate(updated.startDate) ?? DEMO_NOW,
      endDate: parseStoredDate(updated.endDate) ?? DEMO_NOW,
      revenueTarget: updated.revenueTarget,
      appointmentTarget: updated.appointmentTarget,
      ronTarget: updated.ronTarget,
      mobileTarget: updated.mobileTarget,
      reviewTarget: updated.reviewTarget,
      b2bOutreachTarget: updated.b2bOutreachTarget,
    },
    create: {
      id: updated.id,
      periodType: updated.periodType,
      startDate: parseStoredDate(updated.startDate) ?? DEMO_NOW,
      endDate: parseStoredDate(updated.endDate) ?? DEMO_NOW,
      revenueTarget: updated.revenueTarget,
      appointmentTarget: updated.appointmentTarget,
      ronTarget: updated.ronTarget,
      mobileTarget: updated.mobileTarget,
      reviewTarget: updated.reviewTarget,
      b2bOutreachTarget: updated.b2bOutreachTarget,
    },
  });

  await hydratePersistedState();
  return getGoals().find((goal) => goal.id === input.id) ?? updated;
}

export function canBookService(mode: "in_person" | "ron") {
  const readiness = getReadinessSummary();
  if (mode === "ron") {
    return {
      ok: readiness.permissionMatrix.canBookRON,
      blockers: readiness.permissionMatrix.canBookRON
        ? []
        : ["RON booking is blocked until commission, authorization, and platform readiness are all active."],
    };
  }

  return {
    ok: readiness.permissionMatrix.canBookInPerson,
    blockers: readiness.permissionMatrix.canBookInPerson
      ? []
      : ["In-person booking is blocked until the Ohio commission is active."],
  };
}

export function canCompleteService(mode: "in_person" | "ron", unresolvedBlockingFlags = 0) {
  const readiness = getReadinessSummary();
  if (mode === "ron") {
    const blockers = [
      ...(readiness.permissionMatrix.canCompleteRON
        ? []
        : ["RON completion is blocked until commission, authorization, e-signature, e-seal, platform, and recording readiness are active."]),
      ...(unresolvedBlockingFlags > 0 ? ["RON completion is blocked by unresolved compliance flags."] : []),
    ];
    return { ok: blockers.length === 0, blockers };
  }

  const blockers = [
    ...(readiness.permissionMatrix.canCompleteInPerson
      ? []
      : ["In-person completion is blocked until the Ohio commission is active."]),
    ...(unresolvedBlockingFlags > 0 ? ["In-person completion is blocked by unresolved compliance flags."] : []),
  ];

  return { ok: blockers.length === 0, blockers };
}

export async function canBookServiceAsync(mode: "in_person" | "ron") {
  await hydratePersistedState();
  return canBookService(mode);
}

export async function canCompleteServiceAsync(
  mode: "in_person" | "ron",
  unresolvedBlockingFlags = 0,
) {
  await hydratePersistedState();
  return canCompleteService(mode, unresolvedBlockingFlags);
}
