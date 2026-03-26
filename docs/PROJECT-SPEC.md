# Ohio Notary OS Project Spec

## 1. Product brief

**Project name:** Ohio Notary OS

**Primary user:** Solo Ohio notary in Columbus building:

- employer/internal notary workflow
- public-facing mobile notary business
- remote online notarization workflow after RON authorization

**Goal:** Build one system that handles intake, eligibility screening, compliant quoting, scheduling, reminders, journaling, invoicing, mileage and revenue analytics, employer-vs-private workflow separation, and RON session management under Ohio rules.

## 2. Product objectives

The app must:

- reduce admin time
- reduce compliance mistakes
- separate employer work from private business work
- support traditional in-person, in-person electronic, and RON workflows
- generate audit-ready logs
- quote only within Ohio statutory fee rules
- support scaling into mobile notary and signing-agent work

## 3. Key business rules

### Commission status

- No booking may be marked performable unless the notary has an active Ohio commission.
- RON bookings require an active Ohio commission and active Ohio RON authorization.

### Education and filing tracking

Store:

- initial education/testing status
- RON education/testing status
- application filing status
- oath completed status

Fee reference fields:

- initial application filing fee = `$15`
- RON filing fee = `$20`
- non-attorney initial education/testing reference = `$130`
- RON education/testing reference = `$250`

### Fee controls

- Traditional and in-person electronic acts: max `$5` per act
- Travel fee allowed only if separately disclosed and agreed before the act
- RON: max `$30` per notarial act
- RON tech fee: max `$10` per online session

### Identity and appearance

- In-person signer must personally appear
- RON must require live audio-video, credential analysis, and identity proofing

### Prohibited or restricted flows

- Block copy certification as a service type
- Block completion when a document is incomplete or materially blank
- Add elevated warning flow for Ohio vehicle title work

### RON records

- Mandatory electronic journal for every online notarization
- Tamper-evident, access-controlled journal
- Store required journal fields and audio-video retention metadata
- Flag end-of-authorization export and transmission workflow

## 4. User roles

### Owner / Notary Admin

- manages all settings
- creates and edits bookings
- completes journal records
- sends invoices
- exports reports
- tracks compliance

### Assistant / Scheduler

- can create/edit intake and appointments
- cannot finalize notarial acts
- cannot edit legal compliance rules

### Bookkeeper

- read-only for invoices, mileage, revenue, and exports

## 5. Core modules

### A. Onboarding + compliance profile

Track:

- legal commissioned name
- commission number
- commission issue and expiration date
- RON authorized flag
- RON issue and expiration date
- base county/city
- business entity type and name
- EIN status
- employer mode enabled
- oath completed
- BCI date
- seal ordered
- journal type configured
- e-signature configured
- e-seal configured
- RON platform configured

### B. Intake + booking engine

Inputs:

- client name, phone, email, preferred contact method
- service type and document type
- signer count and notarial act count
- requested date/time
- address or online
- facility type
- urgency
- identification method expected
- whether signer has physical ID
- witness guidance need
- employer or private channel
- upload preview flag
- travel zone zip and mileage estimate
- special instructions

Outputs:

- eligibility result
- compliance warnings
- required prep checklist
- quote
- scheduling slot options

### C. Pricing engine

Line items:

- notarial act fee
- travel fee
- after-hours surcharge
- specialty-location surcharge
- RON act fee
- RON technology fee
- optional owner-controlled convenience fee
- no-show fee policy reference

Rules:

- hard cap `$5` per traditional/electronic act
- hard cap `$30` per RON act
- hard cap `$10` per RON tech fee
- travel fee only if disclosed
- RON only if `ronAuthorized = true`
- blocked quote if the service type or document type is prohibited

### D. Appointment dashboard

Statuses:

- lead
- awaiting documents
- awaiting ID confirmation
- quoted
- booked
- en route
- signer not ready
- completed
- refused
- cancelled
- no show
- follow-up needed

Views:

- calendar
- kanban
- today agenda
- employer/internal queue
- private-business queue

### E. Compliance engine

Should block or warn on:

- no active commission
- RON without authorization
- signer absent
- incomplete document
- missing notarial certificate
- copy certification request
- in-person act with remote identity only
- undisclosed travel fee
- missing RON credential analysis or identity proofing
- blank title transfer sections
- missing act count
- missing journal entry on completion
- missing electronic journal for completed RON act

### F. Journal module

Support:

- optional traditional journal
- mandatory tamper-evident RON journal
- chronological entries
- secure authentication
- exports
- immutable audit logging

RON journal minimum fields should support:

- date/time of act
- type of notarial act
- title or description of record
- electronic signature of each principal
- principal full name and address
- ID basis
- ID and credential-analysis metadata
- recording reference
- platform used
- notary notes
- refusal reason

### G. RON session tracker

Track:

- platform vendor
- session URL
- credential analysis passed
- identity proofing passed
- audio-video verified
- document uploaded
- e-signature applied
- e-seal applied
- certificate attached
- recording saved
- journal entry complete
- session ended timestamp
- tech fee charged
- failure reason

### H. Invoicing + payments

Fields:

- invoice number
- client
- employer/internal or private channel
- line items
- taxes off by default
- payment status/date/method
- notes
- export status

Outputs:

