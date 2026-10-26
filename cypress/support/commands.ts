const MISSING_CREDENTIALS =
  "Missing admin credentials. Set CYPRESS_ADMIN_EMAIL and CYPRESS_ADMIN_PASSWORD, or ADMIN_EMAIL and ADMIN_PASSWORD in .env.";

const REJECTED_CREDENTIALS =
  "Admin sign-in was rejected. Point CYPRESS_ADMIN_EMAIL and CYPRESS_ADMIN_PASSWORD at the user stored in the database.";

Cypress.Commands.add("login", () => {
  cy.env<{ ADMIN_EMAIL?: string; ADMIN_PASSWORD?: string }>(
    ["ADMIN_EMAIL", "ADMIN_PASSWORD"],
    { log: false },
  ).then(({ ADMIN_EMAIL: email, ADMIN_PASSWORD: password }) => {
    if (!email || !password) {
      throw new Error(MISSING_CREDENTIALS);
    }

    cy.session(
      ["admin", email],
      () => {
        cy.visit("/admin/login");
        cy.contains("label", "Email").find("input").type(email);
        cy.contains("label", "Password")
          .find("input")
          .type(password, { log: false, parseSpecialCharSequences: false });
        cy.contains("button", "Sign in").click();
        cy.location("pathname", { timeout: 15000 }).should((pathname) => {
          expect(pathname, REJECTED_CREDENTIALS).to.eq("/admin");
        });
        cy.contains("a", "Dashboard").should("be.visible");
      },
      {
        cacheAcrossSpecs: true,
        validate() {
          cy.request({ url: "/admin", failOnStatusCode: false })
            .its("status")
            .should("eq", 200);
        },
      },
    );
  });
});

declare global {
  // Cypress registers custom commands on this namespace.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      login(): Chainable<void>;
    }
  }
}

export {};
