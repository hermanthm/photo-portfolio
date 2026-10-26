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

## End-to-end tests

Cypress covers the public pages and the admin sign-in gate. The specs are read-only: they do not create, edit, or delete portfolio data.

Run the interactive runner while the dev server is already up:

```bash
npm run cypress:open
```

Run the headless suite with:

```bash
npm run e2e
```

`npm run e2e` starts `npm run dev` when port 3000 is free. If a server is already listening there, the suite uses that server.

Admin specs sign in through `cy.login()`. That command logs in once per run and reuses the session, so the auth rate limit counts a single attempt. Repeated raw logins can hit the limit of 10 attempts per 15 minutes. Restarting the dev server clears it.

Set the admin account before running the sign-in spec. Cypress reads `CYPRESS_ADMIN_EMAIL` and `CYPRESS_ADMIN_PASSWORD`. When those are unset, it falls back to `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `.env`. You can also put `ADMIN_EMAIL` and `ADMIN_PASSWORD` in a gitignored `cypress.env.json`.

Those values must match the user stored in the database. If they do not, the sign-in spec stays on `/admin/login` and reports that the credentials were rejected. Seeding resets the admin password and replaces portfolio content, so point the variables at the existing account. Do not run `npm run db:seed` to make the spec pass.

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
