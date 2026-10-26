describe("admin auth", () => {
  it("returns 404 for /admin when signed out", () => {
    cy.request({ url: "/admin", failOnStatusCode: false })
      .its("status")
      .should("eq", 404);
  });

  it("shows the sign-in page", () => {
    cy.visit("/admin/login");
    cy.contains("h1", "Sign in").should("be.visible");
  });

  it("signs in and shows the dashboard", () => {
    cy.login();
    cy.visit("/admin");
    cy.location("pathname").should("eq", "/admin");
    cy.get("header").contains("a", "Dashboard").should("be.visible");
  });
});
