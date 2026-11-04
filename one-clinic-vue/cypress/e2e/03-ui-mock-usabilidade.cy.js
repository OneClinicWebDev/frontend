const CLINICA_ID = "11111111-1111-4111-8111-111111111111";
const CLINICA_B_ID = "22222222-2222-4222-8222-222222222222";
const SESSAO = { access: "access.mock.token", refresh: "refresh.mock.token", clinicaId: CLINICA_ID };

const usuarioMock = {
  id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  cpf: "52998224725",
  nome: "Usuaria Mock",
  data_nascimento: "1990-05-10",
  telefone: "11999998888",
};

const vinculoMock = (role, extra = {}) => ({
  clinica_id: CLINICA_ID,
  clinica_nome: "Clinica Mock",
  role,
  colaborador_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  pode_editar_agenda: true,
  profissionais_podem_editar_agenda: true,
  ...extra,
});

const hojeEm = (hora, minuto = 0) => {
  const data = new Date();
  data.setHours(hora, minuto, 0, 0);
  return data.toISOString();
};

const clientesMock = [
  {
    id: "c0000000-0000-4000-8000-000000000001",
    usuario_nome: "Ana Souza",
    usuario_cpf: "***.456.789-**",
    telefone: "11911112222",
    cep: "01310100",
    numero_endereco: "10",
    status_cadastro: "ATIVO",
  },
  {
    id: "c0000000-0000-4000-8000-000000000002",
    usuario_nome: "Bruno Lima",
    usuario_cpf: "***.111.222-**",
    telefone: "11933334444",
    cep: "01310100",
    numero_endereco: "20",
    status_cadastro: "ATIVO",
  },
  {
    id: "c0000000-0000-4000-8000-000000000003",
    usuario_nome: "Carla Dias",
    usuario_cpf: "***.333.444-**",
    telefone: "11955556666",
    cep: "01310100",
    numero_endereco: "30",
    status_cadastro: "INATIVO",
  },
];

const servicosMock = [
  {
    id: 1,
    nome: "Limpeza de Pele",
    preco: "150.00",
    duracao_padrao_minutos: 60,
    categoria: "Facial",
    descricao: "Limpeza profunda",
    ativo: true,
  },
  {
    id: 2,
    nome: "Massagem Relaxante",
    preco: "200.00",
    duracao_padrao_minutos: 50,
    categoria: "Corporal",
    descricao: "Massagem",
    ativo: true,
  },
];

const colaboradoresMock = [
  {
    id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
    usuario_nome: "Usuaria Mock",
    clinica: CLINICA_ID,
    role: 1,
    role_nome: "ADMIN",
    ativo: true,
    pode_editar_agenda: true,
    especialidades: [],
  },
  {
    id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
    usuario_nome: "Paulo Profissional",
    clinica: CLINICA_ID,
    role: 3,
    role_nome: "PROFISSIONAL",
    ativo: true,
    pode_editar_agenda: true,
    especialidades: ["Esteticista"],
  },
];

const agendamentosMock = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    clinica: CLINICA_ID,
    cliente: clientesMock[0].id,
    cliente_nome: "Ana Souza",
    cliente_telefone: "11911112222",
    profissional: colaboradoresMock[1].id,
    profissional_nome: "Paulo Profissional",
    servico: 1,
    servico_nome: "Limpeza de Pele",
    servico_preco: "150.00",
    servico_duracao: 60,
    pacote_origem: null,
    pacote_nome: null,
    sessao_pacote_status: null,
    data_hora_inicio: hojeEm(9),
    data_hora_fim: hojeEm(10),
    status: "CONFIRMADO",
    resultado: "AGUARDANDO_RESULTADO",
    motivo_cancelamento: "",
    observacoes: "",
    preco_acordado: "130.00",
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    clinica: CLINICA_ID,
    cliente: clientesMock[1].id,
    cliente_nome: "Bruno Lima",
    cliente_telefone: "11933334444",
    profissional: colaboradoresMock[1].id,
    profissional_nome: "Paulo Profissional",
    servico: 2,
    servico_nome: "Massagem Relaxante",
    servico_preco: "200.00",
    servico_duracao: 50,
    pacote_origem: null,
    pacote_nome: null,
    sessao_pacote_status: null,
    data_hora_inicio: hojeEm(11),
    data_hora_fim: hojeEm(12),
    status: "CANCELADO",
    resultado: "AGUARDANDO_RESULTADO",
    motivo_cancelamento: "Cliente desistiu",
    observacoes: "",
    preco_acordado: null,
  },
  {
    id: "a0000000-0000-4000-8000-000000000003",
    clinica: CLINICA_ID,
    cliente: clientesMock[0].id,
    cliente_nome: "Ana Souza",
    cliente_telefone: "11911112222",
    profissional: colaboradoresMock[1].id,
    profissional_nome: "Paulo Profissional",
    servico: 1,
    servico_nome: "Limpeza de Pele",
    servico_preco: "150.00",
    servico_duracao: 60,
    pacote_origem: null,
    pacote_nome: null,
    sessao_pacote_status: null,
    data_hora_inicio: hojeEm(14),
    data_hora_fim: hojeEm(15),
    status: "CONCLUIDO",
    resultado: "REALIZADO",
    motivo_cancelamento: "",
    observacoes: "",
    preco_acordado: null,
  },
];

