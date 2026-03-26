export interface DashboardTask {
  title: string;
  status: "done" | "in_progress" | "next" | "blocked";
  note: string;
}

export interface DashboardPhase {
  slug: "commission" | "operations" | "ron" | "business";
  href: "/dashboard/launch" | "/dashboard/compliance" | "/dashboard/revenue";
  title: string;
  description: string;
  tasks: DashboardTask[];
}

export interface FeeReference {
  label: string;
  amount: string;
  note: string;
}

export interface InsightCard {
  title: string;
  body: string;
}

export const launchPhases: DashboardPhase[] = [
  {
    slug: "commission",
    href: "/dashboard/launch",
    title: "Phase A: Get commissioned",
    description: "Finish the Ohio commission sequence before performing any notarial acts.",
    tasks: [
      { title: "BCI completed", status: "done", note: "Keep the report within the 6-month submission window." },
      { title: "Approved education and testing", status: "next", note: "Complete the non-attorney course and exam before applying." },
      { title: "File the Ohio application", status: "next", note: "Upload signature, BCI, and proof of completion through the state portal." },
      { title: "Take the oath in person", status: "blocked", note: "Required before performing notarial acts." },
      { title: "Order seal and journal", status: "next", note: "Physical seal is required before starting work." },
    ],
  },
  {
    slug: "operations",
    href: "/dashboard/launch",
    title: "Phase B: Become operational",
    description: "Build the appointment workflow, compliance habits, and service packaging.",
    tasks: [
      { title: "Set up intake and quote workflow", status: "in_progress", note: "Booking, pricing, and readiness screening are now modeled in the app." },
      { title: "Create service packages", status: "in_progress", note: "General mobile, hospital, title, after-hours, and employer/internal lanes." },
      { title: "Set policies", status: "next", note: "Travel, no-show, cancellation, and after-hours disclosures." },
      { title: "Prepare journal and invoice habits", status: "in_progress", note: "Traditional journal supported, RON journal mandatory later." },
    ],
  },
  {
    slug: "ron",
    href: "/dashboard/compliance",
    title: "Phase C: Add remote online notarization",
    description: "Layer the RON workflow onto the commission once the authorization is active.",
    tasks: [
      { title: "Complete RON course and exam", status: "next", note: "Separate education and filing path from the base commission." },
      { title: "File RON authorization", status: "next", note: "Tie authorization dates to the commission term." },
      { title: "Configure e-seal and e-signature", status: "in_progress", note: "Included in the notary profile and RON tracker." },
      { title: "Lock down journal and recordings", status: "in_progress", note: "App now models recording references, electronic journal, and end-of-term export." },
    ],
  },
  {
    slug: "business",
    href: "/dashboard/revenue",
    title: "Phase D: Formalize the business",
    description: "Separate the practice from ad hoc side work and make the business sustainable.",
    tasks: [
      { title: "Form LLC and get EIN", status: "next", note: "Set up entity and banking separation early." },
      { title: "Separate employer vs private workflows", status: "in_progress", note: "Already modeled in the dashboard, analytics, and portal." },
      { title: "Get E&O insurance", status: "next", note: "Optional but strongly recommended as an operational guardrail." },
      { title: "Launch the public website and portal", status: "in_progress", note: "Phase 2 pages and portal routes are now scaffolded." },
    ],
  },
];

export const immediateNextSteps: DashboardTask[] = [
  { title: "Confirm BCI freshness window", status: "done", note: "Treat this as the first commission gating check." },
  { title: "Enroll in the approved Ohio education/testing provider flow", status: "next", note: "Complete the 3-hour course and exam before filing the commission application." },
  { title: "Prepare signature sample and filing documents", status: "next", note: "Application packet should include signature sample, BCI, and proof of completion." },
  { title: "Map your Columbus travel zones and policies", status: "in_progress", note: "The pricing engine and Phase 2 site already assume separate travel disclosure." },
];

export const feeReferences: FeeReference[] = [
  {
    label: "Initial commission filing",
    amount: "$15",
    note: "Ohio filing fee for the base notary commission application.",
  },
  {
    label: "Initial education/testing",
    amount: "$130",
    note: "Standard non-attorney provider reference cost from the playbook.",
  },
  {
    label: "RON filing",
    amount: "$20",
    note: "Separate filing path after the Ohio commission is active.",
  },
  {
    label: "RON education/testing",
    amount: "$250",
    note: "Separate course and exam reference cost for online authorization.",
  },
  {
    label: "Ohio LLC filing",
    amount: "$99",
    note: "Articles of Organization filing fee if formalizing the business as an LLC.",
  },
  {
    label: "Trade name filing",
    amount: "$39",
    note: "Only needed if branding differs from the LLC legal name.",
  },
];

export const filingWindows: InsightCard[] = [
  {
    title: "BCI freshness",
    body: "The BCI report should stay within the 6-month submission window when the application is filed.",
  },
  {
    title: "Education freshness",
    body: "Initial education/testing should fall within the 12-month window before application submission.",
  },
  {
    title: "Oath timing",
    body: "The oath is an in-person requirement after approval and before performing any acts.",
  },
];

