import {
  gerarCpf,
  gerarCnpj,
  gerarTelefone,
  formatarCpf,
  dataParaInput,
  isoFuturo,
  sufixo,
} from "../support/commands";

describe("Integração - cadastro, login, logout e proteção de rotas", () => {
  it("cadastra uma clínica pela interface e entra no dashboard", () => {
    const id = sufixo();
    const cpf = gerarCpf();
    const fantasia = `Clinica UI ${id}`;

    cy.abrirLogin();
    cy.get("#login-cpf").type(cpf);
    cy.get("#login-password").type(Cypress.env("senhaPadrao"), { log: false });
    cy.contains("button", "Criar uma clínica").click();

    cy.get("#cadastro-nome").type(`Dona da Clinica ${id}`);
    cy.get("#cadastro-nascimento").type("1988-06-20");
    cy.get("#cadastro-cnpj").type(gerarCnpj());
    cy.get("#cadastro-razao").type(`Razao UI ${id} LTDA`);
    cy.get("#cadastro-fantasia").type(fantasia);
    cy.get("#cadastro-telefone").type(gerarTelefone());
    cy.get(".autonomy-option input[type=checkbox]").check({ force: true });
    cy.contains("button", "Criar clínica e continuar").click();

    cy.location("pathname", { timeout: 30000 }).should("eq", "/app/dashboard");
    cy.get('[data-cy="user-name"]').should("contain", fantasia);
    cy.get('[data-cy="user-role"]').should("be.visible");
    cy.window().its("localStorage.access_token").should("be.a", "string");
    cy.window().its("localStorage.clinica_ativa_id").should("be.a", "string");
    cy.contains("Em desenvolvimento").should("be.visible");
  });

  it("valida os campos do cadastro antes de enviar", () => {
    cy.abrirLogin();
    cy.get("#login-cpf").type("11111111111");
    cy.get("#login-password").type("qualquer");
    cy.contains("button", "Criar uma clínica").click();
    cy.contains("button", "Criar clínica e continuar").click();
    cy.get('[role="alert"]').should("be.visible");
    cy.location("pathname").should("eq", "/");
  });

  it("faz login com CPF formatado e mostra mensagens para erros", () => {
    cy.novoContexto().then((ctx) => {
      cy.abrirLogin();
      cy.get("#login-cpf").type("123");
      cy.get("#login-password").type("abc");
      cy.contains("button", "Entrar na plataforma").click();
      cy.get('[role="alert"]').should("contain", "CPF válido");

      cy.get("#login-cpf").clear().type(formatarCpf(ctx.admin.cpf));
      cy.get("#login-password").clear();
      cy.contains("button", "Entrar na plataforma").click();
      cy.get('[role="alert"]').should("contain", "senha");

      cy.get("#login-password").type("SenhaErrada@123");
      cy.contains("button", "Entrar na plataforma").click();
      cy.get('[role="alert"]').should("be.visible");
      cy.location("pathname").should("eq", "/");

      cy.get("#login-password").clear().type(ctx.admin.senha, { log: false });
      cy.contains("button", "Entrar na plataforma").click();
      cy.location("pathname", { timeout: 20000 }).should("eq", "/app/dashboard");
      cy.get('[data-cy="user-name"]').should("contain", ctx.clinica.nome_fantasia);
    });
  });

  it("alterna a visibilidade da senha", () => {
    cy.abrirLogin();
    cy.get("#login-password").should("have.attr", "type", "password");
    cy.get('button[aria-label="Mostrar senha"]').click();
    cy.get("#login-password").should("have.attr", "type", "text");
    cy.get('button[aria-label="Ocultar senha"]').click();
    cy.get("#login-password").should("have.attr", "type", "password");
  });

  it("redireciona rotas privadas para a Home sem sessão", () => {
    [
      "/app/dashboard",
      "/app/agenda",
      "/app/atendimentos",
      "/app/clientes",
      "/app/colaboradores",
      "/app/pacotes-procedimentos",
      "/app/configuracoes-clinica",
      "/app/meu-perfil",
      "/app/financeiro",
      "/app/estoque",
    ].forEach((rota) => {
      cy.visit(rota);
      cy.location("pathname").should("eq", "/");
    });
  });

  it("redireciona rotas inexistentes para a Home", () => {
    cy.visit("/rota-que-nao-existe");
    cy.location("pathname").should("eq", "/");
  });

  it("descarta tokens inválidos salvos no navegador", () => {
    cy.visit("/app/dashboard", {
      onBeforeLoad(win) {
        win.localStorage.setItem("access_token", "token.invalido.xyz");
        win.localStorage.setItem("refresh_token", "refresh.invalido.xyz");
        win.localStorage.setItem("clinica_ativa_id", "00000000-0000-0000-0000-000000000000");
      },
    });
    cy.location("pathname", { timeout: 20000 }).should("eq", "/");
  });

  it("encerra a sessão, limpa o armazenamento e bloqueia o refresh revogado", () => {
    cy.novoContexto().then((ctx) => {
      cy.loginUi(ctx.admin.cpf, ctx.admin.senha);
      cy.window().then((win) => {
        const refresh = win.localStorage.getItem("refresh_token");
        cy.wrap(refresh).as("refreshAntigo");
      });
      cy.abrirMenuUsuario();
      cy.get('[data-cy="menu-logout"]').click();
      cy.location("pathname", { timeout: 20000 }).should("eq", "/");
      cy.window().its("localStorage.access_token").should("not.exist");
      cy.window().its("localStorage.refresh_token").should("not.exist");
      cy.window().its("localStorage.clinica_ativa_id").should("not.exist");
      cy.get("@refreshAntigo").then((refresh) => {
        cy.apiReq("POST", "/api/token/refresh/", { body: { refresh } }).then((r) =>
          expect(r.status).to.eq(401)
        );
      });
      cy.visit("/app/dashboard");
      cy.location("pathname").should("eq", "/");
    });
  });

  it("troca de conta voltando para a Home sem sessão", () => {
    cy.novoContexto().then((ctx) => {
      cy.loginUi(ctx.admin.cpf, ctx.admin.senha);
      cy.abrirMenuUsuario();
      cy.get('[data-cy="menu-switch-account"]').click();
      cy.location("pathname", { timeout: 20000 }).should("eq", "/");
      cy.window().its("localStorage.access_token").should("not.exist");
    });
    cy.novoContexto().then((outro) => {
      cy.loginUi(outro.admin.cpf, outro.admin.senha);
      cy.get('[data-cy="user-name"]').should("contain", outro.clinica.nome_fantasia);
    });
  });

  it("mantém a sessão após recarregar a página", () => {
    cy.novoContexto().then((ctx) => {
      cy.loginUi(ctx.admin.cpf, ctx.admin.senha);
      cy.reload();
      cy.location("pathname").should("eq", "/app/dashboard");
      cy.get('[data-cy="user-name"]').should("contain", ctx.clinica.nome_fantasia);
    });
  });
});

