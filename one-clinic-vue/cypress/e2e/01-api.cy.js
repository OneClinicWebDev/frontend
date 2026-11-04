import {
  gerarCpf,
  gerarCnpj,
  gerarTelefone,
  dataParaInput,
  isoFuturo,
  sufixo,
} from "../support/commands";

const lista = (corpo) => (Array.isArray(corpo) ? corpo : corpo.results || []);

describe("API - autenticação e cadastro de clínica", () => {
  let ctx;

  before(() => {
    cy.novoContexto().then((c) => {
      ctx = c;
    });
  });

  it("rejeita criação de clínica com CPF inválido", () => {
    cy.apiReq("POST", "/api/auth/criar-clinica/", {
      body: {
        cpf: "11111111111",
        nome_completo: "Teste CPF",
        data_nascimento: "1990-01-01",
        password: Cypress.env("senhaPadrao"),
        cnpj: gerarCnpj(),
        razao_social: "Razao Teste",
        nome_fantasia: "Fantasia Teste",
        telefone: gerarTelefone(),
        profissionais_podem_editar_agenda: false,
      },
    }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body).to.have.property("cpf");
    });
  });

  it("rejeita criação de clínica com CNPJ duplicado", () => {
    cy.apiReq("POST", "/api/auth/criar-clinica/", {
      body: {
        cpf: gerarCpf(),
        nome_completo: "Outro Admin",
        data_nascimento: "1990-01-01",
        password: Cypress.env("senhaPadrao"),
        cnpj: ctx.clinica.cnpj,
        razao_social: "Razao Duplicada",
        nome_fantasia: "Fantasia Duplicada",
        telefone: gerarTelefone(),
        profissionais_podem_editar_agenda: false,
      },
    }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body).to.have.property("cnpj");
    });
  });

  it("rejeita senha fraca e data de nascimento futura", () => {
    cy.apiReq("POST", "/api/auth/criar-clinica/", {
      body: {
        cpf: gerarCpf(),
        nome_completo: "Senha Fraca",
        data_nascimento: "2999-01-01",
        password: "123",
        cnpj: gerarCnpj(),
        razao_social: "Razao Fraca",
        nome_fantasia: "Fantasia Fraca",
        telefone: gerarTelefone(),
        profissionais_podem_editar_agenda: false,
      },
    }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body).to.have.property("password");
      expect(r.body).to.have.property("data_nascimento");
    });
  });

  it("rejeita criação de clínica para usuário existente com senha divergente", () => {
    cy.apiReq("POST", "/api/auth/criar-clinica/", {
      body: {
        cpf: ctx.clinica.cpf,
        nome_completo: ctx.clinica.nome_completo,
        data_nascimento: "1985-04-12",
        password: "OutraSenha@2026",
        cnpj: gerarCnpj(),
        razao_social: "Razao Existente",
        nome_fantasia: "Fantasia Existente",
        telefone: gerarTelefone(),
        profissionais_podem_editar_agenda: false,
      },
    }).then((r) => {
      expect(r.status).to.eq(401);
    });
  });

  it("autentica com credenciais válidas e devolve vínculos", () => {
    cy.apiReq("POST", "/api/auth/login/", {
      body: { cpf: ctx.clinica.cpf, password: ctx.clinica.senha },
    }).then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body.access).to.be.a("string");
      expect(r.body.refresh).to.be.a("string");
      expect(r.body.usuario.cpf).to.eq(ctx.clinica.cpf);
      expect(r.body.vinculos).to.have.length(1);
      expect(r.body.vinculos[0]).to.include({
        clinica_id: ctx.clinicaId,
        role: "ADMIN",
        pode_editar_agenda: true,
        profissionais_podem_editar_agenda: true,
      });
      expect(r.body.vinculos[0].colaborador_id).to.be.a("string");
    });
  });

  it("aceita CPF formatado no login", () => {
    const cpf = ctx.clinica.cpf;
    const formatado = `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
    cy.apiReq("POST", "/api/auth/login/", {
      body: { cpf: formatado, password: ctx.clinica.senha },
    }).then((r) => {
      expect(r.status).to.eq(200);
    });
  });

  it("recusa login com senha errada, CPF inválido e campos ausentes", () => {
    cy.apiReq("POST", "/api/auth/login/", {
      body: { cpf: ctx.clinica.cpf, password: "SenhaErrada@1" },
    }).then((r) => expect(r.status).to.eq(400));
    cy.apiReq("POST", "/api/auth/login/", {
      body: { cpf: "123", password: "x" },
    }).then((r) => expect(r.status).to.eq(400));
    cy.apiReq("POST", "/api/auth/login/", { body: {} }).then((r) =>
      expect(r.status).to.eq(400)
    );
  });

  it("protege /api/auth/me/ e devolve a sessão com token", () => {
    cy.apiReq("GET", "/api/auth/me/").then((r) => expect(r.status).to.eq(401));
    cy.apiReq("GET", "/api/auth/me/", { token: "token.invalido.aqui" }).then((r) =>
      expect(r.status).to.eq(401)
    );
    cy.apiReq("GET", "/api/auth/me/", { token: ctx.admin.access }).then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body.usuario.cpf).to.eq(ctx.clinica.cpf);
      expect(r.body.vinculos[0].clinica_id).to.eq(ctx.clinicaId);
    });
  });

  it("renova o access token e invalida o refresh após o logout", () => {
    cy.loginApi(ctx.clinica.cpf, ctx.clinica.senha).then((sessao) => {
      cy.apiReq("POST", "/api/token/refresh/", { body: { refresh: sessao.refresh } }).then(
        (r) => {
          expect(r.status).to.eq(200);
          expect(r.body.access).to.be.a("string");
        }
      );
    });
    cy.loginApi(ctx.clinica.cpf, ctx.clinica.senha).then((sessao) => {
      cy.apiReq("POST", "/api/auth/logout/", { token: sessao.access }).then((r) =>
        expect(r.status).to.eq(400)
      );
      cy.apiReq("POST", "/api/auth/logout/", {
        token: sessao.access,
        body: { refresh: "refresh.invalido" },
      }).then((r) => expect(r.status).to.eq(400));
      cy.apiReq("POST", "/api/auth/logout/", {
        token: sessao.access,
        body: { refresh: sessao.refresh },
      }).then((r) => expect(r.status).to.eq(205));
      cy.apiReq("POST", "/api/token/refresh/", { body: { refresh: sessao.refresh } }).then(
        (r) => expect(r.status).to.eq(401)
      );
    });
  });
});

describe("API - perfil e senha", () => {
  let ctx;

  before(() => {
    cy.novoContexto().then((c) => {
      ctx = c;
    });
  });

  it("lê e atualiza o perfil sem permitir alterar o CPF", () => {
    cy.apiReq("GET", "/api/auth/perfil/", { token: ctx.admin.access }).then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body.cpf).to.eq(ctx.clinica.cpf);
    });
    cy.apiReq("PATCH", "/api/auth/perfil/", {
      token: ctx.admin.access,
      body: {
        nome_completo: "Nome Atualizado Cypress",
        telefone: "11988887777",
        cpf: "00000000000",
      },
    }).then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body.nome_completo).to.eq("Nome Atualizado Cypress");
      expect(r.body.cpf).to.eq(ctx.clinica.cpf);
    });
  });

  it("valida nome curto, telefone inválido e data de nascimento futura", () => {
    cy.apiReq("PATCH", "/api/auth/perfil/", {
      token: ctx.admin.access,
      body: { nome_completo: "Ab" },
    }).then((r) => expect(r.status).to.eq(400));
    cy.apiReq("PATCH", "/api/auth/perfil/", {
      token: ctx.admin.access,
      body: { telefone: "123" },
    }).then((r) => expect(r.status).to.eq(400));
    cy.apiReq("PATCH", "/api/auth/perfil/", {
      token: ctx.admin.access,
      body: { data_nascimento: "2999-01-01" },
    }).then((r) => expect(r.status).to.eq(400));
  });

  it("valida a troca de senha e permite novo login com a senha nova", () => {
    cy.apiReq("POST", "/api/auth/alterar-senha/", {
      token: ctx.admin.access,
      body: { senha_atual: "SenhaErrada@1", nova_senha: "NovaSenha@2026x" },
    }).then((r) => expect(r.status).to.eq(400));
    cy.apiReq("POST", "/api/auth/alterar-senha/", {
      token: ctx.admin.access,
      body: { senha_atual: ctx.clinica.senha, nova_senha: ctx.clinica.senha },
    }).then((r) => expect(r.status).to.eq(400));
    cy.apiReq("POST", "/api/auth/alterar-senha/", {
      token: ctx.admin.access,
      body: { senha_atual: ctx.clinica.senha, nova_senha: "123" },
    }).then((r) => expect(r.status).to.eq(400));
    cy.apiReq("POST", "/api/auth/alterar-senha/", {
      token: ctx.admin.access,
      body: { senha_atual: ctx.clinica.senha, nova_senha: "NovaSenha@2026x" },
    }).then((r) => expect([200, 204]).to.include(r.status));
    cy.apiReq("POST", "/api/auth/login/", {
      body: { cpf: ctx.clinica.cpf, password: ctx.clinica.senha },
    }).then((r) => expect(r.status).to.eq(400));
    cy.apiReq("POST", "/api/auth/login/", {
      body: { cpf: ctx.clinica.cpf, password: "NovaSenha@2026x" },
    }).then((r) => expect(r.status).to.eq(200));
  });
});

describe("API - contexto de clínica, isolamento e permissões", () => {
  let a;
  let b;
  let secretario;
  let profissional;
  let clienteA;

  before(() => {
    cy.novoContexto().then((c) => {
      a = c;
    });
    cy.novoContexto().then((c) => {
      b = c;
    });
    cy.then(() => cy.adicionarColaborador(a, "SECRETARIO")).then((s) => {
      secretario = s;
    });
    cy.then(() => cy.adicionarColaborador(a, "PROFISSIONAL")).then((p) => {
      profissional = p;
    });
    cy.then(() => cy.criarCliente(a)).then((cl) => {
      clienteA = cl;
    });
  });

  it("exige X-Clinica-ID e rejeita clínica sem vínculo", () => {
    cy.apiReq("GET", "/api/clientes/", { token: a.admin.access }).then((r) =>
      expect(r.status).to.eq(403)
    );
    cy.apiReq("GET", "/api/clientes/", {
      token: a.admin.access,
      clinicaId: b.clinicaId,
    }).then((r) => expect(r.status).to.eq(403));
    cy.apiReq("GET", "/api/clientes/", {
      token: a.admin.access,
      clinicaId: "nao-e-uuid",
    }).then((r) => expect(r.status).to.eq(403));
    cy.apiReq("GET", "/api/clientes/", { clinicaId: a.clinicaId }).then((r) =>
      expect(r.status).to.eq(401)
    );
  });

  it("isola os dados entre clínicas", () => {
    cy.apiReq("GET", "/api/clientes/", {
      token: b.admin.access,
      clinicaId: b.clinicaId,
    }).then((r) => {
      expect(r.status).to.eq(200);
      expect(lista(r.body).map((c) => c.id)).to.not.include(clienteA.id);
    });
    cy.apiReq("GET", `/api/clientes/${clienteA.id}/`, {
      token: b.admin.access,
      clinicaId: b.clinicaId,
    }).then((r) => expect(r.status).to.eq(404));
    cy.apiReq("PATCH", `/api/clientes/${clienteA.id}/`, {
      token: b.admin.access,
      clinicaId: b.clinicaId,
      body: { telefone: "11911112222" },
    }).then((r) => expect(r.status).to.eq(404));
  });

  it("papéis do vínculo refletem a clínica selecionada", () => {
    cy.apiReq("GET", "/api/auth/me/", { token: secretario.access }).then((r) => {
      expect(r.status).to.eq(200);
      const vinculos = r.body.vinculos;
      expect(vinculos).to.have.length(2);
      const naClinicaA = vinculos.find((v) => v.clinica_id === a.clinicaId);
      expect(naClinicaA.role).to.eq("SECRETARIO");
      const propria = vinculos.find((v) => v.clinica_id === secretario.clinicaPropriaId);
      expect(propria.role).to.eq("ADMIN");
    });
  });

  it("secretário gerencia clientes e serviços, mas não colaboradores nem a clínica", () => {
    cy.apiReq("GET", "/api/clientes/", {
      token: secretario.access,
      clinicaId: a.clinicaId,
    }).then((r) => expect(r.status).to.eq(200));
    cy.apiReq("POST", "/api/servicos/", {
      token: secretario.access,
      clinicaId: a.clinicaId,
      body: {
        nome: `Servico Sec ${sufixo()}`,
        preco: "80.00",
        duracao_padrao_minutos: 30,
      },
    }).then((r) => expect(r.status).to.eq(201));
    cy.apiReq("POST", "/api/colaboradores/", {
      token: secretario.access,
      clinicaId: a.clinicaId,
      body: {
        cpf: gerarCpf(),
        nome_completo: "Nao Pode",
        role: Cypress.env("roleIds").PROFISSIONAL,
      },
    }).then((r) => expect(r.status).to.eq(403));
    cy.apiReq("GET", "/api/clinica/atual/", {
      token: secretario.access,
      clinicaId: a.clinicaId,
    }).then((r) => expect(r.status).to.eq(403));
  });

  it("profissional com autonomia lê listagens e não escreve cadastros", () => {
    ["/api/clientes/", "/api/colaboradores/", "/api/servicos/", "/api/pacotes/"].forEach(
      (rota) => {
        cy.apiReq("GET", rota, {
          token: profissional.access,
          clinicaId: a.clinicaId,
        }).then((r) => expect(r.status, rota).to.eq(200));
      }
    );
    cy.apiReq("POST", "/api/servicos/", {
      token: profissional.access,
      clinicaId: a.clinicaId,
      body: { nome: "Nao Pode", preco: "10.00", duracao_padrao_minutos: 20 },
    }).then((r) => expect(r.status).to.eq(403));
    cy.apiReq("POST", "/api/clientes/", {
      token: profissional.access,
      clinicaId: a.clinicaId,
      body: { cpf: gerarCpf(), nome_completo: "Nao Pode" },
    }).then((r) => expect(r.status).to.eq(403));
  });

  it("profissional perde a leitura quando a permissão individual é removida", () => {
    cy.apiReq("PATCH", `/api/colaboradores/${profissional.colaboradorId}/`, {
      token: a.admin.access,
      clinicaId: a.clinicaId,
      body: { pode_editar_agenda: false },
    }).then((r) => expect(r.status).to.eq(200));
    cy.apiReq("GET", "/api/clientes/", {
      token: profissional.access,
      clinicaId: a.clinicaId,
    }).then((r) => expect(r.status).to.eq(403));
    cy.apiReq("PATCH", `/api/colaboradores/${profissional.colaboradorId}/`, {
      token: a.admin.access,
      clinicaId: a.clinicaId,
      body: { pode_editar_agenda: true },
    }).then((r) => expect(r.status).to.eq(200));
    cy.apiReq("GET", "/api/clientes/", {
      token: profissional.access,
      clinicaId: a.clinicaId,
    }).then((r) => expect(r.status).to.eq(200));
  });

  it("profissional perde a leitura quando a clínica desliga a autonomia", () => {
    cy.apiReq("PATCH", "/api/clinica/autonomia_agenda/", {
      token: a.admin.access,
      clinicaId: a.clinicaId,
      body: { profissionais_podem_editar_agenda: false },
    }).then((r) => expect(r.status).to.eq(200));
    cy.apiReq("GET", "/api/clientes/", {
      token: profissional.access,
      clinicaId: a.clinicaId,
    }).then((r) => expect(r.status).to.eq(403));
    cy.apiReq("GET", "/api/auth/me/", { token: profissional.access }).then((r) => {
      const v = r.body.vinculos.find((x) => x.clinica_id === a.clinicaId);
      expect(v.profissionais_podem_editar_agenda).to.eq(false);
    });
    cy.apiReq("PATCH", "/api/clinica/autonomia_agenda/", {
      token: a.admin.access,
      clinicaId: a.clinicaId,
      body: { profissionais_podem_editar_agenda: true },
    }).then((r) => expect(r.status).to.eq(200));
  });

  it("autonomia_agenda exige o campo no corpo", () => {
    cy.apiReq("PATCH", "/api/clinica/autonomia_agenda/", {
      token: a.admin.access,
      clinicaId: a.clinicaId,
      body: {},
    }).then((r) => expect(r.status).to.eq(400));
  });
});

describe("API - configurações da clínica", () => {
  let ctx;

  before(() => {
    cy.novoContexto().then((c) => {
      ctx = c;
    });
  });

  it("lê e atualiza os dados da clínica", () => {
    cy.apiReq("GET", "/api/clinica/atual/", {
      token: ctx.admin.access,
      clinicaId: ctx.clinicaId,
    }).then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body.cnpj).to.eq(ctx.clinica.cnpj);
      expect(r.body.nome_fantasia).to.eq(ctx.clinica.nome_fantasia);
    });
    cy.apiReq("PATCH", "/api/clinica/atual/", {
      token: ctx.admin.access,
      clinicaId: ctx.clinicaId,
      body: {
        nome_fantasia: "Clinica Renomeada Cypress",
        telefone: "1133334444",
        endereco: "Rua Teste, 10 - Centro - Sao Paulo/SP",
      },
    }).then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body.nome_fantasia).to.eq("Clinica Renomeada Cypress");
      expect(r.body.endereco).to.eq("Rua Teste, 10 - Centro - Sao Paulo/SP");
    });
  });

  it("valida CNPJ, telefone, razão social e nome fantasia", () => {
    const requisicao = (body) =>
      cy.apiReq("PATCH", "/api/clinica/atual/", {
        token: ctx.admin.access,
        clinicaId: ctx.clinicaId,
        body,
      });
    requisicao({ cnpj: "11111111111111" }).then((r) => expect(r.status).to.eq(400));
    requisicao({ telefone: "12" }).then((r) => expect(r.status).to.eq(400));
    requisicao({ razao_social: "ab" }).then((r) => expect(r.status).to.eq(400));
    requisicao({ nome_fantasia: " " }).then((r) => expect(r.status).to.eq(400));
  });

  it("não permite alterar profissionais_podem_editar_agenda pelo endpoint atual", () => {
    cy.apiReq("PATCH", "/api/clinica/atual/", {
      token: ctx.admin.access,
      clinicaId: ctx.clinicaId,
      body: { profissionais_podem_editar_agenda: false },
    }).then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body.profissionais_podem_editar_agenda).to.eq(true);
    });
  });
});

describe("API - serviços, clientes e colaboradores", () => {
  let ctx;

  before(() => {
    cy.novoContexto().then((c) => {
      ctx = c;
    });
  });

  const opcoes = () => ({ token: ctx.admin.access, clinicaId: ctx.clinicaId });

  it("cria, lista, edita e inativa um serviço", () => {
    cy.criarServico(ctx, { nome: "Drenagem Cypress", preco: "220.50" }).then((s) => {
      expect(s.nome).to.eq("Drenagem Cypress");
      expect(Number(s.preco)).to.eq(220.5);
      cy.apiReq("GET", "/api/servicos/", opcoes()).then((r) => {
        expect(lista(r.body).map((x) => x.id)).to.include(s.id);
      });
      cy.apiReq("PATCH", `/api/servicos/${s.id}/`, {
        ...opcoes(),
        body: { preco: "250.00", duracao_padrao_minutos: 45 },
      }).then((r) => {
        expect(r.status).to.eq(200);
        expect(Number(r.body.preco)).to.eq(250);
        expect(r.body.duracao_padrao_minutos).to.eq(45);
      });
      cy.apiReq("PATCH", `/api/servicos/${s.id}/`, {
        ...opcoes(),
        body: { ativo: false },
      }).then((r) => {
        expect(r.status).to.eq(200);
        expect(r.body.ativo).to.eq(false);
      });
    });
  });

  it("valida preço, duração e nome do serviço", () => {
    const post = (body) => cy.apiReq("POST", "/api/servicos/", { ...opcoes(), body });
    post({ nome: "Preco Negativo", preco: "-1.00", duracao_padrao_minutos: 30 }).then((r) =>
      expect(r.status).to.eq(400)
    );
    post({ nome: "Duracao Zero", preco: "10.00", duracao_padrao_minutos: 0 }).then((r) =>
      expect(r.status).to.eq(400)
    );
    post({ nome: "   ", preco: "10.00", duracao_padrao_minutos: 30 }).then((r) =>
      expect(r.status).to.eq(400)
    );
    post({ preco: "10.00", duracao_padrao_minutos: 30 }).then((r) =>
      expect(r.status).to.eq(400)
    );
  });

  it("cria cliente com CPF e nome, normaliza e mascara o CPF na leitura", () => {
    cy.criarCliente(ctx).then((cliente) => {
      expect(cliente.usuario_nome).to.eq(cliente.nomeOriginal);
      expect(cliente.usuario_cpf).to.match(/^\*\*\*\.\d{3}\.\d{3}-\*\*$/);
      expect(cliente).to.not.have.property("cpf");
      expect(cliente.status_cadastro).to.be.a("string");
    });
  });

  it("impede cliente duplicado, CPF ausente, telefone e CEP inválidos", () => {
    cy.criarCliente(ctx).then((cliente) => {
      cy.apiReq("POST", "/api/clientes/", {
        ...opcoes(),
        body: {
          cpf: cliente.cpfOriginal,
          nome_completo: "Duplicado",
          telefone: gerarTelefone(),
          cep: "01310100",
          numero_endereco: "1",
        },
      }).then((r) => expect(r.status).to.eq(400));
    });
    cy.apiReq("POST", "/api/clientes/", {
      ...opcoes(),
      body: { nome_completo: "Sem CPF", telefone: gerarTelefone() },
    }).then((r) => expect(r.status).to.eq(400));
    cy.apiReq("POST", "/api/clientes/", {
      ...opcoes(),
      body: { cpf: gerarCpf(), nome_completo: "Tel Ruim", telefone: "12345" },
    }).then((r) => expect(r.status).to.eq(400));
    cy.apiReq("POST", "/api/clientes/", {
      ...opcoes(),
      body: {
        cpf: gerarCpf(),
        nome_completo: "CEP Ruim",
        telefone: gerarTelefone(),
        cep: "123",
      },
    }).then((r) => expect(r.status).to.eq(400));
  });

  it("edita o cliente, inativa por DELETE e bloqueia novo DELETE", () => {
    cy.criarCliente(ctx).then((cliente) => {
      cy.apiReq("PATCH", `/api/clientes/${cliente.id}/`, {
        ...opcoes(),
        body: { telefone: "11977776666", numero_endereco: "250" },
      }).then((r) => {
        expect(r.status).to.eq(200);
        expect(r.body.numero_endereco).to.eq("250");
      });
      cy.apiReq("DELETE", `/api/clientes/${cliente.id}/`, opcoes()).then((r) =>
        expect(r.status).to.eq(204)
      );
      cy.apiReq("GET", `/api/clientes/${cliente.id}/`, opcoes()).then((r) => {
        expect(r.status).to.eq(200);
        expect(r.body.status_cadastro).to.not.eq("ATIVO");
      });
      cy.apiReq("DELETE", `/api/clientes/${cliente.id}/`, opcoes()).then((r) =>
        expect(r.status).to.eq(400)
      );
    });
  });

  it("cadastra colaboradores com especialidades apenas para profissionais", () => {
    const roles = Cypress.env("roleIds");
    cy.apiReq("POST", "/api/colaboradores/", {
      ...opcoes(),
      body: {
        cpf: gerarCpf(),
        nome_completo: "Profissional Especialista",
        role: roles.PROFISSIONAL,
        ativo: true,
        pode_editar_agenda: true,
        especialidades: ["massoterapia", "drenagem"],
      },
    }).then((r) => {
      expect(r.status).to.eq(201);
      expect(r.body.role_nome).to.eq("PROFISSIONAL");
      expect(r.body.especialidades).to.have.members(["Massoterapia", "Drenagem"]);
    });
    cy.apiReq("POST", "/api/colaboradores/", {
      ...opcoes(),
      body: {
        cpf: gerarCpf(),
        nome_completo: "Secretaria Sem Especialidade",
        role: roles.SECRETARIO,
        ativo: true,
        pode_editar_agenda: false,
        especialidades: ["nao deve gravar"],
      },
    }).then((r) => {
      expect(r.status).to.eq(201);
      expect(r.body.especialidades).to.have.length(0);
    });
  });

  it("exige CPF no cadastro de colaborador e impede vínculo duplicado", () => {
    const roles = Cypress.env("roleIds");
    const cpf = gerarCpf();
    cy.apiReq("POST", "/api/colaboradores/", {
      ...opcoes(),
      body: { nome_completo: "Sem CPF", role: roles.SECRETARIO },
    }).then((r) => expect(r.status).to.eq(400));
    cy.apiReq("POST", "/api/colaboradores/", {
      ...opcoes(),
      body: { cpf, nome_completo: "Primeiro Vinculo", role: roles.SECRETARIO },
    }).then((r) => expect(r.status).to.eq(201));
    cy.apiReq("POST", "/api/colaboradores/", {
      ...opcoes(),
      body: { cpf, nome_completo: "Segundo Vinculo", role: roles.SECRETARIO },
    }).then((r) => expect(r.status).to.eq(400));
  });

  it("não permite rebaixar ou desativar o último administrador", () => {
    cy.apiReq("GET", "/api/colaboradores/", opcoes()).then((r) => {
      const admin = lista(r.body).find((c) => c.role_nome === "ADMIN");
      expect(admin).to.exist;
      cy.apiReq("PATCH", `/api/colaboradores/${admin.id}/`, {
        ...opcoes(),
        body: { ativo: false },
      }).then((resp) => expect(resp.status).to.eq(403));
      cy.apiReq("PATCH", `/api/colaboradores/${admin.id}/`, {
        ...opcoes(),
        body: { role: Cypress.env("roleIds").SECRETARIO },
      }).then((resp) => expect(resp.status).to.eq(403));
    });
  });

  it("desativa e reativa um colaborador sem agendamentos futuros", () => {
    cy.adicionarColaborador(ctx, "SECRETARIO").then((s) => {
      cy.apiReq("PATCH", `/api/colaboradores/${s.colaboradorId}/`, {
        ...opcoes(),
        body: { ativo: false },
      }).then((r) => {
        expect(r.status).to.eq(200);
        expect(r.body.ativo).to.eq(false);
      });
      cy.apiReq("GET", "/api/clientes/", {
        token: s.access,
        clinicaId: ctx.clinicaId,
      }).then((r) => expect(r.status).to.eq(403));
      cy.apiReq("PATCH", `/api/colaboradores/${s.colaboradorId}/`, {
        ...opcoes(),
        body: { ativo: true },
      }).then((r) => expect(r.body.ativo).to.eq(true));
    });
  });
});

describe("API - modelos de pacote e pacotes de clientes", () => {
  let ctx;
  let servico;
  let cliente;

  before(() => {
    cy.novoContexto().then((c) => {
      ctx = c;
    });
    cy.then(() => cy.criarServico(ctx)).then((s) => {
      servico = s;
    });
    cy.then(() => cy.criarCliente(ctx)).then((c) => {
      cliente = c;
    });
  });

  const opcoes = () => ({ token: ctx.admin.access, clinicaId: ctx.clinicaId });

  it("cria, edita e inativa um modelo de pacote", () => {
    cy.criarModeloPacote(ctx, servico.id, { nome: "Pacote Cypress 5", quantidade_sessoes: 5 }).then(
      (m) => {
        expect(m.servico_nome).to.eq(servico.nome);
        expect(m.quantidade_sessoes).to.eq(5);
        cy.apiReq("PATCH", `/api/modelos-pacote/${m.id}/`, {
          ...opcoes(),
          body: { valor_total: "999.90" },
        }).then((r) => {
          expect(r.status).to.eq(200);
          expect(Number(r.body.valor_total)).to.eq(999.9);
        });
        cy.apiReq("PATCH", `/api/modelos-pacote/${m.id}/`, {
          ...opcoes(),
          body: { ativo: false },
        }).then((r) => expect(r.body.ativo).to.eq(false));
      }
    );
  });

  it("valida valor negativo, quantidade inválida e nome vazio do modelo", () => {
    const post = (extra) =>
      cy.apiReq("POST", "/api/modelos-pacote/", {
        ...opcoes(),
        body: {
          nome: "Modelo Invalido",
          servico: servico.id,
          quantidade_sessoes: 3,
          valor_total: "100.00",
          ...extra,
        },
      });
    post({ valor_total: "-5.00" }).then((r) => expect(r.status).to.eq(400));
    post({ quantidade_sessoes: 0 }).then((r) => expect(r.status).to.eq(400));
    post({ nome: "  " }).then((r) => expect(r.status).to.eq(400));
  });

  it("vende um pacote, cria as sessões disponíveis e copia os dados do modelo", () => {
    cy.criarModeloPacote(ctx, servico.id, { quantidade_sessoes: 4, valor_total: "320.00" }).then(
      (modelo) => {
        cy.venderPacote(ctx, modelo, cliente.id).then((pacote) => {
          expect(pacote.status).to.eq("ATIVO");
          expect(pacote.quantidade_sessoes).to.eq(4);
          expect(pacote.sessoes_disponiveis).to.eq(4);
          expect(pacote.saldo_sessoes).to.eq(4);
          expect(Number(pacote.valor_total)).to.eq(320);
          expect(pacote.cliente_nome).to.eq(cliente.nomeOriginal);
        });
      }
    );
  });

  it("não vende modelo inativo nem modelo de outra clínica", () => {
    cy.criarModeloPacote(ctx, servico.id, { ativo: false }).then((modelo) => {
      cy.apiReq("POST", "/api/pacotes/", {
        ...opcoes(),
        body: {
          modelo: modelo.id,
          cliente: cliente.id,
          servico: servico.id,
          quantidade_sessoes: modelo.quantidade_sessoes,
          valor_total: modelo.valor_total,
        },
      }).then((r) => expect(r.status).to.eq(400));
    });
    cy.novoContexto().then((outra) => {
      cy.criarServico(outra).then((sOutra) => {
        cy.criarModeloPacote(outra, sOutra.id).then((mOutra) => {
          cy.apiReq("POST", "/api/pacotes/", {
            ...opcoes(),
            body: {
              modelo: mOutra.id,
              cliente: cliente.id,
              servico: servico.id,
              quantidade_sessoes: 3,
              valor_total: "100.00",
            },
          }).then((r) => expect(r.status).to.eq(400));
        });
      });
    });
  });

  it("filtra pacotes por cliente e status e valida filtros", () => {
    cy.apiReq("GET", "/api/pacotes/", { ...opcoes(), qs: { cliente: cliente.id } }).then((r) => {
      expect(r.status).to.eq(200);
      lista(r.body).forEach((p) => expect(p.cliente).to.eq(cliente.id));
    });
    cy.apiReq("GET", "/api/pacotes/", { ...opcoes(), qs: { status: "ATIVO" } }).then((r) => {
      expect(r.status).to.eq(200);
      lista(r.body).forEach((p) => expect(p.status).to.eq("ATIVO"));
    });
    cy.apiReq("GET", "/api/pacotes/", { ...opcoes(), qs: { status: "XYZ" } }).then((r) =>
      expect(r.status).to.eq(400)
    );
    cy.apiReq("GET", "/api/pacotes/", { ...opcoes(), qs: { cliente: "abc" } }).then((r) =>
      expect(r.status).to.eq(400)
    );
  });
});

describe("API - agendamentos", () => {
  let ctx;
  let profissional;
  let servico;
  let cliente;
  let outroCliente;
  let dia = 2;

  const proximoDia = () => {
    dia += 1;
    return dia;
  };

  const corpo = (extra = {}) => {
    const d = proximoDia();
    return {
      cliente: cliente.id,
      profissional: profissional.colaboradorId,
      servico: servico.id,
      data_hora_inicio: isoFuturo(d, 9, 0),
      data_hora_fim: isoFuturo(d, 10, 0),
      observacoes: "Agendamento Cypress",
      ...extra,
    };
  };

  before(() => {
    cy.novoContexto().then((c) => {
      ctx = c;
    });
    cy.then(() => cy.adicionarColaborador(ctx, "PROFISSIONAL")).then((p) => {
      profissional = p;
    });
    cy.then(() => cy.criarServico(ctx)).then((s) => {
      servico = s;
    });
    cy.then(() => cy.criarCliente(ctx)).then((c) => {
      cliente = c;
    });
    cy.then(() => cy.criarCliente(ctx)).then((c) => {
      outroCliente = c;
    });
  });

  const opcoes = () => ({ token: ctx.admin.access, clinicaId: ctx.clinicaId });

  it("cria sempre como CONFIRMADO e ignora status enviado pelo cliente", () => {
    cy.criarAgendamento(ctx, corpo({ status: "PENDENTE", resultado: "FALTA" })).then((r) => {
      expect(r.status).to.eq(201);
      expect(r.body.status).to.eq("CONFIRMADO");
      expect(r.body.resultado).to.eq("AGUARDANDO_RESULTADO");
      expect(r.body.cliente_nome).to.eq(cliente.nomeOriginal);
      expect(r.body.preco_acordado).to.eq(null);
    });
  });

  it("grava o preço acordado sem alterar o preço do procedimento", () => {
    cy.criarAgendamento(ctx, corpo({ preco_acordado: "180.00" })).then((r) => {
      expect(r.status).to.eq(201);
      expect(Number(r.body.preco_acordado)).to.eq(180);
      expect(Number(r.body.servico_preco)).to.eq(Number(servico.preco));
    });
    cy.apiReq("GET", `/api/servicos/${servico.id}/`, opcoes()).then((r) => {
      expect(Number(r.body.preco)).to.eq(Number(servico.preco));
    });
  });

  it("aceita preço acordado zero e rejeita valor negativo", () => {
    cy.criarAgendamento(ctx, corpo({ preco_acordado: "0.00" })).then((r) => {
      expect(r.status).to.eq(201);
      expect(Number(r.body.preco_acordado)).to.eq(0);
    });
    cy.criarAgendamento(ctx, corpo({ preco_acordado: "-10.00" })).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body).to.have.property("preco_acordado");
    });
  });

  it("retorna 409 para conflito de horário do mesmo profissional", () => {
    const base = corpo();
    cy.criarAgendamento(ctx, base).then((r) => expect(r.status).to.eq(201));
    cy.criarAgendamento(ctx, {
      ...base,
      cliente: outroCliente.id,
    }).then((r) => {
      expect(r.status).to.eq(409);
      expect(JSON.stringify(r.body)).to.be.a("string");
    });
  });

  it("permite horários consecutivos sem sobreposição", () => {
    const d = proximoDia();
    cy.criarAgendamento(ctx, {
      ...corpo(),
      data_hora_inicio: isoFuturo(d, 9, 0),
      data_hora_fim: isoFuturo(d, 10, 0),
    }).then((r) => expect(r.status).to.eq(201));
    cy.criarAgendamento(ctx, {
      ...corpo(),
      cliente: outroCliente.id,
      data_hora_inicio: isoFuturo(d, 10, 0),
      data_hora_fim: isoFuturo(d, 11, 0),
    }).then((r) => expect(r.status).to.eq(201));
  });

  it("rejeita cliente inativo, serviço inativo e profissional que não atende", () => {
    cy.criarCliente(ctx).then((inativo) => {
      cy.apiReq("DELETE", `/api/clientes/${inativo.id}/`, opcoes()).then(() => {
        cy.criarAgendamento(ctx, corpo({ cliente: inativo.id })).then((r) =>
          expect(r.status).to.eq(400)
        );
      });
    });
    cy.criarServico(ctx, { ativo: false }).then((s) => {
      cy.criarAgendamento(ctx, corpo({ servico: s.id })).then((r) =>
        expect(r.status).to.eq(400)
      );
    });
    cy.adicionarColaborador(ctx, "SECRETARIO").then((sec) => {
      cy.criarAgendamento(ctx, corpo({ profissional: sec.colaboradorId })).then((r) =>
        expect(r.status).to.eq(400)
      );
    });
  });

  it("não aceita agendamentos de recursos de outra clínica", () => {
    cy.novoContexto().then((outra) => {
      cy.criarCliente(outra).then((clienteOutra) => {
        cy.criarAgendamento(ctx, corpo({ cliente: clienteOutra.id })).then((r) =>
          expect(r.status).to.eq(400)
        );
      });
    });
  });

  it("proíbe DELETE e ignora PATCH de status", () => {
    cy.criarAgendamento(ctx, corpo()).then((criado) => {
      cy.apiReq("DELETE", `/api/agendamentos/${criado.body.id}/`, opcoes()).then((r) =>
        expect(r.status).to.eq(405)
      );
      cy.apiReq("PATCH", `/api/agendamentos/${criado.body.id}/`, {
        ...opcoes(),
        body: { status: "CONCLUIDO", observacoes: "Observacao editada" },
      }).then((r) => {
        expect(r.status).to.eq(200);
        expect(r.body.status).to.eq("CONFIRMADO");
        expect(r.body.observacoes).to.eq("Observacao editada");
      });
    });
  });

  it("cancela com motivo obrigatório, trunca em 50 caracteres e bloqueia repetição", () => {
    cy.criarAgendamento(ctx, corpo()).then((criado) => {
      const id = criado.body.id;
      cy.apiReq("POST", `/api/agendamentos/${id}/cancelar/`, { ...opcoes(), body: {} }).then(
        (r) => expect(r.status).to.eq(400)
      );
      cy.apiReq("POST", `/api/agendamentos/${id}/cancelar/`, {
        ...opcoes(),
        body: { motivo: "   " },
      }).then((r) => expect(r.status).to.eq(400));
      cy.apiReq("POST", `/api/agendamentos/${id}/cancelar/`, {
        ...opcoes(),
        body: { motivo: "M".repeat(80) },
      }).then((r) => expect(r.status).to.eq(200));
      cy.apiReq("GET", `/api/agendamentos/${id}/`, opcoes()).then((r) => {
        expect(r.body.status).to.eq("CANCELADO");
        expect(r.body.motivo_cancelamento).to.have.length(50);
      });
      cy.apiReq("POST", `/api/agendamentos/${id}/cancelar/`, {
        ...opcoes(),
        body: { motivo: "De novo" },
      }).then((r) => expect(r.status).to.eq(400));
    });
  });

  it("libera o horário após o cancelamento", () => {
    const base = corpo();
    cy.criarAgendamento(ctx, base).then((criado) => {
      cy.apiReq("POST", `/api/agendamentos/${criado.body.id}/cancelar/`, {
        ...opcoes(),
        body: { motivo: "Cliente desistiu" },
      }).then((r) => expect(r.status).to.eq(200));
      cy.criarAgendamento(ctx, { ...base, cliente: outroCliente.id }).then((r) =>
        expect(r.status).to.eq(201)
      );
    });
  });

  it("registra falta em agendamento confirmado e impede registrar duas vezes", () => {
    cy.criarAgendamento(ctx, corpo()).then((criado) => {
      const id = criado.body.id;
      cy.apiReq("POST", `/api/agendamentos/${id}/registrar_falta/`, {
        ...opcoes(),
        body: {},
      }).then((r) => expect(r.status).to.eq(200));
      cy.apiReq("GET", `/api/agendamentos/${id}/`, opcoes()).then((r) =>
        expect(r.body.resultado).to.eq("FALTA")
      );
      cy.apiReq("POST", `/api/agendamentos/${id}/registrar_falta/`, {
        ...opcoes(),
        body: {},
      }).then((r) => expect(r.status).to.eq(400));
    });
  });

  it("filtra a listagem por período, profissional, cliente e status", () => {
    const d = proximoDia();
    cy.criarAgendamento(ctx, {
      ...corpo(),
      cliente: outroCliente.id,
      data_hora_inicio: isoFuturo(d, 14, 0),
      data_hora_fim: isoFuturo(d, 15, 0),
    }).then((criado) => {
      expect(criado.status).to.eq(201);
      cy.apiReq("GET", "/api/agendamentos/", {
        ...opcoes(),
        qs: {
          data_inicio: dataParaInput(d - 1),
          data_fim: dataParaInput(d + 1),
        },
      }).then((r) => {
        expect(r.status).to.eq(200);
        expect(Array.isArray(r.body)).to.eq(true);
        expect(r.body.map((a) => a.id)).to.include(criado.body.id);
      });
      cy.apiReq("GET", "/api/agendamentos/", {
        ...opcoes(),
        qs: { cliente: outroCliente.id, profissional: profissional.colaboradorId },
      }).then((r) => {
        expect(r.body.length).to.be.greaterThan(0);
        r.body.forEach((a) => {
          expect(a.cliente).to.eq(outroCliente.id);
          expect(a.profissional).to.eq(profissional.colaboradorId);
        });
      });
      cy.apiReq("GET", "/api/agendamentos/", { ...opcoes(), qs: { status: "CANCELADO" } }).then(
        (r) => {
          r.body.forEach((a) => expect(a.status).to.eq("CANCELADO"));
        }
      );
    });
    cy.apiReq("GET", "/api/agendamentos/", { ...opcoes(), qs: { status: "XYZ" } }).then((r) =>
      expect(r.status).to.eq(400)
    );
    cy.apiReq("GET", "/api/agendamentos/", { ...opcoes(), qs: { profissional: "abc" } }).then(
      (r) => expect(r.status).to.eq(400)
    );
    cy.apiReq("GET", "/api/agendamentos/", { ...opcoes(), qs: { data_inicio: "data-ruim" } }).then(
      (r) => expect(r.status).to.eq(400)
    );
  });

  it("profissional agenda apenas na própria agenda e não cancela nem registra falta", () => {
    cy.criarAgendamento(ctx, corpo(), profissional.access).then((r) => {
      expect(r.status).to.eq(201);
      cy.apiReq("POST", `/api/agendamentos/${r.body.id}/cancelar/`, {
        token: profissional.access,
        clinicaId: ctx.clinicaId,
        body: { motivo: "Tentativa" },
      }).then((resp) => expect(resp.status).to.eq(403));
      cy.apiReq("POST", `/api/agendamentos/${r.body.id}/registrar_falta/`, {
        token: profissional.access,
        clinicaId: ctx.clinicaId,
        body: {},
      }).then((resp) => expect(resp.status).to.eq(403));
    });
    cy.adicionarColaborador(ctx, "PROFISSIONAL").then((outroProf) => {
      cy.criarAgendamento(
        ctx,
        corpo({ profissional: outroProf.colaboradorId }),
        profissional.access
      ).then((r) => expect(r.status).to.eq(403));
    });
  });
});

describe("API - sessões de pacote nos agendamentos", () => {
  let ctx;
  let profissional;
  let servico;
  let cliente;
  let modelo;
  let dia = 40;

  const proximoDia = () => {
    dia += 1;
    return dia;
  };

  const corpo = (pacote, extra = {}) => {
    const d = proximoDia();
    return {
      cliente: cliente.id,
      profissional: profissional.colaboradorId,
      servico: servico.id,
      pacote_origem: pacote.id,
      data_hora_inicio: isoFuturo(d, 9, 0),
      data_hora_fim: isoFuturo(d, 10, 0),
      ...extra,
    };
  };

  const opcoes = () => ({ token: ctx.admin.access, clinicaId: ctx.clinicaId });

  const pacoteAtual = (id) =>
    cy.apiReq("GET", `/api/pacotes/${id}/`, opcoes()).then((r) => r.body);

  before(() => {
    cy.novoContexto().then((c) => {
      ctx = c;
    });
    cy.then(() => cy.adicionarColaborador(ctx, "PROFISSIONAL")).then((p) => {
      profissional = p;
    });
    cy.then(() => cy.criarServico(ctx)).then((s) => {
      servico = s;
    });
    cy.then(() => cy.criarCliente(ctx)).then((c) => {
      cliente = c;
    });
    cy.then(() => cy.criarModeloPacote(ctx, servico.id, { quantidade_sessoes: 3 })).then((m) => {
      modelo = m;
    });
  });

  it("reserva uma sessão ao agendar e libera ao cancelar", () => {
    cy.venderPacote(ctx, modelo, cliente.id).then((pacote) => {
      cy.criarAgendamento(ctx, corpo(pacote)).then((r) => {
        expect(r.status).to.eq(201);
        expect(r.body.sessao_pacote_status).to.eq("AGENDADA");
        pacoteAtual(pacote.id).then((p) => expect(p.sessoes_disponiveis).to.eq(2));
        cy.apiReq("POST", `/api/agendamentos/${r.body.id}/cancelar/`, {
          ...opcoes(),
          body: { motivo: "Reagendar" },
        }).then((c) => expect(c.status).to.eq(200));
        pacoteAtual(pacote.id).then((p) => expect(p.sessoes_disponiveis).to.eq(3));
      });
    });
  });

  it("rejeita pacote de outro cliente, de outro serviço e sem saldo", () => {
    cy.criarCliente(ctx).then((outro) => {
      cy.venderPacote(ctx, modelo, outro.id).then((pacoteOutro) => {
        cy.criarAgendamento(ctx, corpo(pacoteOutro)).then((r) =>
          expect(r.status).to.eq(400)
        );
      });
    });
    cy.criarServico(ctx).then((outroServico) => {
      cy.venderPacote(ctx, modelo, cliente.id).then((pacote) => {
        cy.criarAgendamento(ctx, corpo(pacote, { servico: outroServico.id })).then((r) =>
          expect(r.status).to.eq(400)
        );
      });
    });
    cy.criarModeloPacote(ctx, servico.id, { quantidade_sessoes: 1 }).then((modeloUm) => {
      cy.venderPacote(ctx, modeloUm, cliente.id).then((pacoteUm) => {
        cy.criarAgendamento(ctx, corpo(pacoteUm)).then((r) => expect(r.status).to.eq(201));
        cy.criarAgendamento(ctx, corpo(pacoteUm)).then((r) =>
          expect([400, 409]).to.include(r.status)
        );
      });
    });
  });

  it("exige decisão PRESERVAR ou PERDER ao registrar falta com sessão agendada", () => {
    cy.venderPacote(ctx, modelo, cliente.id).then((pacote) => {
      cy.criarAgendamento(ctx, corpo(pacote)).then((r) => {
        const id = r.body.id;
        cy.apiReq("POST", `/api/agendamentos/${id}/registrar_falta/`, {
          ...opcoes(),
          body: {},
        }).then((resp) => expect(resp.status).to.eq(400));
        cy.apiReq("POST", `/api/agendamentos/${id}/registrar_falta/`, {
          ...opcoes(),
          body: { decisao_sessao: "TALVEZ" },
        }).then((resp) => expect(resp.status).to.eq(400));
        cy.apiReq("POST", `/api/agendamentos/${id}/registrar_falta/`, {
          ...opcoes(),
          body: { decisao_sessao: "PRESERVAR" },
        }).then((resp) => expect(resp.status).to.eq(200));
        pacoteAtual(pacote.id).then((p) => expect(p.sessoes_disponiveis).to.eq(3));
      });
    });
  });

  it("perde a sessão quando a decisão é PERDER", () => {
    cy.venderPacote(ctx, modelo, cliente.id).then((pacote) => {
      cy.criarAgendamento(ctx, corpo(pacote)).then((r) => {
        cy.apiReq("POST", `/api/agendamentos/${r.body.id}/registrar_falta/`, {
          ...opcoes(),
          body: { decisao_sessao: "PERDER" },
        }).then((resp) => expect(resp.status).to.eq(200));
        pacoteAtual(pacote.id).then((p) => {
          expect(p.sessoes_disponiveis).to.eq(2);
        });
      });
    });
  });
});