describe('Header do Sistema', () => {

  const carregarSistema = () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem(
          'oneclinic_user',
          JSON.stringify({
            nome: 'Wedley Silva',
            cargo: 'Administrador',
            role: 'admin'
          })
        );
      }
    });

    cy.visit('/app/dashboard');
  };

  beforeEach(() => {
    carregarSistema();
  });

  it('Deve exibir o header', () => {
    cy.get('[data-cy="header"]')
      .should('be.visible');
  });

  it('Deve exibir o título da página', () => {
    cy.get('[data-cy="page-title"]')
      .should('contain', 'Dashboard');
  });

  it('Deve exibir o nome do usuário', () => {
    cy.get('[data-cy="user-name"]')
      .should('contain', 'Wedley Silva');
  });

  it('Deve exibir o cargo do usuário', () => {
    cy.get('[data-cy="user-role"]')
      .should('contain', 'Administrador');
  });

  it('Deve exibir as iniciais do usuário', () => {
    cy.get('[data-cy="avatar"]')
      .should('contain', 'WS');
  });

  it('Deve exibir a data atual', () => {
    cy.get('[data-cy="current-date"]')
      .should('not.be.empty');
  });

  it('Deve exibir o horário atual', () => {
    cy.get('[data-cy="current-time"]')
      .should('not.be.empty');
  });

  it('Deve abrir o menu do usuário', () => {
    cy.get('[data-cy="user-button"]').click();

    cy.get('[data-cy="dropdown-menu"]')
      .should('be.visible');
  });

  it('Deve fechar o menu ao clicar fora', () => {
    cy.get('[data-cy="user-button"]').click();

    cy.get('[data-cy="dropdown-menu"]')
      .should('be.visible');

    cy.get('body').click(0, 0);

    cy.get('[data-cy="dropdown-menu"]')
      .should('not.exist');
  });

  it('Deve exibir botão Meu Perfil', () => {
    cy.get('[data-cy="user-button"]').click();

    cy.get('[data-cy="perfil"]')
      .should('be.visible');
  });

  it('Deve exibir botão Configurações', () => {
    cy.get('[data-cy="user-button"]').click();

    cy.get('[data-cy="configuracoes"]')
      .should('be.visible');
  });

  it('Deve realizar logout', () => {
    cy.get('[data-cy="user-button"]').click();

    cy.get('[data-cy="logout"]').click();

    cy.url().should('eq', Cypress.config().baseUrl + '/');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('oneclinic_user')).to.be.null;
    });
  });

  it('Deve ocultar informações do usuário em resolução mobile', () => {
    cy.viewport('iphone-x');

    carregarSistema();

    cy.get('[data-cy="user-name"]')
      .should('not.be.visible');
  });

  it('Deve continuar permitindo abrir o menu no mobile', () => {
    cy.viewport('iphone-x');

    carregarSistema();

    cy.get('[data-cy="user-button"]').click();

    cy.get('[data-cy="dropdown-menu"]')
      .should('be.visible');
  });

});