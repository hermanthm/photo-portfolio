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
| `ADMIN_EMAIL` | Seed only. Default `admin@portfolio.local`. |
| `ADMIN_PASSWORD` | Seed only. Dev default `changeme123`, with a console warning. Production seed throws if unset. If set, must be at least 12 characters. |
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
- `npm run build` — `prisma generate && prisma migrate deploy && next build` (needs a reachable database)
- `npm run start` — `next start`

There is no test script.

## Production

`npm run build` runs `prisma migrate deploy`, so production needs a reachable database. It also needs Auth.js secrets (`AUTH_SECRET`, and `AUTH_URL` outside local dev), Cloudinary, and a seeded admin (or an equivalent user). Set `MIGRATE_DATABASE_URL` when `DATABASE_URL` is a transaction pooler. Production seed requires `ADMIN_PASSWORD` of at least 12 characters. The build applies migrations.
