# API Surface

## Core intake + booking

- `POST /api/intake/create`
- `POST /api/quote/generate`
- `POST /api/appointment/book`
- `POST /api/appointment/update-status`
- `POST /api/compliance/check`

## Journal + RON

- `POST /api/journal/create`
- `POST /api/journal/export`
- `POST /api/ron/start-session`
- `POST /api/ron/complete-session`

## Billing + follow-up

- `POST /api/invoice/create`
- `POST /api/invoice/mark-paid`
- `POST /api/review/send`

## Reporting

- `GET /api/analytics/summary`
- `GET /api/export/revenue-csv`
- `GET /api/export/mileage-csv`

## Public booking + portal

- `POST /api/public/quote`
- `POST /api/public/book`
- `POST /api/public/create-account`
- `POST /api/public/upload-document`
- `POST /api/public/accept-disclosures`
- `POST /api/public/request-reschedule`
- `POST /api/public/request-cancel`
- `GET /api/portal/dashboard`
- `GET /api/portal/appointments`
- `GET /api/portal/invoices`
- `GET /api/portal/messages`
- `POST /api/portal/pay`
- `POST /api/portal/message`

These routes are currently mock-data-backed so the UI and server surface stay in sync before live Prisma wiring is added.
