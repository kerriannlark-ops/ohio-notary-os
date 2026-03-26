# Codex Paste Spec

Build a production-ready web application called “Ohio Notary OS” for a solo Ohio notary in Columbus who wants to manage employer/internal notarizations, public mobile notary work, and remote online notarization (RON) work.

Tech stack:

- Next.js 14
- TypeScript
- Prisma
- PostgreSQL
- Tailwind
- Clerk or Supabase Auth
- Resend for email
- Twilio for SMS
- Google Calendar integration
- S3-compatible file storage

Primary goals:

- lead intake
- compliant quoting
- appointment booking
- compliance screening
- Ohio notary journal
- RON session tracking
- invoicing
- mileage and revenue analytics
- employer vs private workflow separation

Ohio rules to enforce:

- traditional and in-person electronic notarizations: max fee `$5` per act
- travel fee allowed only if disclosed and agreed before the act
- remote online notarization: max fee `$30` per act
- remote online tech fee: max `$10` per session
- no RON booking or completion unless the notary profile shows active Ohio RON authorization
- no completion if signer did not properly appear
- for RON require live audio-video, credential analysis, identity proofing, electronic journal entry, and recording reference
- block copy certification as a service
- block incomplete-document completion
- add high-severity warning flow for Ohio vehicle title work
- maintain a tamper-evident journal model for RON entries
- support expiration reminders for commission and RON authorization

Data models required:

- User
- NotaryProfile
- Client
- Appointment
- Signer
- NotarialAct
- Quote
- Invoice
- JournalEntry
- RONSession
- ComplianceFlag
- ReviewRequest
- MileageLog
- AuditLog

Must-have pages:

- dashboard
- new booking
- appointment details
- quotes
- calendar
- journal
- RON queue
- invoices
- clients
- analytics
- settings
- compliance settings
- pricing settings
- notary profile settings

Must-have workflows:

1. Create lead
2. Generate compliant quote
3. Book appointment
4. Send reminders
5. Complete appointment
6. Create journal entry
7. Generate invoice
8. Send review request
9. Show analytics

Business logic:

- If service mode is `in_person` or `electronic_in_person`, fee cap is `$5 x actCount`
- If service mode is `ron`, fee cap is `$30 x actCount` and `techFee <= 10`
- If `travelFeeDisclosed` is false, set travel fee to `0` and warn
- If `serviceType == copy_certification`, block
- If `isRON` and `ronAuthorized == false`, block
- If `documentIncomplete == true`, block
- If title-related and blank title fields are flagged, block
- Appointment cannot move to completed unless required compliance checks pass

UI requirements:

- show compliance warnings as visible banners
- show title-transfer warning cards
- show RON checklist panel
- separate employer/internal matters from private-business matters with filters and tags
- provide kanban, calendar, and table views

Exports:

- CSV revenue export
- CSV mileage export
- CSV journal export
- PDF invoices

Analytics:

- leads
- bookings
- completed appointments
- cancelled/no-show/refused
- revenue by service line
- travel fee revenue
- RON revenue
- employer vs private volume
- average revenue per appointment
- revenue per mile
- top zip codes
- review conversion

Provide:

- complete Prisma schema
- seed file
- server actions or API routes
- UI pages
- reusable components
- validation logic
- pricing engine
- compliance engine
- deployment instructions
- `.env.example`
- sample test data

Also include:

- unit tests for pricing and compliance logic
- clear comments in code
- mock integrations for Twilio, Resend, and Google Calendar
- dummy data for at least 25 appointments across service types