describe("Integração - usuário com mais de uma clínica", () => {
  it("escolhe a clínica no login e troca pelo menu do usuário", () => {
    cy.novoContexto().then((a) => {
      cy.adicionarColaborador(a, "SECRETARIO").then((sec) => {
        cy.abrirLogin();
        cy.get("#login-cpf").type(sec.cpf);
        cy.get("#login-password").type(sec.senha, { log: false });
        cy.contains("button", "Entrar na plataforma").click();

        cy.contains("h2", "Escolha sua clínica").should("be.visible");
        cy.get(".clinic-option").should("have.length", 2);
        cy.contains("button", "Continuar").should("be.disabled");
        cy.contains(".clinic-option", a.clinica.nome_fantasia).click();
        cy.contains("button", "Continuar").click();

        cy.location("pathname", { timeout: 20000 }).should("eq", "/app/dashboard");
        cy.get('[data-cy="user-name"]').should("contain", a.clinica.nome_fantasia);
        cy.window().its("localStorage.clinica_ativa_id").should("eq", a.clinicaId);

        cy.abrirMenuUsuario();
        cy.contains(".clinic-switcher .clinic-option", "Administrador").click();
        cy.location("pathname").should("eq", "/app/dashboard");
        cy.window()
          .its("localStorage.clinica_ativa_id")
          .should("eq", sec.clinicaPropriaId);
        cy.get('[data-cy="user-role"]').should("be.visible");
      });
    });
  });
});

