import "dotenv/config";

import { defineConfig } from "cypress";

// Admin specs read CYPRESS_ADMIN_EMAIL and CYPRESS_ADMIN_PASSWORD.
// When those are unset, fall back to ADMIN_EMAIL and ADMIN_PASSWORD from .env.
// Keep real values in the shell, .env, or a gitignored cypress.env.json.

export default defineConfig({
  allowCypressEnv: false,
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    video: false,
    screenshotOnRunFailure: true,
    pageLoadTimeout: 120000,
  },
  env: {
    ADMIN_EMAIL: process.env.CYPRESS_ADMIN_EMAIL ?? process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD:
      process.env.CYPRESS_ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD,
  },
});
