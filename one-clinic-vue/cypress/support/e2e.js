import "./commands";

Cypress.on("uncaught:exception", (erro) => {
  if (/ResizeObserver loop/.test(erro.message)) {
    return false;
  }
  return true;
});

beforeEach(() => {
  cy.viewport(1366, 768);
});