describe("Integração - permissões de rota por papel", () => {
  let a;
  let secretario;
  let profissional;

  before(() => {
    cy.novoContexto().then((c) => {
      a = c;
    });
    cy.then(() => cy.adicionarColaborador(a, "SECRETARIO")).then((s) => {
      secretario = s;
    });
    cy.then(() => cy.adicionarColaborador(a, "PROFISSIONAL")).then((p) => {
      profissional = p;
    });
  });

  const sessao = (pessoa) => ({
    access: pessoa.access,
    refresh: pessoa.refresh,
    clinicaId: a.clinicaId,
  });

  it("administrador acessa todas as áreas", () => {
    const rotas = [
      "/app/dashboard",
      "/app/agenda",
      "/app/atendimentos",
      "/app/clientes",
      "/app/colaboradores",
      "/app/pacotes-procedimentos",
      "/app/configuracoes-clinica",
      "/app/meu-perfil",
      "/app/financeiro",
      "/app/estoque",
    ];
    cy.visitarLogado("/app/dashboard", {
      access: a.admin.access,
      refresh: a.admin.refresh,
      clinicaId: a.clinicaId,
    });
    rotas.forEach((rota) => {
      cy.visit(rota, {
        onBeforeLoad(win) {
          win.localStorage.setItem("access_token", a.admin.access);
          win.localStorage.setItem("refresh_token", a.admin.refresh);
          win.localStorage.setItem("clinica_ativa_id", a.clinicaId);
        },
      });
      cy.location("pathname", { timeout: 15000 }).should("eq", rota);
    });
  });

  it("secretário não acessa financeiro nem configurações da clínica", () => {
    cy.visitarLogado("/app/financeiro", sessao(secretario));
    cy.location("pathname", { timeout: 15000 }).should("eq", "/app/dashboard");
    cy.visitarLogado("/app/configuracoes-clinica", sessao(secretario));
    cy.location("pathname", { timeout: 15000 }).should("eq", "/app/dashboard");
    cy.visitarLogado("/app/clientes", sessao(secretario));
    cy.location("pathname", { timeout: 15000 }).should("eq", "/app/clientes");
    cy.visitarLogado("/app/colaboradores", sessao(secretario));
    cy.location("pathname", { timeout: 15000 }).should("eq", "/app/colaboradores");
  });

  it("profissional só acessa dashboard, agenda, atendimentos e perfil", () => {
    ["/app/clientes", "/app/colaboradores", "/app/pacotes-procedimentos", "/app/financeiro", "/app/estoque", "/app/configuracoes-clinica"].forEach(
      (rota) => {
        cy.visitarLogado(rota, sessao(profissional));
        cy.location("pathname", { timeout: 15000 }).should("eq", "/app/dashboard");
      }
    );
    ["/app/agenda", "/app/atendimentos", "/app/meu-perfil"].forEach((rota) => {
      cy.visitarLogado(rota, sessao(profissional));
      cy.location("pathname", { timeout: 15000 }).should("eq", rota);
    });
  });

  it("menu lateral navega entre as telas permitidas", () => {
    cy.visitarLogado("/app/dashboard", sessao(secretario));
    cy.get('[data-cy="menu-agenda"]').click();
    cy.location("pathname").should("eq", "/app/agenda");
    cy.get('[data-cy="menu-clientes"]').click();
    cy.location("pathname").should("eq", "/app/clientes");
    cy.get('[data-cy="menu-colaboradores"]').click();
    cy.location("pathname").should("eq", "/app/colaboradores");
    cy.get('[data-cy="menu-pacotes-procedimentos"]').click();
    cy.location("pathname").should("eq", "/app/pacotes-procedimentos");
    cy.get('[data-cy="menu-dashboard"]').click();
    cy.location("pathname").should("eq", "/app/dashboard");
  });
});

