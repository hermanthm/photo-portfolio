const pages = [
  { path: "/", heading: "Stories captured in light and motion" },
  { path: "/photography", heading: "Photography" },
  { path: "/video", heading: "Video" },
  { path: "/about", heading: "About Me" },
  { path: "/contact", heading: "Contact" },
] as const;

const navLabels = ["Photography", "Video", "About", "Contact"] as const;

describe("public pages", () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
  });

  for (const page of pages) {
    it(`renders ${page.path}`, () => {
      cy.visit(page.path);
      cy.contains("h1", page.heading).should("be.visible");
    });
  }

  it("shows the featured work section", () => {
    cy.visit("/");
    cy.contains("h2", "Featured work").should("be.visible");
  });

  it("shows the desktop nav", () => {
    cy.visit("/");

    for (const label of navLabels) {
      cy.get("header nav:visible").contains("a", label).should("be.visible");
    }
  });

  it("opens the mobile nav", () => {
    cy.viewport(390, 844);
    cy.visit("/");
    // The menu button is in the server HTML. A click before hydration is
    // discarded when React takes over, so retry until the menu stays open.
    openMobileMenu();
  });
});

function openMobileMenu(attemptsLeft = 4): void {
  cy.get("button[aria-label='Open menu']").should("be.visible").click();
  cy.wait(300);
  cy.get("body").then(($body) => {
    if ($body.find("#mobile-nav-menu").length === 0) {
      if (attemptsLeft <= 1) {
        throw new Error("Mobile menu did not open.");
      }

      openMobileMenu(attemptsLeft - 1);
      return;
    }

    for (const label of navLabels) {
      cy.get("#mobile-nav-menu").contains("a", label).should("be.visible");
    }
  });
}
