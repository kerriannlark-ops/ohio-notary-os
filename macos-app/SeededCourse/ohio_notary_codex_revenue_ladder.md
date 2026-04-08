# Ohio Notary Revenue Ladder — Codex Ready

## Core legal rules to enforce
- In Ohio, a non-online notarial act is capped at up to $5 per act.
- An online notarization is capped at up to $30 per act.
- Fees are not calculated per signature.
- A reasonable travel fee is allowed only if agreed in advance.
- A technology fee up to $10 per online notarization session is allowed.
- RON requires separate authorization and a compliant session workflow.
- I-9 work is a separate service lane and must not use a notary seal.

## Revenue ladder

### 1. Employer / in-office notary
Startup cost: Low
Use case: employer files, routine acknowledgments, affidavits, execution support.
App modules: internal queue, act log, signer checklist, employer/private tagging.

### 2. Mobile general notary
Startup cost: Low to Moderate
Use case: routine public appointments and local travel.
App modules: public booking, quote engine, travel zones, mileage, reminders.

### 3. Same-day / after-hours
Startup cost: Low to Moderate
Use case: urgent appointments outside business hours.
App modules: urgency flags, calendar rules, disclosures, cancellation tracking.

### 4. Hospital / hospice / nursing-home
Startup cost: Low to Moderate
Use case: bedside POAs, healthcare directives, urgent family paperwork.
App modules: specialty intake, witness flow, refusal/compliance notes.

### 5. Vehicle title / auto docs
Startup cost: Low to Moderate
Use case: title transfers and sale-related visits.
App modules: title intake, blank-field blocker, document upload, risk banner.

### 6. Remote online notarization (RON)
Startup cost: Moderate
Use case: busy professionals, repeat clients, remote sessions.
App modules: RON session, identity proofing, credential analysis, e-journal, recording refs.

### 7. Notary Signing Agent
Startup cost: Moderate
Use case: refinance, HELOC, seller and buyer packages.
App modules: package tracker, print/scan checklist, shipment tracking, payout reconciliation.

### 8. Apostille support
Startup cost: Low to Moderate
Use case: international document coordination.
App modules: apostille intake, status tracker, shipping log, client timeline.

### 9. I-9 authorized representative
Startup cost: Very Low
Use case: remote hires and employer onboarding support.
App modules: employer intake, ID checklist, Section 2 workflow, recurring billing.

## Build order
1. Core notary and quote engine
2. Mobile booking and travel disclosures
3. Specialty-location workflows
4. RON module
5. Signing-agent workflows
6. Apostille and I-9 modules
7. B2B account management and analytics

## Codex prompt
Build a multi-module Ohio Notary OS that separates standard notarial acts, mobile workflows, RON, signing-agent operations, apostille support, and I-9 authorized representative services.

Requirements:
- Enforce Ohio fee caps and travel disclosure rules.
- Block copy-certification requests.
- Block incomplete title workflows.
- Keep I-9 outside the notarial-act billing path.
- Support distinct routes, data models, and analytics by service lane.
- Prioritize quote compliance, reminders, journals, and revenue tracking.