describe("Integração - perfil e configurações da clínica", () => {
  let ctx;

  before(() => {
    cy.novoContexto().then((c) => {
      ctx = c;
    });
  });

  const sessao = () => ({
    access: ctx.admin.access,
    refresh: ctx.admin.refresh,
    clinicaId: ctx.clinicaId,
  });

  it("carrega e atualiza os dados pessoais", () => {
    cy.visitarLogado("/app/meu-perfil", sessao());
    cy.get("#nome_completo").should("have.value", ctx.clinica.nome_completo);
    cy.get("#cpf").should("be.disabled");
    cy.get("#nome_completo").clear().type("Nome Alterado Pela Interface");
    cy.get("#telefone").clear().type("11988776655");
    cy.contains("button", "Salvar alterações").click();
    cy.get(".toast-notification.success").should("contain", "Dados atualizados com sucesso.");
    cy.apiReq("GET", "/api/auth/perfil/", { token: ctx.admin.access }).then((r) => {
      expect(r.body.nome_completo).to.eq("Nome Alterado Pela Interface");
    });
  });

  it("mostra erro ao salvar nome inválido", () => {
    cy.visitarLogado("/app/meu-perfil", sessao());
    cy.get("#nome_completo").should("not.have.value", "");
    cy.get("#nome_completo").clear().type("Ab");
    cy.contains("button", "Salvar alterações").click();
    cy.contains(".error-message", "pelo menos 3 caracteres").should("be.visible");
    cy.get(".toast-notification.error").should("be.visible");
  });

  it("valida a troca de senha e altera quando os dados estão corretos", () => {
    cy.visitarLogado("/app/meu-perfil", sessao());
    cy.get("#senha_atual").type("SenhaErrada@123", { log: false });
    cy.get("#nova_senha").type("NovaSenha@2026y", { log: false });
    cy.get("#confirmar_senha").type("Diferente@2026y", { log: false });
    cy.contains("button", "Alterar senha").click();
    cy.get(".toast-notification.error").should("be.visible");

    cy.get("#senha_atual").clear().type(ctx.admin.senha, { log: false });
    cy.get("#nova_senha").clear().type("NovaSenha@2026y", { log: false });
    cy.get("#confirmar_senha").clear().type("NovaSenha@2026y", { log: false });
    cy.contains("button", "Alterar senha").click();
    cy.get(".toast-notification.success").should("contain", "Senha alterada com sucesso.");
    cy.apiReq("POST", "/api/auth/login/", {
      body: { cpf: ctx.admin.cpf, password: "NovaSenha@2026y" },
    }).then((r) => expect(r.status).to.eq(200));
  });

  it("carrega e salva as configurações da clínica", () => {
    cy.visitarLogado("/app/configuracoes-clinica", sessao());
    cy.get("#nome_fantasia").should("have.value", ctx.clinica.nome_fantasia);
    cy.get("#razao_social").should("have.value", ctx.clinica.razao_social);
    cy.get("#nome_fantasia").clear().type("Fantasia Alterada UI");
    cy.get("#endereco").clear().type("Av. Paulista, 1000 - Bela Vista - Sao Paulo/SP");
    cy.contains("button", "Salvar configurações").click();
    cy.get(".toast-notification.success").should("be.visible");
    cy.apiReq("GET", "/api/clinica/atual/", {
      token: ctx.admin.access,
      clinicaId: ctx.clinicaId,
    }).then((r) => {
      expect(r.body.nome_fantasia).to.eq("Fantasia Alterada UI");
      expect(r.body.endereco).to.contain("Paulista");
    });
  });

  it("valida CNPJ inválido nas configurações", () => {
    cy.visitarLogado("/app/configuracoes-clinica", sessao());
    cy.get("#cnpj").should("not.have.value", "");
    cy.get("#razao_social").should("not.have.value", "");
    cy.get("#cnpj").clear().type("11111111111111");
    cy.contains("button", "Salvar configurações").click();
    cy.contains(".error-message", "CNPJ válido").should("be.visible");
    cy.get(".toast-notification.error").should("be.visible");
  });

  it("alterna a autonomia de agenda e reflete no backend", () => {
    cy.visitarLogado("/app/configuracoes-clinica", sessao());
    cy.get("#autonomia_agenda").should("exist");
    cy.get("#autonomia_agenda").then(($campo) => {
      const marcado = $campo.is(":checked");
      cy.get("#autonomia_agenda").click({ force: true });
      cy.contains("button", "Salvar configurações").click();
      cy.get(".toast-notification").should("be.visible");
      cy.apiReq("GET", "/api/clinica/atual/", {
        token: ctx.admin.access,
        clinicaId: ctx.clinicaId,
      }).then((r) => {
        expect(r.body.profissionais_podem_editar_agenda).to.eq(!marcado);
      });
    });
  });
});

