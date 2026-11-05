const CHAVES_SESSAO = ["access_token", "refresh_token", "clinica_ativa_id"];

const digitoVerificador = (base, pesos) => {
  const soma = base.reduce((acc, valor, indice) => acc + valor * pesos[indice], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
};

const aleatorio = (tamanho) =>
  Array.from({ length: tamanho }, () => Math.floor(Math.random() * 10));

export const gerarCpf = () => {
  let base = aleatorio(9);
  while (new Set(base).size === 1) {
    base = aleatorio(9);
  }
  const d1 = digitoVerificador(base, [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = digitoVerificador([...base, d1], [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
  return [...base, d1, d2].join("");
};

export const gerarCnpj = () => {
  let base = aleatorio(12);
  while (new Set(base).size === 1) {
    base = aleatorio(12);
  }
  const d1 = digitoVerificador(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const d2 = digitoVerificador([...base, d1], [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return [...base, d1, d2].join("");
};

export const gerarTelefone = () => `119${Math.floor(10000000 + Math.random() * 89999999)}`;

export const formatarCpf = (cpf) =>
  cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");

export const formatarCnpj = (cnpj) =>
  cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");

export const sufixo = () => Math.random().toString(36).slice(2, 8);

export const dataFutura = (dias, hora = 9, minuto = 0) => {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  data.setHours(hora, minuto, 0, 0);
  return data;
};

export const isoFuturo = (dias, hora = 9, minuto = 0) =>
  dataFutura(dias, hora, minuto).toISOString();

export const dataParaInput = (dias) => {
  const data = dataFutura(dias);
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${data.getFullYear()}-${mes}-${dia}`;
};

export const cabecalhos = (token, clinicaId) => {
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (clinicaId) {
    headers["X-Clinica-ID"] = clinicaId;
  }
  return headers;
};

const requisitar = (opcoes, tentativa = 0) =>
  cy
    .request({ failOnStatusCode: false, timeout: 30000, ...opcoes })
    .then((resposta) => {
      if (resposta.status === 429 && tentativa < 5) {
        const segundos = Number(resposta.headers["retry-after"]) || 60;
        return cy
          .wait((segundos + 1) * 1000, { log: false })
          .then(() => requisitar(opcoes, tentativa + 1));
      }
      return resposta;
    });

Cypress.Commands.add("apiReq", (metodo, caminho, opcoes = {}) => {
  const { token, clinicaId, body, qs } = opcoes;
  return requisitar({
    method: metodo,
    url: `${Cypress.env("apiUrl")}${caminho}`,
    headers: cabecalhos(token, clinicaId),
    body,
    qs,
  });
});

Cypress.Commands.add("criarClinica", (sobrescrever = {}) => {
  const id = sufixo();

  const dados = {
    cpf: gerarCpf(),
    nome_completo: `Admin Cypress ${id}`,
    data_nascimento: "1985-04-12",
    password: Cypress.env("senhaPadrao"),
    cnpj: gerarCnpj(),
    razao_social: `Razao Social Cypress ${id} LTDA`,
    nome_fantasia: `Clinica Cypress ${id}`,
    telefone: gerarTelefone(),
    profissionais_podem_editar_agenda: true,
    ...sobrescrever,
  };

  const apiUrl = Cypress.env("apiUrl");

  if (!apiUrl) {
    throw new Error("A variável apiUrl não foi configurada no Cypress.");
  }

  if (!dados.password) {
    throw new Error("A variável senhaPadrao não foi configurada no Cypress.");
  }

  return cy
    .apiReq("POST", "/api/auth/criar-clinica/", {
      body: dados,
    })
    .then((resposta) => {
      expect(
        resposta.status,
        `criar-clinica | resposta: ${JSON.stringify(resposta.body)}`
      ).to.eq(201);

      return {
        ...dados,
        senha: dados.password,
        clinicaId: resposta.body.clinica_id,
        usuarioId: resposta.body.usuario_id,
      };
    });
});

Cypress.Commands.add("loginApi", (cpf, senha) =>
  cy
    .apiReq("POST", "/api/auth/login/", { body: { cpf, password: senha } })
    .then((resposta) => {
      expect(resposta.status, "login").to.eq(200);
      return {
        access: resposta.body.access,
        refresh: resposta.body.refresh,
        usuario: resposta.body.usuario,
        vinculos: resposta.body.vinculos,
      };
    })
);

Cypress.Commands.add("novoContexto", (sobrescrever = {}) =>
  cy.criarClinica(sobrescrever).then((clinica) =>
    cy.loginApi(clinica.cpf, clinica.senha).then((sessao) => {
      const ctx = {
        clinica,
        clinicaId: clinica.clinicaId,
        admin: {
          cpf: clinica.cpf,
          senha: clinica.senha,
          nome: clinica.nome_completo,
          access: sessao.access,
          refresh: sessao.refresh,
          vinculos: sessao.vinculos,
        },
      };
      return ctx;
    })
  )
);

Cypress.Commands.add("criarServico", (ctx, sobrescrever = {}) => {
  const corpo = {
    nome: `Procedimento ${sufixo()}`,
    preco: "150.00",
    duracao_padrao_minutos: 60,
    categoria: "Facial",
    descricao: "Servico criado pelo Cypress",
    ativo: true,
    ...sobrescrever,
  };
  return cy
    .apiReq("POST", "/api/servicos/", {
      token: ctx.admin.access,
      clinicaId: ctx.clinicaId,
      body: corpo,
    })
    .then((resposta) => {
      expect(resposta.status, "criar servico").to.eq(201);
      return resposta.body;
    });
});

Cypress.Commands.add("criarCliente", (ctx, sobrescrever = {}) => {
  const corpo = {
    cpf: gerarCpf(),
    nome_completo: `Cliente Cypress ${sufixo()}`,
    telefone: gerarTelefone(),
    cep: "01310100",
    numero_endereco: "100",
    ...sobrescrever,
  };
  return cy
    .apiReq("POST", "/api/clientes/", {
      token: ctx.admin.access,
      clinicaId: ctx.clinicaId,
      body: corpo,
    })
    .then((resposta) => {
      expect(resposta.status, "criar cliente").to.eq(201);
      return { ...resposta.body, cpfOriginal: corpo.cpf, nomeOriginal: corpo.nome_completo };
    });
});

Cypress.Commands.add("criarModeloPacote", (ctx, servicoId, sobrescrever = {}) => {
  const corpo = {
    nome: `Pacote ${sufixo()}`,
    servico: servicoId,
    quantidade_sessoes: 3,
    valor_total: "400.00",
    categoria: "Facial",
    descricao: "Pacote criado pelo Cypress",
    ativo: true,
    ...sobrescrever,
  };
  return cy
    .apiReq("POST", "/api/modelos-pacote/", {
      token: ctx.admin.access,
      clinicaId: ctx.clinicaId,
      body: corpo,
    })
    .then((resposta) => {
      expect(resposta.status, "criar modelo").to.eq(201);
      return resposta.body;
    });
});

Cypress.Commands.add("venderPacote", (ctx, modelo, clienteId) =>
  cy
    .apiReq("POST", "/api/pacotes/", {
      token: ctx.admin.access,
      clinicaId: ctx.clinicaId,
      body: {
        modelo: modelo.id,
        cliente: clienteId,
        servico: modelo.servico,
        quantidade_sessoes: modelo.quantidade_sessoes,
        valor_total: modelo.valor_total,
      },
    })
    .then((resposta) => {
      expect(resposta.status, "vender pacote").to.eq(201);
      return resposta.body;
    })
);

Cypress.Commands.add("adicionarColaborador", (ctx, papel, opcoes = {}) =>
  cy.criarClinica().then((propria) =>
    cy.loginApi(propria.cpf, propria.senha).then((sessao) => {
      const roleId = Cypress.env("roleIds")[papel];
      return cy
        .apiReq("POST", "/api/colaboradores/", {
          token: ctx.admin.access,
          clinicaId: ctx.clinicaId,
          body: {
            cpf: propria.cpf,
            nome_completo: propria.nome_completo,
            role: roleId,
            ativo: true,
            pode_editar_agenda: opcoes.pode_editar_agenda !== false,
            especialidades: opcoes.especialidades || [],
          },
        })
        .then((resposta) => {
          expect(resposta.status, `vincular ${papel}`).to.eq(201);
          return {
            cpf: propria.cpf,
            senha: propria.senha,
            nome: propria.nome_completo,
            colaboradorId: resposta.body.id,
            access: sessao.access,
            refresh: sessao.refresh,
            clinicaPropriaId: propria.clinicaId,
            clinicaId: ctx.clinicaId,
            papel,
          };
        });
    })
  )
);

Cypress.Commands.add("criarAgendamento", (ctx, dados, token) =>
  cy.apiReq("POST", "/api/agendamentos/", {
    token: token || ctx.admin.access,
    clinicaId: ctx.clinicaId,
    body: dados,
  })
);

Cypress.Commands.add("semearSessao", (access, refresh, clinicaId) => {
  cy.window({ log: false }).then((win) => {
    win.localStorage.setItem("access_token", access);
    win.localStorage.setItem("refresh_token", refresh);
    win.localStorage.setItem("clinica_ativa_id", clinicaId);
  });
});

Cypress.Commands.add("visitarLogado", (caminho, sessao, opcoes = {}) =>
  cy.visit(caminho, {
    ...opcoes,
    onBeforeLoad(win) {
      win.localStorage.setItem("access_token", sessao.access);
      win.localStorage.setItem("refresh_token", sessao.refresh);
      win.localStorage.setItem("clinica_ativa_id", sessao.clinicaId);
      if (opcoes.onBeforeLoad) {
        opcoes.onBeforeLoad(win);
      }
    },
  })
);

Cypress.Commands.add("limparSessao", () => {
  cy.clearLocalStorage();
  cy.window({ log: false }).then((win) => {
    CHAVES_SESSAO.forEach((chave) => win.localStorage.removeItem(chave));
  });
});

Cypress.Commands.add("abrirLogin", () => {
  cy.visit("/");
  cy.window().then((win) => {
    if (win.innerWidth > 1024) {
      cy.contains("button", "Entrar como Colaborador").click();
    } else {
      cy.contains("button", "Sou Colaborador").click();
    }
  });
  cy.get("#login-cpf").should("be.visible");
});

Cypress.Commands.add("loginUi", (cpf, senha, nomeClinica) => {
  cy.abrirLogin();
  cy.get("#login-cpf").clear().type(cpf);
  cy.get("#login-password").clear().type(senha, { log: false });
  cy.contains("button", "Entrar na plataforma").click();
  if (nomeClinica) {
    cy.contains(".clinic-option", nomeClinica).click();
    cy.contains("button", "Continuar").click();
  }
  cy.location("pathname", { timeout: 20000 }).should("match", /^\/app\//);
});

Cypress.Commands.add("abrirMenuUsuario", () => {
  cy.get('[data-cy="user-button"]').click();
  cy.get('[data-cy="dropdown-menu"]').should("be.visible");
});

Cypress.Commands.add("preencherPorId", (mapa) => {
  Object.entries(mapa).forEach(([id, valor]) => {
    cy.get(`#${id}`).clear().type(String(valor), { delay: 5 });
  });
});

Cypress.Commands.add("escolherNaLista", (idCampo, texto) => {
  cy.get(`#${idCampo}`).clear().type(texto, { delay: 10 });
  cy.contains(".dropdown-option", texto).click();
});