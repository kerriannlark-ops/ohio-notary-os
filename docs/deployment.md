# Deployment Notes

## Local development

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and add your local credentials.
3. Create a Postgres database and set `DATABASE_URL`.
4. Run Prisma migrations once they are added, then run `npm run db:seed`.
5. Start the app with `npm run dev`.

## Hosting target

- Frontend/app runtime: Vercel
- Database: managed Postgres on Neon, Supabase, or Railway
- File storage: S3-compatible bucket
- Transactional email: Resend
- SMS: Twilio
- Calendar sync: Google Calendar API

## Production checklist

- Turn on encrypted file storage and signed URLs.
- Protect admin routes with Clerk or Supabase Auth.
- Separate employer/internal client data from private-business exports.
- Verify journal exports and recording retention before enabling live RON work.
