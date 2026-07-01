describe('Sidebar - Navegação e Comportamento', () => {

  const acessarSistema = (role = 'admin') => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'oneclinic_user',
          JSON.stringify({
            role
          })
        );
      }
    });

    cy.visit('/app/dashboard');
  };

  beforeEach(() => {
    acessarSistema();
  });

  it('Deve exibir a sidebar', () => {
    cy.get('[data-cy="sidebar"]')
      .should('exist')
      .and('be.visible');
  });

  it('Deve iniciar recolhida', () => {
    cy.get('[data-cy="sidebar"]')
      .should('have.class', 'collapsed');
  });

  it('Deve expandir ao clicar no cabeçalho', () => {
    cy.get('[data-cy="sidebar-header"]').click();

    cy.get('[data-cy="sidebar"]')
      .should('not.have.class', 'collapsed');
  });

  it('Deve recolher novamente ao clicar no cabeçalho', () => {
    cy.get('[data-cy="sidebar-header"]').click();
    cy.get('[data-cy="sidebar-header"]').click();

    cy.get('[data-cy="sidebar"]')
      .should('have.class', 'collapsed');
  });

  it('Deve navegar para Dashboard', () => {
    cy.get('[data-cy="menu-dashboard"]').click();
    cy.url().should('include', '/app/dashboard');
  });

  it('Deve navegar para Agenda', () => {
    cy.get('[data-cy="menu-agenda"]').click();
    cy.url().should('include', '/app/agenda');
  });

  it('Deve navegar para Clientes', () => {
    cy.get('[data-cy="menu-clientes"]').click();
    cy.url().should('include', '/app/clientes');
  });

  it('Deve navegar para Atendimentos', () => {
    cy.get('[data-cy="menu-atendimentos"]').click();
    cy.url().should('include', '/app/atendimentos');
  });

  it('Deve navegar para Estoque', () => {
    cy.get('[data-cy="menu-estoque"]').click();
    cy.url().should('include', '/app/estoque');
  });

  it('Deve navegar para Financeiro', () => {
    cy.get('[data-cy="menu-financeiro"]').click();
    cy.url().should('include', '/app/financeiro');
  });

  it('Deve navegar para Colaboradores', () => {
    cy.get('[data-cy="menu-colaboradores"]').click();
    cy.url().should('include', '/app/colaboradores');
  });

  it('Administrador deve visualizar Financeiro', () => {
    cy.get('[data-cy="menu-financeiro"]').should('exist');
  });

  it('Administrador deve visualizar Colaboradores', () => {
    cy.get('[data-cy="menu-colaboradores"]').should('exist');
  });

  it('Usuário comum não deve visualizar Financeiro', () => {
    acessarSistema('user');

    cy.get('[data-cy="menu-financeiro"]').should('not.exist');
  });

  it('Usuário comum não deve visualizar Colaboradores', () => {
    acessarSistema('user');

    cy.get('[data-cy="menu-colaboradores"]').should('not.exist');
  });

  it('Deve exibir botão mobile em resolução pequena', () => {
    cy.viewport('iphone-x');

    acessarSistema();

    cy.get('[data-cy="mobile-toggle"]')
      .should('be.visible');
  });

  it('Deve abrir a sidebar no mobile', () => {
    cy.viewport('iphone-x');

    acessarSistema();

    cy.get('[data-cy="mobile-toggle"]').click();

    cy.get('[data-cy="sidebar"]')
      .should('be.visible')
      .and('not.have.class', 'collapsed');
  });

  it('Deve fechar a sidebar ao clicar no overlay', () => {
    cy.viewport('iphone-x');

    acessarSistema();

    cy.get('[data-cy="mobile-toggle"]').click();

    cy.get('[data-cy="sidebar-overlay"]').click({ force: true });

    cy.get('[data-cy="sidebar"]')
      .should('have.class', 'collapsed');
  });

});