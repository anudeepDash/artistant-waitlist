This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Security

**Data access model.** The browser never talks to Supabase directly. All reads/writes go through
server actions (`src/lib/*-actions.ts`) that verify the caller's Firebase ID token and use the
service-role key. Admin actions additionally require a *verified* email that is the super-admin,
the developer account or listed in `admin_users`.

**Database lock-down.** After deploying the app, run `supabase_migration_security_hardening.sql`
in the Supabase SQL editor. It enables RLS on every app table, drops the old permissive policies
and revokes all anon/authenticated access (the anon key ships in client JS). Each verification
query at the bottom of that file should return zero rows. Older `supabase_migration_*.sql` files
grant public access — if you ever re-run one, re-run the hardening script afterwards.

**Rotate leaked secrets.** Values previously committed to git (`EMAIL_PASS`, the Supabase keys
and the `ARTISTANT_ADMIN_2026` passcode used by the `admin_*` RPCs) remain in git history.
Rotate them; the hardening migration also makes those RPCs callable by the service role only.

**Rate limiting.** Abuse-prone public actions (password reset, booking requests, careers,
feedback, inquiries) are rate limited per IP in `src/lib/rate-limit.ts`. This is per server
instance; for a global limit add Vercel Firewall rules or an Upstash/Redis-backed limiter.
