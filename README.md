# Herman Tong — Photography & Film

Photography and film portfolio with a private admin CMS. The app is Next.js 16 (App Router) with Prisma, PostgreSQL, Cloudinary, and next-auth. Routes live in `src/app/`. Only npm is set up (`package-lock.json`); yarn, pnpm, and bun are not.

Public pages:

- `/` — hero (“Photography & Film”), site bio from settings, featured collections
- `/photography`, `/video` — published collections by type, grouped with work categories
- `/work/[slug]` — collection gallery (mosaic or slideshow), photo protection, YouTube/Vimeo embeds
- `/about`, `/contact` — copy and social links from site settings

Admin (credentials via next-auth): dashboard, collections (photos, videos, covers), categories, site settings (title, bio, about, contact, Instagram/Vimeo/YouTube, OG image), and password change. Sign in at `/admin/login`. Other `/admin` URLs return 404 until you are signed in. Five clicks on the site title within two seconds open `/admin/login`.

Data (Prisma + PostgreSQL): `User`, login attempts, `WorkCategory`, `Collection`, `Photo`, `Video`, `SiteSettings`. Photos upload to Cloudinary. Schema is `prisma/schema.prisma`; seed is `prisma/seed.ts`; shared helpers are in `src/lib/`. `src/lib/pg-pool.ts` special-cases `supabase.com` hosts for TLS.

Stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Prisma 7 (`@prisma/adapter-pg`), next-auth 5 beta, Cloudinary, Zod, bcryptjs.

## Prerequisites

Node compatible with Next.js 16 (no version is pinned), npm, and PostgreSQL. There is no `.env` in the tree. `.gitignore` ignores `.env*` and `.env.example`, so the variables below are the list.

## Environment

| Variable | Role |
| --- | --- |
| `DATABASE_URL` | Required. App pool (`src/lib/pg-pool.ts`). Migrations and seed fall back to this. |
| `MIGRATE_DATABASE_URL` | Optional. Session-pooler URL for Prisma migrations and seed. A transaction pooler cannot take advisory locks (`prisma.config.ts`). |
| `ADMIN_EMAIL` | Seed, and the Cypress fallback when `CYPRESS_ADMIN_EMAIL` is unset. Default `admin@portfolio.local`. |
| `ADMIN_PASSWORD` | Seed, and the Cypress fallback when `CYPRESS_ADMIN_PASSWORD` is unset. Dev default `changeme123`, with a console warning. Production seed throws if unset. If set, must be at least 12 characters. |
| `CYPRESS_ADMIN_EMAIL` | Optional. Admin email for the sign-in spec. Falls back to `ADMIN_EMAIL`. |
| `CYPRESS_ADMIN_PASSWORD` | Optional. Admin password for the sign-in spec. Falls back to `ADMIN_PASSWORD`. |
| `CLOUDINARY_CLOUD_NAME` | Required to upload photos. Public pages still render URL-based images without it. |
| `CLOUDINARY_API_KEY` | Required to upload photos. |
| `CLOUDINARY_API_SECRET` | Required to upload photos. |
| `AUTH_SECRET` | Auth.js secret. Not referenced in this repo; next-auth expects it. |
| `AUTH_URL` | Auth.js URL outside local development. Not referenced in this repo; next-auth expects it. |

## Setup

1. PostgreSQL available, and a `.env` with the variables above.
2. `npm install` (runs `postinstall`: `prisma generate`).
3. `npm run db:migrate` (`prisma migrate dev`) to apply `prisma/migrations/`.
4. `npm run db:seed` (`tsx prisma/seed.ts`) — admin user, site settings titled “Herman Tong — Photography & Film”, sample categories, and two published collections (remote placeholder images and sample video embeds). Prints `Admin login: <email> / <password>`.
5. `npm run dev` (`next dev`). Open http://localhost:3000. Admin: http://localhost:3000/admin/login.

Dev seed login: `admin@portfolio.local` / `changeme123`. Seeded images are remote URLs and do not need Cloudinary. Photo upload fails until the three Cloudinary variables are set.

## Scripts

- `npm run db:generate` — `prisma generate`
- `npm run db:migrate` — `prisma migrate dev`
- `npm run db:deploy` — `prisma migrate deploy`
- `npm run db:seed` — seed
- `npm run db:studio` — Prisma Studio
- `npm run lint` — ESLint
- `npm run cypress:open` — interactive Cypress runner (dev server already running)
- `npm run cypress:run` — headless Cypress
- `npm run e2e` — headless suite; starts `npm run dev` when port 3000 is free, otherwise uses the server already there
- `npm run build` — `prisma generate && prisma migrate deploy && next build` (needs a reachable database)
- `npm run start` — `next start`

## End-to-end tests

Cypress covers the public pages and the admin sign-in gate. The specs are read-only: they do not create, edit, or delete portfolio data.

```bash
npm run cypress:open   # dev server already up
npm run e2e            # headless; starts the dev server if port 3000 is free
```

Admin specs sign in through `cy.login()`. That command logs in once per run and reuses the session, so the auth rate limit counts a single attempt. Repeated raw logins can hit the limit of 10 attempts per 15 minutes, which is stored in the database and is not cleared by restarting the dev server.

Set the admin account before running the sign-in spec. Cypress reads `CYPRESS_ADMIN_EMAIL` and `CYPRESS_ADMIN_PASSWORD`. When those are unset, it falls back to `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`. You can also put `ADMIN_EMAIL` and `ADMIN_PASSWORD` in a gitignored `cypress.env.json`.

Those values must match the user stored in the database. If they do not, the sign-in spec stays on `/admin/login` and reports that the credentials were rejected. Seeding resets the admin password and replaces portfolio content, so point the variables at the existing account. Do not run `npm run db:seed` to make the spec pass.

## Production

`npm run build` runs `prisma migrate deploy`, so production needs a reachable database. It also needs Auth.js secrets (`AUTH_SECRET`, and `AUTH_URL` outside local dev), Cloudinary, and a seeded admin (or an equivalent user). Set `MIGRATE_DATABASE_URL` when `DATABASE_URL` is a transaction pooler. Production seed requires `ADMIN_PASSWORD` of at least 12 characters. The build applies migrations.