- PDF invoice
- CSV export
- QuickBooks-friendly export

### I. CRM + follow-up

Automations:

- appointment reminder
- ID reminder
- document completeness reminder
- thank-you
- Google review request
- repeat-client outreach
- attorney/title/company outreach

### J. Analytics dashboard

KPIs:

- total leads
- booking conversion rate
- revenue by service line
- travel-fee revenue
- RON revenue
- employer/internal volume
- private client volume
- average revenue per appointment
- mileage
- revenue per mile
- top zip codes
- top referral sources
- refusal reasons
- compliance flags by type
- review request conversion

## 6. Tech stack

- Frontend: Next.js 14 + TypeScript
- Backend: Next.js API routes or server actions
- Database: PostgreSQL
- ORM: Prisma
- Auth: Clerk or Supabase Auth
- File storage: S3-compatible storage
- Email: Resend
- SMS: Twilio
- Maps/mileage: Google Maps Distance Matrix or Mapbox
- Calendar sync: Google Calendar API
- PDF generation: server-side invoice/journal export
- Hosting: Vercel or Railway plus managed Postgres

## 7. Data model

Core entities:

- `User`
- `NotaryProfile`
- `Client`
- `Appointment`
- `Signer`
- `NotarialAct`
- `Quote`
- `Invoice`
- `JournalEntry`
- `RONSession`
- `ComplianceFlag`
- `ReviewRequest`
- `MileageLog`
- `AuditLog`

## 8. Business logic requirements

### Quote logic

- If service mode is in-person or electronic in-person, cap fees at `$5 x actCount`
- If service mode is RON, cap fees at `$30 x actCount` and require `techFee <= 10`
- If travel fee is not disclosed, set travel fee to `0` and warn
- If service type is `copy_certification`, block
- If RON is requested and authorization is inactive, block
- If the document is incomplete, block
- If title-related blank fields are flagged, block

### Completion logic

Appointment cannot move to completed unless:

- at least one notarial act exists
- signer appearance rules pass
- fee caps validate
- certificate fields are present
- there are no unresolved blocking compliance flags
- for RON: credential analysis, identity proofing, recording reference, and journal entry are complete

## 9. UI requirements

Must-have pages:

- `/dashboard`
- `/bookings/new`
- `/bookings/[id]`
- `/quotes/[id]`
- `/calendar`
- `/journal`
- `/journal/[id]`
- `/ron`
- `/invoices`
- `/clients`
- `/analytics`
- `/settings`
- `/settings/compliance`
- `/settings/pricing`
- `/settings/notary-profile`

UI behavior:

- visible persistent compliance warnings
- red blocking banners
- Ohio title warning card
- RON checklist panel
- fee-cap explanations on every quote
- employer/internal filters and color tags

## 10. API requirements

- `POST /api/intake/create`
- `POST /api/quote/generate`
- `POST /api/appointment/book`
- `POST /api/appointment/update-status`
- `POST /api/compliance/check`
- `POST /api/journal/create`
- `POST /api/journal/export`
- `POST /api/ron/start-session`
- `POST /api/ron/complete-session`
- `POST /api/invoice/create`
- `POST /api/invoice/mark-paid`
- `POST /api/review/send`
- `GET /api/analytics/summary`
- `GET /api/export/revenue-csv`
- `GET /api/export/mileage-csv`

## 11. Automation requirements

- instant quote and checklist
- T-24 and T-2 reminders
- on-my-way SMS for mobile work
- post-completion invoice delivery
- review request 24 hours later
- nightly compliance checks
- 90/60/30 expiration alerts for commission and RON
- BCI aging alerts
- journal export checklist near end of RON authorization

## 12. Reports and exports

Support:

- monthly revenue summary
- service-line summary
- appointment log
- mileage log
- employer/internal usage report
- private-business usage report
- RON session report
- compliance incident report
- journal export
- annual bookkeeping CSV package

## 13. Security requirements

- encryption at rest for sensitive PII
- signed URLs for uploads
- immutable journal audit log
- RBAC
- session timeout
- optional MFA
- redacted ID images in standard dashboard views
- secure recording metadata
- warnings if RON signature, seal, or journal compromise is detected

## 14. Non-goals

Do not build:

- legal advice engine
- document drafting engine
- title underwriting
- attorney-client privilege workflows
- tax filing automation
- non-Ohio legal rule engine in v1

## 15. Seed data requirements

Create test data for:

- 10 private mobile appointments
- 5 employer/internal appointments
- 5 RON appointments
- 3 refused appointments
- 2 title-transfer blocked scenarios
- 2 copy-certification blocked scenarios
- 3 hospital appointments
- 3 after-hours appointments

## 16. Acceptance criteria

The system is complete when:

1. A user can create a lead, quote it, book it, complete it, journal it, and invoice it.
2. Traditional fee quotes cannot exceed `$5` per act.
3. RON fee quotes cannot exceed `$30` per act and `$10` tech fee per session.
4. Travel fees cannot be included unless disclosed and accepted.
5. RON matters cannot be completed unless authorization and session checks pass.
6. Copy certification requests are blocked.
7. Title matters trigger warning and block logic.
8. Analytics update from seeded data.
9. CSV exports work.
10. Compliance logs are readable and persistent.