describe("Integração - procedimentos, pacotes, clientes e colaboradores", () => {
  let ctx;

  before(() => {
    cy.novoContexto().then((c) => {
      ctx = c;
    });
  });

  const sessao = () => ({
    access: ctx.admin.access,
    refresh: ctx.admin.refresh,
    clinicaId: ctx.clinicaId,
  });

  it("cadastra um procedimento e um pacote pelo catálogo", () => {
    const nomeProc = `Limpeza UI ${sufixo()}`;
    const nomePac = `Pacote UI ${sufixo()}`;
    cy.visitarLogado("/app/pacotes-procedimentos", sessao());
    cy.contains("button", "Novo Procedimento").click();
    cy.get("#catalogo-nome").type(nomeProc);
    cy.get("#catalogo-preco").clear().type("19990");
    cy.get("#catalogo-duracao").clear().type("45");
    cy.get("#catalogo-categoria").type("Facial");
    cy.get("#catalogo-descricao").type("Procedimento criado via Cypress");
    cy.get("button.btn-salvar").click();
    cy.contains(nomeProc).should("be.visible");

    cy.apiReq("GET", "/api/servicos/", {
      token: ctx.admin.access,
      clinicaId: ctx.clinicaId,
    }).then((r) => {
      const lista = Array.isArray(r.body) ? r.body : r.body.results;
      const criado = lista.find((s) => s.nome === nomeProc);
      expect(criado).to.exist;
      expect(Number(criado.duracao_padrao_minutos)).to.eq(45);
    });

    cy.contains("button", "Pacotes").click();
    cy.contains("button", "Novo Pacote").click();
    cy.get("#catalogo-nome").type(nomePac);
    cy.get("#catalogo-servico").find("option").contains(nomeProc).then(($opcao) => {
      cy.get("#catalogo-servico").select($opcao.val());
    });
    cy.get("#catalogo-preco").clear().type("80000");
    cy.get("#catalogo-sessoes").clear().type("5");
    cy.get("#catalogo-categoria").type("Facial");
    cy.get("button.btn-salvar").click();
    cy.contains(nomePac).should("be.visible");
  });

  it("filtra o catálogo pela busca", () => {
    cy.criarServico(ctx, { nome: "Procedimento Busca Unico Zeta" }).then(() => {
      cy.visitarLogado("/app/pacotes-procedimentos", sessao());
      cy.get('input[aria-label="Buscar pacotes e procedimentos"]').type("Busca Unico Zeta");
      cy.contains("Procedimento Busca Unico Zeta").should("be.visible");
      cy.get('input[aria-label="Buscar pacotes e procedimentos"]').clear().type("inexistente-xyz");
      cy.contains("Procedimento Busca Unico Zeta").should("not.exist");
    });
  });

  it("cadastra um cliente pela interface e o encontra na busca", () => {
    const nome = `Cliente UI ${sufixo()}`;
    const cpf = gerarCpf();
    cy.visitarLogado("/app/clientes", sessao());
    cy.contains("button", "Novo Cliente").click();
    cy.get('input[placeholder="Ex: João da Silva"]').type(nome);
    cy.get('input[placeholder="000.000.000-00"]').type(cpf);
    cy.get('input[placeholder="(00) 00000-0000"]').type(gerarTelefone());
    cy.get('input[placeholder="00000-000"]').type("01310100");
    cy.get('input[placeholder="Apenas números"]').type("123");
    cy.get("button.btn-salvar").click();
    cy.contains(nome).should("be.visible");
    cy.get(".search-input").first().clear().type(nome);
    cy.contains(nome).should("be.visible");
    cy.get(".search-input").first().clear().type("nome-que-nao-existe-xyz");
    cy.contains(nome).should("not.exist");
  });

  it("não deixa cadastrar cliente com CPF inválido", () => {
    cy.visitarLogado("/app/clientes", sessao());
    cy.contains("button", "Novo Cliente").click();
    cy.get('input[placeholder="Ex: João da Silva"]').type("Cliente CPF Ruim");
    cy.get('input[placeholder="000.000.000-00"]').type("11111111111");
    cy.get('input[placeholder="(00) 00000-0000"]').type(gerarTelefone());
    cy.get("button.btn-salvar").click();
    cy.contains("Cliente CPF Ruim").should("not.exist");
    cy.get("button.btn-salvar").should("exist");
  });

  it("cadastra um colaborador profissional com especialidade", () => {
    const nome = `Profissional UI ${sufixo()}`;
    cy.visitarLogado("/app/colaboradores", sessao());
    cy.contains("button", "Novo Colaborador").click();
    cy.get("#colaborador-nome").type(nome);
    cy.get("#colaborador-cpf").type(gerarCpf());
    cy.get("#colaborador-funcao").select("Profissional");
    cy.get('input[placeholder="Ex: Massoterapeuta..."]').type("Esteticista{enter}");
    cy.contains("button", "Cadastrar colaborador").click();
    cy.contains(nome).should("be.visible");
    cy.apiReq("GET", "/api/colaboradores/", {
      token: ctx.admin.access,
      clinicaId: ctx.clinicaId,
    }).then((r) => {
      const lista = Array.isArray(r.body) ? r.body : r.body.results;
      const criado = lista.find((c) => c.usuario_nome === nome);
      expect(criado).to.exist;
      expect(criado.role_nome).to.eq("PROFISSIONAL");
    });
  });
});

