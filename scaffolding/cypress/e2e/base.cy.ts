import { AdminLicensePage } from "../page-object/adminLicensePage";
import { createSite, deleteSite } from "@jahia/cypress";

describe("Base tests", () => {
  before("Before base", () => {
    cy.log("Preload start page, ignoring errors for first load");
    cy.visit("/", { failOnStatusCode: false, timeout: 120000 });
  });

  it("should not login", () => {
    cy.logout();
    cy.visit("/jahia", { failOnStatusCode: false, timeout: 120000 });
    cy.get("input[name=username]").type("root");
    cy.get("input[name=password]").type("xxxx");
    cy.get("button[type=submit]").click();
    cy.contains("Invalid username/password");
  });
});