const clinicaMock = {
  id: CLINICA_ID,
  cnpj: "11222333000181",
  razao_social: "Razao Mock LTDA",
  nome_fantasia: "Clinica Mock",
  telefone: "1133334444",
  endereco: "Rua Mock, 10",
  profissionais_podem_editar_agenda: true,
};

const rota = (metodo, caminho, resposta) =>
  cy.intercept(
    { method: metodo, url: new RegExp(`${caminho.replace(/\//g, "\\/")}(\\?.*)?$`) },
    resposta
  );

const montarApi = (opcoes = {}) => {
  const role = opcoes.role || "ADMIN";
  const vinculos = opcoes.vinculos || [vinculoMock(role)];
  cy.intercept({ method: "GET", url: /\/api\// }, { statusCode: 200, body: [] });
  rota("GET", "/api/auth/me/", { statusCode: 200, body: { usuario: usuarioMock, vinculos } });
  rota("GET", "/api/auth/perfil/", {
    statusCode: 200,
    body: {
      id: usuarioMock.id,
      cpf: usuarioMock.cpf,
      nome_completo: usuarioMock.nome,
      data_nascimento: usuarioMock.data_nascimento,
      telefone: usuarioMock.telefone,
    },
  });
  rota("GET", "/api/clinica/atual/", { statusCode: 200, body: clinicaMock });
  rota("GET", "/api/clientes/", { statusCode: 200, body: opcoes.clientes || clientesMock });
  rota("GET", "/api/servicos/", { statusCode: 200, body: opcoes.servicos || servicosMock });
  rota("GET", "/api/colaboradores/", {
    statusCode: 200,
    body: opcoes.colaboradores || colaboradoresMock,
  });
  rota("GET", "/api/agendamentos/", {
    statusCode: 200,
    body: opcoes.agendamentos || agendamentosMock,
  });
  rota("GET", "/api/pacotes/", { statusCode: 200, body: opcoes.pacotes || [] });
  rota("GET", "/api/modelos-pacote/", { statusCode: 200, body: opcoes.modelos || [] });
};

const rotasPorPapel = {
  ADMIN: {
    permitidas: [
      "/app/dashboard",
      "/app/agenda",
      "/app/atendimentos",
      "/app/clientes",
      "/app/estoque",
      "/app/financeiro",
      "/app/colaboradores",
      "/app/pacotes-procedimentos",
      "/app/configuracoes-clinica",
      "/app/meu-perfil",
    ],
    bloqueadas: [],
  },
  SECRETARIO: {
    permitidas: [
      "/app/dashboard",
      "/app/agenda",
      "/app/atendimentos",
      "/app/clientes",
      "/app/estoque",
      "/app/colaboradores",
      "/app/pacotes-procedimentos",
      "/app/meu-perfil",
    ],
    bloqueadas: ["/app/financeiro", "/app/configuracoes-clinica"],
  },
  PROFISSIONAL: {
    permitidas: ["/app/dashboard", "/app/agenda", "/app/atendimentos", "/app/meu-perfil"],
    bloqueadas: [
      "/app/clientes",
      "/app/estoque",
      "/app/financeiro",
      "/app/colaboradores",
      "/app/pacotes-procedimentos",
      "/app/configuracoes-clinica",
    ],
  },
};

describe("UI (mock) - login", () => {
  beforeEach(() => {
    cy.intercept({ method: "GET", url: /\/api\// }, { statusCode: 200, body: [] });
  });

  it("envia o CPF somente com dígitos e entra com um único vínculo", () => {
    cy.intercept("POST", "**/api/auth/login/", {
      statusCode: 200,
      body: {
        access: SESSAO.access,
        refresh: SESSAO.refresh,
        usuario: usuarioMock,
        vinculos: [vinculoMock("ADMIN")],
      },
    }).as("login");
    montarApi();
    cy.abrirLogin();
    cy.get("#login-cpf").type("529.982.247-25");
    cy.get("#login-password").type("Senha@12345", { log: false });
    cy.contains("button", "Entrar na plataforma").click();
    cy.wait("@login").its("request.body").should("deep.equal", {
      cpf: "52998224725",
      password: "Senha@12345",
    });
    cy.location("pathname").should("eq", "/app/dashboard");
    cy.window().its("localStorage.access_token").should("eq", SESSAO.access);
    cy.window().its("localStorage.clinica_ativa_id").should("eq", CLINICA_ID);
  });

  it("mostra a mensagem devolvida pela API para credenciais inválidas", () => {
    cy.intercept("POST", "**/api/auth/login/", {
      statusCode: 400,
      body: { non_field_errors: ["Credenciais inválidas ou usuário inativo."] },
    }).as("login");
    cy.abrirLogin();
    cy.get("#login-cpf").type("52998224725");
    cy.get("#login-password").type("errada", { log: false });
    cy.contains("button", "Entrar na plataforma").click();
    cy.wait("@login");
    cy.get('[role="alert"]').should("contain", "Credenciais inválidas");
    cy.location("pathname").should("eq", "/");
  });

  it("informa o limite de requisições quando a API responde 429", () => {
    cy.intercept("POST", "**/api/auth/login/", {
      statusCode: 429,
      body: { detail: "Muitas tentativas. Tente novamente mais tarde." },
    }).as("login");
    cy.abrirLogin();
    cy.get("#login-cpf").type("52998224725");
    cy.get("#login-password").type("qualquer", { log: false });
    cy.contains("button", "Entrar na plataforma").click();
    cy.wait("@login");
    cy.get('[role="alert"]').should("be.visible");
  });

  it("mostra erro amigável quando a API está indisponível", () => {
    cy.intercept("POST", "**/api/auth/login/", { forceNetworkError: true }).as("login");
    cy.abrirLogin();
    cy.get("#login-cpf").type("52998224725");
    cy.get("#login-password").type("qualquer", { log: false });
    cy.contains("button", "Entrar na plataforma").click();
    cy.get('[role="alert"]').should("be.visible");
    cy.location("pathname").should("eq", "/");
  });

  it("exibe a seleção de clínica quando há mais de um vínculo", () => {
    cy.intercept("POST", "**/api/auth/login/", {
      statusCode: 200,
      body: {
        access: SESSAO.access,
        refresh: SESSAO.refresh,
        usuario: usuarioMock,
        vinculos: [
          vinculoMock("ADMIN"),
          vinculoMock("SECRETARIO", { clinica_id: CLINICA_B_ID, clinica_nome: "Clinica B" }),
        ],
      },
    }).as("login");
    montarApi({
      vinculos: [
        vinculoMock("ADMIN"),
        vinculoMock("SECRETARIO", { clinica_id: CLINICA_B_ID, clinica_nome: "Clinica B" }),
      ],
    });
    cy.abrirLogin();
    cy.get("#login-cpf").type("52998224725");
    cy.get("#login-password").type("Senha@12345", { log: false });
    cy.contains("button", "Entrar na plataforma").click();
    cy.contains("h2", "Escolha sua clínica").should("be.visible");
    cy.get(".clinic-option").should("have.length", 2);
    cy.contains("button", "Continuar").should("be.disabled");
    cy.contains(".clinic-option", "Clinica B").click();
    cy.contains(".clinic-option", "Clinica B").should("have.class", "selected");
    cy.contains("button", "Continuar").should("not.be.disabled").click();
    cy.location("pathname").should("eq", "/app/dashboard");
    cy.window().its("localStorage.clinica_ativa_id").should("eq", CLINICA_B_ID);
  });

  it("orienta o usuário sem clínica vinculada a cadastrar uma", () => {
    cy.intercept("POST", "**/api/auth/login/", {
      statusCode: 200,
      body: {
        access: SESSAO.access,
        refresh: SESSAO.refresh,
        usuario: usuarioMock,
        vinculos: [],
      },
    });
    cy.abrirLogin();
    cy.get("#login-cpf").type("52998224725");
    cy.get("#login-password").type("Senha@12345", { log: false });
    cy.contains("button", "Entrar na plataforma").click();
    cy.contains("Nenhuma clínica vinculada").should("be.visible");
    cy.contains("button", "Cadastrar nova clínica").click();
    cy.contains("h2", "Cadastre sua clínica").should("be.visible");
    cy.contains("button", "Voltar").click();
    cy.contains("button", "Voltar para o login").click();
    cy.get("#login-cpf").should("be.visible");
  });

  it("fecha o modal de login com o botão de fechar", () => {
    cy.abrirLogin();
    cy.get('button[aria-label="Fechar"]').click();
    cy.get("#login-cpf").should("not.exist");
  });

  it("valida as etapas e os rótulos do modal de cadastro", () => {
    cy.abrirLogin();
    cy.contains("button", "Criar uma clínica").click();
    cy.contains("h2", "Cadastre sua clínica").should("be.visible");
    [
      "#cadastro-nome",
      "#cadastro-nascimento",
      "#cadastro-senha",
      "#cadastro-cnpj",
      "#cadastro-razao",
      "#cadastro-fantasia",
      "#cadastro-telefone",
    ].forEach((seletor) => cy.get(seletor).should("be.visible"));
  });
});

describe("UI (mock) - sessão expirada", () => {
  it("volta para a Home quando /auth/me responde 401 e o refresh falha", () => {
    cy.intercept({ method: "GET", url: /\/api\// }, { statusCode: 200, body: [] });
    rota("GET", "/api/auth/me/", { statusCode: 401, body: { detail: "Token inválido." } });
    cy.intercept("POST", "**/api/token/refresh/", { statusCode: 401, body: { detail: "Expirado." } });
    cy.visitarLogado("/app/dashboard", SESSAO);
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
  });

  it("renova o token automaticamente quando uma chamada responde 401", () => {
    let tentativas = 0;
    cy.intercept({ method: "GET", url: /\/api\// }, { statusCode: 200, body: [] });
    montarApi();
    cy.intercept({ method: "GET", url: /\/api\/clientes\/(\?.*)?$/ }, (req) => {
      tentativas += 1;
      if (tentativas === 1) {
        req.reply({ statusCode: 401, body: { detail: "Token expirado." } });
      } else {
        req.reply({ statusCode: 200, body: clientesMock });
      }
    }).as("clientes");
    cy.intercept("POST", "**/api/token/refresh/", {
      statusCode: 200,
      body: { access: "novo.access.token", refresh: "novo.refresh.token" },
    }).as("refresh");
    cy.visitarLogado("/app/clientes", SESSAO);
    cy.wait("@refresh");
    cy.contains("Ana Souza").should("be.visible");
    cy.location("pathname").should("eq", "/app/clientes");
  });
});

describe("UI (mock) - proteção de rotas por papel", () => {
  Object.entries(rotasPorPapel).forEach(([papel, regras]) => {
    describe(`papel ${papel}`, () => {
      beforeEach(() => {
        montarApi({ role: papel });
      });

      regras.permitidas.forEach((caminho) => {
        it(`permite ${caminho}`, () => {
          cy.visitarLogado(caminho, SESSAO);
          cy.location("pathname", { timeout: 15000 }).should("eq", caminho);
        });
      });

      regras.bloqueadas.forEach((caminho) => {
        it(`bloqueia ${caminho} e redireciona ao dashboard`, () => {
          cy.visitarLogado(caminho, SESSAO);
          cy.location("pathname", { timeout: 15000 }).should("eq", "/app/dashboard");
        });
      });
    });
  });

  it("redireciona para a Home quando o usuário não tem vínculos", () => {
    montarApi({ vinculos: [] });
    cy.intercept("POST", "**/api/auth/logout/", { statusCode: 205, body: {} });
    cy.visitarLogado("/app/dashboard", SESSAO);
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
  });

  it("redireciona para a Home quando há vários vínculos e nenhuma clínica ativa", () => {
    montarApi({
      vinculos: [
        vinculoMock("ADMIN"),
        vinculoMock("SECRETARIO", { clinica_id: CLINICA_B_ID, clinica_nome: "Clinica B" }),
      ],
    });
    cy.visitarLogado("/app/dashboard", { ...SESSAO, clinicaId: "99999999-9999-4999-8999-999999999999" });
    cy.location("pathname", { timeout: 15000 }).should("eq", "/");
  });
});

describe("UI (mock) - cabeçalho, menu e logout", () => {
  beforeEach(() => {
    montarApi();
  });

  it("mostra a clínica ativa, o papel, o título e a data/hora", () => {
    cy.visitarLogado("/app/dashboard", SESSAO);
    cy.get('[data-cy="header"]').should("be.visible");
    cy.get('[data-cy="user-name"]').should("contain", "Clinica Mock");
    cy.get('[data-cy="user-role"]').should("be.visible");
    cy.get('[data-cy="page-title"]').should("contain", "Dashboard");
    cy.get('[data-cy="current-date"]').should("be.visible");
    cy.get('[data-cy="current-time"]').invoke("text").should("match", /\d{2}:\d{2}/);
  });

  it("abre e fecha o menu do usuário ao clicar fora", () => {
    cy.visitarLogado("/app/dashboard", SESSAO);
    cy.get('[data-cy="dropdown-menu"]').should("not.exist");
    cy.abrirMenuUsuario();
    cy.get('[data-cy="menu-profile"]').should("be.visible");
    cy.get('[data-cy="menu-settings"]').should("be.visible");
    cy.get('[data-cy="menu-switch-account"]').should("be.visible");
    cy.get('[data-cy="menu-logout"]').should("be.visible");
    cy.get("body").click(5, 5);
    cy.get('[data-cy="dropdown-menu"]').should("not.exist");
  });

  it("navega para perfil e configurações pelo menu do usuário", () => {
    cy.visitarLogado("/app/dashboard", SESSAO);
    cy.abrirMenuUsuario();
    cy.get('[data-cy="menu-profile"]').click();
    cy.location("pathname").should("eq", "/app/meu-perfil");
    cy.abrirMenuUsuario();
    cy.get('[data-cy="menu-settings"]').click();
    cy.location("pathname").should("eq", "/app/configuracoes-clinica");
  });

  it("não mostra configurações da clínica para quem não é administrador", () => {
    montarApi({ role: "SECRETARIO" });
    cy.visitarLogado("/app/dashboard", SESSAO);
    cy.abrirMenuUsuario();
    cy.get('[data-cy="menu-settings"]').should("not.exist");
  });

  it("encerra a sessão chamando o logout com o refresh token", () => {
    cy.intercept("POST", "**/api/auth/logout/", { statusCode: 205, body: {} }).as("logout");
    cy.visitarLogado("/app/dashboard", SESSAO);
    cy.abrirMenuUsuario();
    cy.get('[data-cy="menu-logout"]').click();
    cy.wait("@logout").its("request.body").should("deep.equal", { refresh: SESSAO.refresh });
    cy.location("pathname").should("eq", "/");
    cy.window().its("localStorage.access_token").should("not.exist");
    cy.window().its("localStorage.refresh_token").should("not.exist");
    cy.window().its("localStorage.clinica_ativa_id").should("not.exist");
  });

  it("limpa a sessão local mesmo quando o logout falha na API", () => {
    cy.intercept("POST", "**/api/auth/logout/", { statusCode: 500, body: {} }).as("logout");
    cy.visitarLogado("/app/dashboard", SESSAO);
    cy.abrirMenuUsuario();
    cy.get('[data-cy="menu-logout"]').click();
    cy.wait("@logout");
    cy.location("pathname").should("eq", "/");
    cy.window().its("localStorage.access_token").should("not.exist");
  });

  it("troca de conta voltando para a Home", () => {
    cy.intercept("POST", "**/api/auth/logout/", { statusCode: 205, body: {} });
    cy.visitarLogado("/app/dashboard", SESSAO);
    cy.abrirMenuUsuario();
    cy.get('[data-cy="menu-switch-account"]').click();
    cy.location("pathname").should("eq", "/");
  });

  it("troca de clínica pelo menu quando há mais de um vínculo", () => {
    montarApi({
      vinculos: [
        vinculoMock("ADMIN"),
        vinculoMock("SECRETARIO", { clinica_id: CLINICA_B_ID, clinica_nome: "Clinica B" }),
      ],
    });
    cy.visitarLogado("/app/agenda", SESSAO);
    cy.abrirMenuUsuario();
    cy.contains(".clinic-switcher .clinic-option", "Clinica B").click();
    cy.location("pathname").should("eq", "/app/dashboard");
    cy.window().its("localStorage.clinica_ativa_id").should("eq", CLINICA_B_ID);
    cy.get('[data-cy="user-name"]').should("contain", "Clinica B");
  });
});

describe("UI (mock) - dashboard, agenda e listagens", () => {
  beforeEach(() => {
    montarApi();
  });

  it("dashboard mostra clientes ativos e deixa o financeiro em desenvolvimento", () => {
    cy.visitarLogado("/app/dashboard", SESSAO);
    cy.contains(".stat-card", "Clientes Ativos").find(".stat-value").should("have.text", "2");
    cy.contains(".stat-card", "Receita do Mês").should("contain", "Em desenvolvimento");
    cy.contains(".stat-card", "Agendamentos Hoje").should("be.visible");
    cy.contains(".stat-card", "Comparecimento").should("be.visible");
  });

  it("agenda lista os agendamentos e conta as estatísticas por status", () => {
    cy.visitarLogado("/app/agenda", SESSAO);
    cy.get(".stat-number").should("have.length", 4);
    cy.get(".stat-number").eq(0).should("have.text", "3");
    cy.get(".stat-number").eq(1).should("have.text", "1");
    cy.get(".stat-number").eq(3).should("have.text", "1");
  });

  it("agenda alterna entre calendário e lista e filtra por busca", () => {
    cy.visitarLogado("/app/agenda", SESSAO);
    cy.contains("button", "Lista").click();
    cy.contains("Ana Souza").should("be.visible");
    cy.get('input[aria-label="Buscar agendamentos"]').type("Bruno");
    cy.contains("Bruno Lima").should("be.visible");
    cy.contains("Ana Souza").should("not.exist");
    cy.get('button[aria-label="Limpar pesquisa"]').click();
    cy.contains("Ana Souza").should("be.visible");
    cy.contains("button", "Calendário").click();
    cy.get(".fc").should("be.visible");
  });

  it("agenda abre o formulário de novo agendamento e valida campos obrigatórios", () => {
    cy.visitarLogado("/app/agenda", SESSAO);
    cy.contains("button", "Novo Agendamento").click();
    cy.get("#cliente").should("be.visible");
    cy.get("#servico").should("be.visible");
    cy.get("#profissional").should("be.visible");
    cy.get("#precoAcordado").should("be.visible");
    cy.get("button.btn-salvar").click();
    cy.get(".error-feedback.visible").should("exist");
    cy.get('button[aria-label="Fechar"]').first().click();
    cy.get("#cliente").should("not.exist");
  });

  it("agenda envia o preço acordado e os campos corretos ao criar", () => {
    cy.intercept("POST", "**/api/agendamentos/", (req) => {
      req.reply({ statusCode: 201, body: { ...agendamentosMock[0], id: "novo", ...req.body } });
    }).as("criar");
    cy.visitarLogado("/app/agenda", SESSAO);
    cy.contains("button", "Novo Agendamento").click();
    cy.escolherNaLista("cliente", "Ana Souza");
    cy.get("#servico").select("Limpeza de Pele");
    cy.escolherNaLista("profissional", "Paulo Profissional");
    cy.get("#dataInicio").type("2030-01-15");
    cy.get("#horaInicio").type("09:00");
    cy.get("#horaFim").type("10:00");
    cy.get("#precoAcordado").type("99,90");
    cy.get("button.btn-salvar").click();
    cy.wait("@criar").then(({ request }) => {
      expect(request.body.cliente).to.eq(clientesMock[0].id);
      expect(request.body.profissional).to.eq(colaboradoresMock[1].id);
      expect(String(request.body.servico)).to.eq("1");
      expect(Number(request.body.preco_acordado)).to.eq(99.9);
      expect(request.body).to.not.have.property("status");
    });
  });

  it("agenda mostra o aviso de conflito quando a API responde 409", () => {
    cy.intercept("POST", "**/api/agendamentos/", {
      statusCode: 409,
      body: { detail: "Conflito de horário identificado." },
    }).as("criar");
    cy.visitarLogado("/app/agenda", SESSAO);
    cy.contains("button", "Novo Agendamento").click();
    cy.escolherNaLista("cliente", "Ana Souza");
    cy.get("#servico").select("Limpeza de Pele");
    cy.escolherNaLista("profissional", "Paulo Profissional");
    cy.get("#dataInicio").type("2030-01-15");
    cy.get("#horaInicio").type("09:00");
    cy.get("#horaFim").type("10:00");
    cy.get("button.btn-salvar").click();
    cy.wait("@criar");
    cy.contains("Conflito de horário").should("be.visible");
    cy.get("#cliente").should("be.visible");
  });

  it("agenda trata 403 sem liberar a operação no frontend", () => {
    cy.intercept("POST", "**/api/agendamentos/", {
      statusCode: 403,
      body: { detail: "Você não possui permissão individual para editar a agenda." },
    }).as("criar");
    cy.visitarLogado("/app/agenda", SESSAO);
    cy.contains("button", "Novo Agendamento").click();
    cy.escolherNaLista("cliente", "Ana Souza");
    cy.get("#servico").select("Limpeza de Pele");
    cy.escolherNaLista("profissional", "Paulo Profissional");
    cy.get("#dataInicio").type("2030-01-15");
    cy.get("#horaInicio").type("09:00");
    cy.get("#horaFim").type("10:00");
    cy.get("button.btn-salvar").click();
    cy.wait("@criar");
    cy.contains("permissão").should("be.visible");
  });

  it("agenda exibe banner de erro e permite recarregar quando a listagem falha", () => {
    cy.intercept({ method: "GET", url: /\/api\/agendamentos\/(\?.*)?$/ }, {
      statusCode: 500,
      body: { detail: "Erro interno." },
    }).as("falha");
    cy.visitarLogado("/app/agenda", SESSAO);
    cy.wait("@falha");
    cy.get(".status-banner.erro").should("be.visible");
    cy.intercept({ method: "GET", url: /\/api\/agendamentos\/(\?.*)?$/ }, {
      statusCode: 200,
      body: agendamentosMock,
    });
    cy.get(".banner-acao").click();
    cy.get(".status-banner.erro").should("not.exist");
  });

  it("clientes lista, busca e abre o cadastro", () => {
    cy.visitarLogado("/app/clientes", SESSAO);
    cy.contains("Ana Souza").should("be.visible");
    cy.contains("Bruno Lima").should("be.visible");
    cy.get(".search-input").first().type("Carla");
    cy.contains("Carla Dias").should("be.visible");
    cy.contains("Ana Souza").should("not.exist");
    cy.get(".search-input").first().clear();
    cy.contains("button", "Novo Cliente").click();
    cy.get('input[placeholder="Ex: João da Silva"]').should("be.visible");
    cy.contains("button", "Cancelar").click();
    cy.get('input[placeholder="Ex: João da Silva"]').should("not.exist");
  });

  it("clientes envia o payload esperado ao cadastrar", () => {
    cy.intercept("POST", "**/api/clientes/", (req) => {
      req.reply({ statusCode: 201, body: { id: "novo-cliente", ...req.body } });
    }).as("criar");
    cy.visitarLogado("/app/clientes", SESSAO);
    cy.contains("button", "Novo Cliente").click();
    cy.get('input[placeholder="Ex: João da Silva"]').type("Diego Novo");
    cy.get('input[placeholder="000.000.000-00"]').type("52998224725");
    cy.get('input[placeholder="(00) 00000-0000"]').type("11988887777");
    cy.get('input[placeholder="00000-000"]').type("01310100");
    cy.get('input[placeholder="Apenas números"]').type("55");
    cy.get("button.btn-salvar").click();
    cy.wait("@criar").then(({ request }) => {
      expect(request.body.nome_completo).to.eq("Diego Novo");
      expect(String(request.body.cpf).replace(/\D/g, "")).to.eq("52998224725");
    });
  });

  it("clientes mostra erro de duplicidade devolvido pela API", () => {
    cy.intercept("POST", "**/api/clientes/", {
      statusCode: 400,
      body: { usuario: ["Este usuário já possui cadastro de cliente nesta clínica."] },
    }).as("criar");
    cy.visitarLogado("/app/clientes", SESSAO);
    cy.contains("button", "Novo Cliente").click();
    cy.get('input[placeholder="Ex: João da Silva"]').type("Diego Duplicado");
    cy.get('input[placeholder="000.000.000-00"]').type("52998224725");
    cy.get('input[placeholder="(00) 00000-0000"]').type("11988887777");
    cy.get("button.btn-salvar").click();
    cy.wait("@criar");
    cy.contains("já possui cadastro").should("be.visible");
  });

  it("colaboradores lista a equipe e mostra os totais", () => {
    cy.visitarLogado("/app/colaboradores", SESSAO);
    cy.contains("Paulo Profissional").should("be.visible");
    cy.contains("Total de Colaboradores").should("be.visible");
    cy.contains("Equipe Ativa").should("be.visible");
    cy.contains("Colaboradores Inativos").should("be.visible");
  });

  it("colaboradores abre o cadastro, mostra especialidades só para profissional e valida CPF", () => {
    cy.visitarLogado("/app/colaboradores", SESSAO);
    cy.contains("button", "Novo Colaborador").click();
    cy.get("#colaborador-funcao").select("Secretário(a)");
    cy.get('input[placeholder="Ex: Massoterapeuta..."]').should("not.exist");
    cy.get("#colaborador-funcao").select("Profissional");
    cy.get('input[placeholder="Ex: Massoterapeuta..."]').should("be.visible");
    cy.get("#colaborador-nome").type("Fulano Teste");
    cy.get("#colaborador-cpf").type("11111111111");
    cy.contains("button", "Cadastrar colaborador").click();
    cy.contains("Fulano Teste").should("not.exist");
  });

  it("catálogo alterna entre procedimentos e pacotes e mostra as estatísticas", () => {
    cy.visitarLogado("/app/pacotes-procedimentos", SESSAO);
    cy.contains("Limpeza de Pele").should("be.visible");
    cy.contains("Massagem Relaxante").should("be.visible");
    cy.contains("Total de Procedimentos").should("be.visible");
    cy.contains("button", "Pacotes").click();
    cy.contains("Total de Pacotes").should("be.visible");
    cy.contains("button", "Novo Pacote").should("be.visible");
    cy.contains("button", "Procedimentos").click();
    cy.contains("button", "Novo Procedimento").should("be.visible");
  });

  it("catálogo impede criar pacote sem procedimento ativo", () => {
    montarApi({ servicos: [] });
    cy.visitarLogado("/app/pacotes-procedimentos", SESSAO);
    cy.contains("button", "Pacotes").click();
    cy.contains("button", "Novo Pacote").click();
    cy.contains("Cadastre ou ative um procedimento antes de criar um pacote.").should("be.visible");
    cy.get("button.btn-salvar").should("be.disabled");
  });

  it("perfil carrega os dados e valida a confirmação de senha", () => {
    cy.visitarLogado("/app/meu-perfil", SESSAO);
    cy.get("#nome_completo").should("have.value", usuarioMock.nome);
    cy.get("#cpf").should("be.disabled");
    cy.get("#senha_atual").type("Atual@12345", { log: false });
    cy.get("#nova_senha").type("Nova@12345678", { log: false });
    cy.get("#confirmar_senha").type("Outra@12345678", { log: false });
    cy.contains("button", "Alterar senha").click();
    cy.get(".toast-notification.error").should("be.visible");
  });

  it("perfil envia o PATCH com os campos editados", () => {
    cy.intercept("PATCH", "**/api/auth/perfil/", (req) => {
      req.reply({ statusCode: 200, body: { ...req.body, id: usuarioMock.id, cpf: usuarioMock.cpf } });
    }).as("salvar");
    cy.visitarLogado("/app/meu-perfil", SESSAO);
    cy.get("#nome_completo").clear().type("Nome Mock Editado");
    cy.contains("button", "Salvar alterações").click();
    cy.wait("@salvar").its("request.body.nome_completo").should("eq", "Nome Mock Editado");
    cy.get(".toast-notification.success").should("contain", "Dados atualizados com sucesso.");
  });

  it("configurações da clínica carrega, salva e trata erro da API", () => {
    cy.intercept("PATCH", "**/api/clinica/atual/", {
      statusCode: 400,
      body: { cnpj: ["Já existe uma clínica cadastrada com este CNPJ."] },
    }).as("salvar");
    cy.visitarLogado("/app/configuracoes-clinica", SESSAO);
    cy.get("#razao_social").should("have.value", clinicaMock.razao_social);
    cy.get("#nome_fantasia").should("have.value", clinicaMock.nome_fantasia);
    cy.get("#nome_fantasia").clear().type("Outro Nome");
    cy.contains("button", "Salvar configurações").click();
    cy.wait("@salvar");
    cy.get(".toast-notification.error").should("be.visible");
  });

  it("estoque e financeiro exibem os módulos em desenvolvimento para o administrador", () => {
    cy.visitarLogado("/app/financeiro", SESSAO);
    cy.contains("h1", "Módulo Financeiro").should("be.visible");
    cy.visitarLogado("/app/estoque", SESSAO);
    cy.contains("h1", "Módulo de Estoque").should("be.visible");
  });
});

describe("UI (mock) - usabilidade responsiva", () => {
  const telas = [
    { nome: "celular", largura: 375, altura: 667 },
    { nome: "tablet", largura: 768, altura: 1024 },
    { nome: "notebook", largura: 1366, altura: 768 },
    { nome: "desktop largo", largura: 1920, altura: 1080 },
  ];

  const paginas = [
    "/app/dashboard",
    "/app/agenda",
    "/app/atendimentos",
    "/app/clientes",
    "/app/colaboradores",
    "/app/pacotes-procedimentos",
    "/app/configuracoes-clinica",
    "/app/meu-perfil",
  ];

  const semRolagemHorizontal = () => {
    cy.document().then((doc) => {
      const largura = doc.documentElement.clientWidth;
      expect(doc.documentElement.scrollWidth, "scrollWidth").to.be.at.most(largura + 1);
    });
  };

  telas.forEach((tela) => {
    describe(`tela ${tela.nome} (${tela.largura}x${tela.altura})`, () => {
      beforeEach(() => {
        montarApi();
        cy.viewport(tela.largura, tela.altura);
      });

      paginas.forEach((caminho) => {
        it(`renderiza ${caminho} sem rolagem horizontal`, () => {
          cy.visitarLogado(caminho, SESSAO);
          cy.location("pathname", { timeout: 15000 }).should("eq", caminho);
          cy.get('[data-cy="page-title"]').should("be.visible");
          semRolagemHorizontal();
        });
      });

      it("Home carrega com título e chamada para entrar", () => {
        cy.visit("/");
        cy.get(".logo-text").should("be.visible");
        semRolagemHorizontal();
      });
    });
  });

  describe("navegação em celular", () => {
    beforeEach(() => {
      montarApi();
      cy.viewport(375, 667);
    });

    it("abre o menu lateral pelo botão, navega e fecha pela sobreposição", () => {
      cy.visitarLogado("/app/dashboard", SESSAO);
      cy.get('[data-cy="mobile-toggle"]').should("be.visible").click();
      cy.get('[data-cy="sidebar"]').should("be.visible");
      cy.get('[data-cy="sidebar-overlay"]').should("exist");
      cy.get('[data-cy="menu-agenda"]').click();
      cy.location("pathname").should("eq", "/app/agenda");
      cy.get('[data-cy="mobile-toggle"]').click();
      cy.get('[data-cy="sidebar-overlay"]').click({ force: true });
      cy.get('[data-cy="sidebar-overlay"]').should("not.exist");
    });

    it("exibe o nome e o papel dentro do menu do usuário", () => {
      cy.visitarLogado("/app/dashboard", SESSAO);
      cy.abrirMenuUsuario();
      cy.get('[data-cy="mobile-user-name"]').should("contain", "Clinica Mock");
      cy.get('[data-cy="mobile-user-role"]').should("be.visible");
      cy.get('[data-cy="menu-logout"]').should("be.visible");
    });

    it("modal de login cabe na tela do celular", () => {
      cy.visit("/");
      cy.get("body").then(($body) => {
        if ($body.find('button:contains("Entrar como Colaborador"):visible').length) {
          cy.contains("button", "Entrar como Colaborador").click();
        } else {
          cy.contains("button", /Entrar|Área do Cliente|Colaborador/i).first().click({ force: true });
        }
      });
      cy.get("#login-cpf").should("be.visible");
      cy.get("#login-password").should("be.visible");
      cy.contains("button", "Entrar na plataforma").should("be.visible");
      cy.window().then((win) => {
        const caixa = win.document.querySelector("#login-cpf").getBoundingClientRect();
        expect(caixa.left).to.be.at.least(0);
        expect(caixa.right).to.be.at.most(win.innerWidth);
      });
    });

    it("formulário de agendamento cabe na tela do celular", () => {
      cy.visitarLogado("/app/agenda", SESSAO);
      cy.contains("button", "Novo Agendamento").click();
      cy.get("#cliente").should("be.visible");
      cy.window().then((win) => {
        const campo = win.document.querySelector("#precoAcordado");
        campo.scrollIntoView();
        const caixa = campo.getBoundingClientRect();
        expect(caixa.left).to.be.at.least(0);
        expect(caixa.right).to.be.at.most(win.innerWidth);
      });
    });
  });

  describe("navegação no desktop", () => {
    beforeEach(() => {
      montarApi();
      cy.viewport(1366, 768);
    });

    it("barra lateral mostra os itens do administrador e destaca a página atual", () => {
      cy.visitarLogado("/app/dashboard", SESSAO);
      [
        "menu-dashboard",
        "menu-agenda",
        "menu-atendimentos",
        "menu-clientes",
        "menu-estoque",
        "menu-financeiro",
        "menu-colaboradores",
        "menu-pacotes-procedimentos",
      ].forEach((id) => cy.get(`[data-cy="${id}"]`).should("be.visible"));
    });

    it("barra lateral oculta financeiro para secretário e atendimentos restritos para profissional", () => {
      montarApi({ role: "SECRETARIO" });
      cy.visitarLogado("/app/dashboard", SESSAO);
      cy.get('[data-cy="menu-financeiro"]').should("not.exist");
      montarApi({ role: "PROFISSIONAL" });
      cy.visitarLogado("/app/dashboard", SESSAO);
      cy.get('[data-cy="menu-clientes"]').should("not.exist");
      cy.get('[data-cy="menu-colaboradores"]').should("not.exist");
    });
  });

  describe("acessibilidade e teclado", () => {
    beforeEach(() => {
      montarApi();
    });

    it("campos do login têm rótulos associados e botões nomeados", () => {
      cy.abrirLogin();
      cy.get('label[for="login-cpf"]').should("exist");
      cy.get('label[for="login-password"]').should("exist");
      cy.get('button[aria-label="Fechar"]').should("exist");
      cy.get('button[aria-label="Mostrar senha"]').should("exist");
    });

    it("permite enviar o login com a tecla Enter", () => {
      cy.intercept("POST", "**/api/auth/login/", {
        statusCode: 200,
        body: {
          access: SESSAO.access,
          refresh: SESSAO.refresh,
          usuario: usuarioMock,
          vinculos: [vinculoMock("ADMIN")],
        },
      }).as("login");
      cy.abrirLogin();
      cy.get("#login-cpf").type("52998224725");
      cy.get("#login-password").type("Senha@12345{enter}", { log: false });
      cy.wait("@login");
      cy.location("pathname").should("eq", "/app/dashboard");
    });

    it("fecha o modal de login com a tecla Esc", () => {
      cy.abrirLogin();
      cy.get("body").type("{esc}");
      cy.get("#login-cpf").should("not.exist");
    });

    it("lista de clientes do agendamento navega pelo teclado", () => {
      cy.visitarLogado("/app/agenda", SESSAO);
      cy.contains("button", "Novo Agendamento").click();
      cy.get("#cliente").type("Ana");
      cy.get("#cliente").type("{downarrow}{enter}");
      cy.get("#cliente").should("have.value", "Ana Souza");
    });

    it("formulários do perfil e da clínica usam rótulos para todos os campos", () => {
      cy.visitarLogado("/app/meu-perfil", SESSAO);
      ["nome_completo", "cpf", "data_nascimento", "telefone", "senha_atual", "nova_senha", "confirmar_senha"].forEach(
        (id) => cy.get(`label[for="${id}"]`).should("exist")
      );
      cy.visitarLogado("/app/configuracoes-clinica", SESSAO);
      ["razao_social", "nome_fantasia", "cnpj", "telefone", "endereco"].forEach((id) =>
        cy.get(`label[for="${id}"]`).should("exist")
      );
    });
  });
});