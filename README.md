# Ohio Notary OS

Ohio Notary OS is a starter operating system for a Columbus, Ohio mobile and remote online notary business. The repo now includes a dashboard-first launch app, admin workflow pages, public booking pages, a client portal shell, Ohio-specific pricing and compliance logic, Prisma and SQL schemas, seeded mock data, test scaffolding, and prompt/SOP content for future automation.

The repo also includes a no-Xcode macOS Study Hub under `macos-app/` for private course prep, roadmap tracking, and Mac-side launch planning, now opened through a native WebKit Mac window instead of Chrome.

## Current scope

- `app/` contains the admin-facing page shell for dashboard, bookings, journal, RON, invoices, clients, analytics, and settings.
- `lib/` holds the Ohio rules, pricing, travel, compliance, notification, formatting, and mock data helpers.
- `prisma/` contains the Prisma schema and TypeScript seed script.
- `db/` contains the SQL reference schema and lightweight seed data.
- `api/` contains framework-agnostic TypeScript functions that mirror booking, quoting, completion, invoicing, and review flows.
- `docs/` contains operating procedures, deployment notes, the fuller product spec, and a current-status map.
- `prompts/` contains agent-ready markdown prompts for intake, compliance, and follow-up automation.

## Suggested next build step

1. Replace mock-backed routes and pages with Prisma data access.
2. Add real auth, storage, calendar sync, SMS/email, and payment providers in place of the mocks.
3. Add Prisma migrations plus live seed execution for the current schema.
4. Implement PDF invoices and richer automation scheduling.

## GitHub upload notes

- GitHub is the source-control home for the project.
- The Mac app still runs locally on macOS.
- Private licensed course content can be kept local-only or stored in the private repo.
- Build artifacts should stay out of git.

See:

- `docs/GITHUB-UPLOAD-GUIDE.md`
- `macos-app/README.md`
