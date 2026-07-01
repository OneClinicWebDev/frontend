describe('Sistema', () => {

  beforeEach(() => {
    cy.visit('/');
  });

  it('Home', () => {
    cy.url().should('include', '/');
  });

  it('Dashboard', () => {
    cy.visit('/app/dashboard');
    cy.contains('Dashboard');
  });

  it('Agenda', () => {
    cy.visit('/app/agenda');
    cy.contains('Agenda');
  });

  it('Atendimentos', () => {
    cy.visit('/app/atendimentos');
    cy.contains('Atendimentos');
  });

  it('Clientes', () => {
    cy.visit('/app/clientes');
    cy.contains('Clientes');
  });

  it('Estoque', () => {
    cy.visit('/app/estoque');
    cy.contains('Estoque');
  });

  it('Financeiro', () => {
    cy.visit('/app/financeiro');
    cy.contains('Financeiro');
  });

  it('Colaboradores', () => {
    cy.visit('/app/colaboradores');
    cy.contains('Colaboradores');
  });

});