describe("Integração - agenda de ponta a ponta", () => {
  let ctx;
  let profissional;
  let servico;
  let cliente;
  let outroCliente;
  let modelo;

  before(() => {
    cy.novoContexto().then((c) => {
      ctx = c;
    });
    cy.then(() => cy.adicionarColaborador(ctx, "PROFISSIONAL")).then((p) => {
      profissional = p;
    });
    cy.then(() => cy.criarServico(ctx, { nome: `Servico Agenda ${sufixo()}`, preco: "200.00" })).then(
      (s) => {
        servico = s;
      }
    );
    cy.then(() => cy.criarCliente(ctx, { nome_completo: `Cliente Agenda ${sufixo()}` })).then((c) => {
      cliente = c;
    });
    cy.then(() => cy.criarCliente(ctx, { nome_completo: `Cliente Dois ${sufixo()}` })).then((c) => {
      outroCliente = c;
    });
    cy.then(() => cy.criarModeloPacote(ctx, servico.id, { quantidade_sessoes: 3 })).then((m) => {
      modelo = m;
    });
  });

  const sessao = () => ({
    access: ctx.admin.access,
    refresh: ctx.admin.refresh,
    clinicaId: ctx.clinicaId,
  });

  const abrirNovoAgendamento = () => {
    cy.visitarLogado("/app/agenda", sessao());
    cy.contains("button", "Novo Agendamento").click();
    cy.get(".modal-overlay").should("have.css", "opacity", "1");
    cy.get("#cliente").should("be.visible");
  };

  const preencherAgendamento = (alvo, dias, inicio, fim, preco) => {
    cy.escolherNaLista("cliente", alvo.nomeOriginal || alvo.usuario_nome);
    cy.get("#servico").find("option").contains(servico.nome).then(($o) => {
      cy.get("#servico").select($o.val());
    });
    cy.escolherNaLista("profissional", profissional.nome);
    cy.get("#dataInicio").clear().type(dataParaInput(dias));
    cy.get("#horaInicio").clear().type(inicio);
    cy.get("#horaFim").clear().type(fim);
    if (preco !== undefined) {
      cy.get("#precoAcordado").clear().type(preco);
    }
  };

  it("mostra o formulário com o campo de valor do agendamento", () => {
    abrirNovoAgendamento();
    cy.get("#precoAcordado").should("have.attr", "placeholder", "Em branco = valor de referência");
    cy.get("#observacoes").should("exist");
    cy.get("#dataInicio").should("exist");
  });

  it("cria um agendamento com valor acordado sem alterar o preço do procedimento", () => {
    abrirNovoAgendamento();
    preencherAgendamento(cliente, 5, "09:00", "10:00", "175,50");
    cy.get("button.btn-salvar").click();
    cy.get(".toast-notification.success", { timeout: 15000 }).should("be.visible");
    cy.apiReq("GET", "/api/agendamentos/", {
      token: ctx.admin.access,
      clinicaId: ctx.clinicaId,
      qs: { cliente: cliente.id },
    }).then((r) => {
      expect(r.body).to.have.length(1);
      expect(r.body[0].status).to.eq("CONFIRMADO");
      expect(Number(r.body[0].preco_acordado)).to.eq(175.5);
    });
    cy.apiReq("GET", `/api/servicos/${servico.id}/`, {
      token: ctx.admin.access,
      clinicaId: ctx.clinicaId,
    }).then((r) => expect(Number(r.body.preco)).to.eq(200));
  });

  it("avisa sobre conflito de horário quando o backend responde 409", () => {
    abrirNovoAgendamento();
    preencherAgendamento(outroCliente, 5, "09:30", "10:30");
    cy.get("button.btn-salvar").click();
    cy.get(".toast-notification.error, .alert-erro, [role=alert]", { timeout: 15000 }).should(
      "be.visible"
    );
    cy.apiReq("GET", "/api/agendamentos/", {
      token: ctx.admin.access,
      clinicaId: ctx.clinicaId,
      qs: { cliente: outroCliente.id },
    }).then((r) => expect(r.body).to.have.length(0));
  });

  it("não envia o formulário quando o valor é inválido", () => {
    abrirNovoAgendamento();
    preencherAgendamento(outroCliente, 6, "09:00", "10:00", "-10");
    cy.get("button.btn-salvar").click();
    cy.get("#precoAcordado").should("have.class", "input-error");
    cy.apiReq("GET", "/api/agendamentos/", {
      token: ctx.admin.access,
      clinicaId: ctx.clinicaId,
      qs: { cliente: outroCliente.id },
    }).then((r) => expect(r.body).to.have.length(0));
  });

  it("reserva uma sessão de pacote ao agendar pela interface", () => {
    cy.venderPacote(ctx, modelo, outroCliente.id).then((pacote) => {
      abrirNovoAgendamento();
      preencherAgendamento(outroCliente, 7, "11:00", "12:00");
      cy.get("#pacote").scrollIntoView().should("be.visible");
      cy.get("#pacote").find("option").should("have.length.greaterThan", 1);
      cy.get("#pacote").select(String(pacote.id));
      
      cy.get("button.btn-salvar").scrollIntoView().click();
      cy.get(".toast-notification.success", { timeout: 15000 }).should("be.visible");
      cy.apiReq("GET", `/api/pacotes/${pacote.id}/`, {
        token: ctx.admin.access,
        clinicaId: ctx.clinicaId,
      }).then((r) => expect(r.body.sessoes_disponiveis).to.eq(2));
    });
  });

  it("cancela um agendamento pela interface informando o motivo", () => {
    cy.criarCliente(ctx, { nome_completo: `Cliente Cancelar ${sufixo()}` }).then((alvo) => {
      const diaCancelamento = 50; 
      
      cy.criarAgendamento(ctx, {
        cliente: alvo.id,
        profissional: profissional.colaboradorId,
        servico: servico.id,
        data_hora_inicio: isoFuturo(diaCancelamento, 9, 0),
        data_hora_fim: isoFuturo(diaCancelamento, 10, 0),
      }).then((criado) => {
        expect(criado.status).to.eq(201);
        cy.visitarLogado("/app/agenda", sessao());
        cy.contains("button", "Lista").click();
        cy.contains(".agenda-grid-wrapper .appointment-card", alvo.nomeOriginal)
          .should("be.visible")
          .click();
        cy.contains("button", "Cancelar agendamento").click();
        cy.get("#motivo-cancelamento").type("Cliente desistiu");
        cy.get("button.btn-confirmar").click();
        cy.get(".toast-notification.success", { timeout: 15000 }).should("be.visible");
        cy.apiReq("GET", `/api/agendamentos/${criado.body.id}/`, {
          token: ctx.admin.access,
          clinicaId: ctx.clinicaId,
        }).then((r) => {
          expect(r.body.status).to.eq("CANCELADO");
          expect(r.body.motivo_cancelamento).to.eq("Cliente desistiu");
        });
      });
    });
  });

  it("registra falta pela interface", () => {
    cy.criarCliente(ctx, { nome_completo: `Cliente Falta ${sufixo()}` }).then((alvo) => {
      const diaFalta = 60;

      cy.criarAgendamento(ctx, {
        cliente: alvo.id,
        profissional: profissional.colaboradorId,
        servico: servico.id,
        data_hora_inicio: isoFuturo(diaFalta, 9, 0),
        data_hora_fim: isoFuturo(diaFalta, 10, 0),
      }).then((criado) => {
        expect(criado.status).to.eq(201);
        cy.visitarLogado("/app/agenda", sessao());
        cy.contains("button", "Lista").click();
        cy.contains(".agenda-grid-wrapper .appointment-card", alvo.nomeOriginal)
          .should("be.visible")
          .click();
        cy.contains("button", "Registrar falta").click();
        cy.get("button.btn-confirmar").click();
        cy.get(".toast-notification.success", { timeout: 15000 }).should("be.visible");
        cy.apiReq("GET", `/api/agendamentos/${criado.body.id}/`, {
          token: ctx.admin.access,
          clinicaId: ctx.clinicaId,
        }).then((r) => expect(r.body.resultado).to.eq("FALTA"));
      });
    });
  });

  it("exibe estatísticas e alterna entre calendário e lista", () => {
    cy.visitarLogado("/app/agenda", sessao());
    cy.get(".stat-number").should("have.length.greaterThan", 0);
    cy.contains("button", "Lista").click();
    cy.contains("button", "Calendário").click();
    cy.get(".fc").should("exist");
  });

  it("mostra a agenda e os atendimentos para o profissional com autonomia", () => {
    const sessaoProf = {
      access: profissional.access,
      refresh: profissional.refresh,
      clinicaId: ctx.clinicaId,
    };
    cy.visitarLogado("/app/agenda", sessaoProf);
    cy.location("pathname").should("eq", "/app/agenda");
    cy.contains("button", "Novo Agendamento").should("be.visible");
    cy.visitarLogado("/app/atendimentos", sessaoProf);
    cy.location("pathname").should("eq", "/app/atendimentos");
    cy.contains("button", "Novo Atendimento").should("exist");
  });

  it("dashboard reflete os dados reais da clínica", () => {
    cy.visitarLogado("/app/dashboard", sessao());
    cy.contains("Agendamentos Hoje").should("be.visible");
    cy.contains("Clientes Ativos").should("be.visible");
    cy.contains("Receita do Mês").should("be.visible");
    cy.contains("Em desenvolvimento").should("be.visible");
    cy.contains(".stat-card", "Clientes Ativos")
      .find(".stat-value")
      .should(($valor) => {
        expect(Number($valor.text().trim())).to.be.greaterThan(1);
      });
  });
});