export const servicePackages = [
  {
    title: "Employer / internal notary",
    body: "Use this lane as the training ground and stable workflow while you build confidence and repeatable document patterns.",
  },
  {
    title: "Mobile general notary",
    body: "Make travel, urgency, and route efficiency the margin driver rather than the statutory act fee itself.",
  },
  {
    title: "Hospital / hospice / nursing home",
    body: "High-value specialty appointments that need extra readiness, capacity, and access checks.",
  },
  {
    title: "Vehicle title / auto docs",
    body: "Lucrative but higher-risk. Blank title fields should block the workflow immediately.",
  },
  {
    title: "RON sessions",
    body: "Best margin after authorization because drive time disappears and statewide demand opens up.",
  },
  {
    title: "Signing agent / title work",
    body: "The higher-ticket lane to add once your base operations, printing, and document handling are steady.",
  },
];

export const businessLanes: InsightCard[] = [
  {
    title: "Lane 1: Employer / institutional",
    body: "Treat employer demand as your training ground, credibility engine, and repeat-pattern workflow while you are new.",
  },
  {
    title: "Lane 2: Consumer mobile",
    body: "Launch with Columbus and Franklin County travel zones, same-day and after-hours pricing, and hospital or title specialization.",
  },
  {
    title: "Lane 3: Scalable digital",
    body: "Add RON and then signing-agent work so you are no longer capped by car time and local routing alone.",
  },
];

export const complianceRules = [
  "Signer must personally appear in person or through compliant Ohio RON.",
  "Phone identification is not allowed.",
  "Do not proceed with incomplete or materially blank documents.",
  "Do not block-sequence title work around blank transfer fields; just stop the appointment.",
  "Do not notarize your own signature or present copy certification as a service.",
  "Do not decide legal validity or choose the right form unless separately licensed to do so.",
  "Capture ID method for every appointment and keep in-person ID within the allowable expiration window.",
  "For RON, require credential analysis, identity proofing, recording reference, and electronic journal completion before closeout.",
];

export const lawfulActChecklist = [
  "Personal appearance",
  "Proper ID or personal knowledge",
  "Complete notarial certificate",
  "Notary signature and date",
  "Venue information",
  "Commission expiration date on the certificate for non-attorney notaries",
  "Seal applied",
];

export const ohioRiskPoints: InsightCard[] = [
  {
    title: "Title transfers",
    body: "Do not touch title work when required fields are blank. This is one of the easiest ways to create a commission-threatening mistake.",
  },
  {
    title: "Copy certification",
    body: "Do not present true-copy certification as a service. The workflow should block it and redirect the client instead of trying to finesse it.",
  },
  {
    title: "Capacity and coercion",
    body: "Stop the appointment if the signer appears coerced, absent, or mentally incapable.",
  },
  {
    title: "RON security",
    body: "Keep the e-seal, e-signature, journal, and recordings under your exclusive control and retained through the required workflow.",
  },
];

export const revenueRoadmap = [
  {
    title: "First 30 days after commission",
    body: "Get operational fast: seal, journal, intake, invoice template, Google Business Profile, and low-risk general notary jobs.",
  },
  {
    title: "Days 31-90",
    body: "Push into hospitals, title-ready work, reviews, route tracking, and RON preparation while joining signing platforms if desired.",
  },
  {
    title: "Days 91-180",
    body: "Launch RON, start direct outreach to attorneys and title companies, form the LLC if needed, and raise specialty pricing where demand supports it.",
  },
];

export const monetizationLadder = [
  "Employer/internal work for repetition and reliability",
  "Mobile general notary with disclosed travel fees",
  "After-hours, hospital, hospice, and jail premium appointments",
  "RON sessions with tech fee and no drive time",
  "Signing-agent and title-related packages once operations are stable",
];

export const observedPricingSignals: InsightCard[] = [
  {
    title: "General mobile pricing",
    body: "Observed Columbus travel fees in your playbook cluster around roughly $30 to $35 for closer mobile trips, with higher pricing for longer travel and after-hours work.",
  },
  {
    title: "Loan signing pricing",
    body: "Observed local loan-signing examples start around roughly $110 to $135, which sits outside the simple act-fee model and depends on the broader signing package.",
  },
  {
    title: "RON unit economics",
    body: "Ohio allows up to $30 per online act plus up to $10 tech fee per session, which makes RON structurally higher-margin than mobile work once authorized.",
  },
];

export const marketSignals: InsightCard[] = [
  {
    title: "Columbus launch case",
    body: "Franklin County's size, employer base, hospitals, legal offices, and housing activity make Columbus a strong launch market for recurring notary demand.",
  },
  {
    title: "Ohio statewide upside",
    body: "RON expands the addressable market beyond Columbus because you stay physically in Ohio while serving signers in other locations when allowed.",
  },
  {
    title: "Best revenue ranking",
    body: "Your playbook ranks loan signings/title work first, RON second, mobile general notary third, employer/internal fourth, and B2B recurring accounts fifth.",
  },
];

export const dashboardMetricsSummary = {
  launchCompletion: "58%",
  commissionReadiness: "BCI done, education/test next",
  ronReadiness: "Profile and tracker scaffolded",
  businessReadiness: "Website + portal scaffolded, entity setup next",
};
