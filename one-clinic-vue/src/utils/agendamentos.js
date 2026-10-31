export const FUSO_CLINICA = "America/Sao_Paulo";

const formatadorPartes = new Intl.DateTimeFormat("en-CA", {
  timeZone: FUSO_CLINICA,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const partesNoFuso = (instante) => {
  const mapa = {};

  formatadorPartes.formatToParts(instante).forEach((parte) => {
    if (parte.type !== "literal") mapa[parte.type] = parte.value;
  });

  return mapa;
};

const deslocamentoMinutos = (instanteMs) => {
  const partes = partesNoFuso(new Date(instanteMs));
  const comoUtc = Date.UTC(
    Number(partes.year),
    Number(partes.month) - 1,
    Number(partes.day),
    Number(partes.hour),
    Number(partes.minute),
    Number(partes.second)
  );

  return Math.round((comoUtc - Math.floor(instanteMs / 1000) * 1000) / 60000);
};

export const isoParaCampos = (iso) => {
  if (!iso) return { data: "", hora: "" };

  const instante = new Date(iso);

  if (Number.isNaN(instante.getTime())) return { data: "", hora: "" };

  const partes = partesNoFuso(instante);

  return {
    data: `${partes.year}-${partes.month}-${partes.day}`,
    hora: `${partes.hour}:${partes.minute}`,
  };
};

export const camposParaIso = (data, hora) => {
  if (!data || !hora) return "";

  const [ano, mes, dia] = String(data).split("-").map(Number);
  const [h, m] = String(hora).split(":").map(Number);

  if ([ano, mes, dia, h, m].some((valor) => Number.isNaN(valor))) return "";

  const relogio = Date.UTC(ano, mes - 1, dia, h, m, 0);

  let candidato = relogio - deslocamentoMinutos(relogio) * 60000;
  candidato = relogio - deslocamentoMinutos(candidato) * 60000;

  const deslocamento = deslocamentoMinutos(candidato);
  const sinal = deslocamento < 0 ? "-" : "+";
  const absoluto = Math.abs(deslocamento);
  const horasDesloc = String(Math.floor(absoluto / 60)).padStart(2, "0");
  const minutosDesloc = String(absoluto % 60).padStart(2, "0");

  return `${data}T${String(hora).slice(0, 5)}:00${sinal}${horasDesloc}:${minutosDesloc}`;
};

export const diferencaMinutos = (dataInicio, horaInicio, dataFim, horaFim) => {
  const inicio = camposParaIso(dataInicio, horaInicio);
  const fim = camposParaIso(dataFim, horaFim);

  if (!inicio || !fim) return 0;

  return Math.round((new Date(fim) - new Date(inicio)) / 60000);
};

export const somarMinutosAoHorario = (hora, minutos) => {
  if (!hora || !Number.isFinite(Number(minutos)) || Number(minutos) <= 0) {
    return "";
  }

  const [h, m] = String(hora).split(":").map(Number);

  if (Number.isNaN(h) || Number.isNaN(m)) return "";

  const total = h * 60 + m + Number(minutos);

  if (total >= 24 * 60) return "";

  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(
    total % 60
  ).padStart(2, "0")}`;
};

export const hojeNoFuso = (instante = new Date()) =>
  isoParaCampos(instante.toISOString()).data;

export const somarDias = (data, dias) => {
  const [ano, mes, dia] = String(data).split("-").map(Number);
  const base = new Date(Date.UTC(ano, mes - 1, dia + dias));

  return [
    base.getUTCFullYear(),
    String(base.getUTCMonth() + 1).padStart(2, "0"),
    String(base.getUTCDate()).padStart(2, "0"),
  ].join("-");
};

export const inicioDaSemana = (data) => {
  const [ano, mes, dia] = String(data).split("-").map(Number);
  const diaSemana = new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();

  return somarDias(data, -diaSemana);
};

export const formatarDataBR = (data) => {
  if (!data) return "";

  const partes = String(data).split("-");

  if (partes.length !== 3) return data;

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

export const rotuloDia = (data, hoje) => {
  if (!data) return "";

  const [ano, mes, dia] = data.split("-").map(Number);
  const nome = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(ano, mes - 1, dia)));

  const capitalizado = nome.charAt(0).toUpperCase() + nome.slice(1);
  const base = `${capitalizado}, ${formatarDataBR(data)}`;

  if (data === hoje) return `Hoje • ${base}`;
  if (data === somarDias(hoje, 1)) return `Amanhã • ${base}`;
  if (data === somarDias(hoje, -1)) return `Ontem • ${base}`;

  return base;
};

export const formatarMoeda = (valor) => {
  const numero = Number(valor);

  if (valor === null || valor === undefined || valor === "" || Number.isNaN(numero)) {
    return "—";
  }

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

export const formatarDuracao = (minutos) => {
  const total = Number(minutos);

  if (!Number.isFinite(total) || total <= 0) return "—";

  const horas = Math.floor(total / 60);
  const resto = total % 60;

  if (!horas) return `${resto} min`;
  if (!resto) return `${horas} h`;

  return `${horas} h ${String(resto).padStart(2, "0")} min`;
};

export const interpretarPreco = (texto) => {
  if (texto === null || texto === undefined) return { vazio: true, valor: null };

  const limpo = String(texto)
    .replace(/[R$\s]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");

  if (limpo === "") return { vazio: true, valor: null };

  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return { vazio: false, valor: null };

  const numero = Number(limpo);

  if (!Number.isFinite(numero) || numero < 0 || numero >= 100000000) {
    return { vazio: false, valor: null };
  }

  return { vazio: false, valor: numero.toFixed(2) };
};

export const precoParaCampo = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "";

  const numero = Number(valor);

  if (Number.isNaN(numero)) return "";

  return numero.toFixed(2).replace(".", ",");
};

export const gerarIniciais = (nome) => {
  if (!nome) return "";

  return String(nome)
    .split(" ")
    .filter(Boolean)
    .map((parte) => parte[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

export const ROTULOS_STATUS = {
  pendente: "Pendente",
  confirmado: "Confirmado",
  em_andamento: "Em andamento",
  aguardando: "Aguardando conclusão",
  concluido: "Concluído",
  falta: "Falta",
  cancelado: "Cancelado",
};

export const formatarStatus = (status) => ROTULOS_STATUS[status] || status;

export const calcularStatusVisual = (registro, agora = new Date()) => {
  if (registro.status === "CANCELADO") return "cancelado";

  if (registro.status === "CONCLUIDO") {
    return registro.resultado === "FALTA" ? "falta" : "concluido";
  }

  if (registro.status === "PENDENTE") return "pendente";

  const inicio = new Date(registro.data_hora_inicio);
  const fim = new Date(registro.data_hora_fim);

  if (agora >= fim) return "aguardando";
  if (agora >= inicio) return "em_andamento";

  return "confirmado";
};

export const normalizarAgendamento = (registro, agora = new Date()) => {
  const inicio = isoParaCampos(registro.data_hora_inicio);
  const fim = isoParaCampos(registro.data_hora_fim);
  const duracao = Math.round(
    (new Date(registro.data_hora_fim) - new Date(registro.data_hora_inicio)) /
      60000
  );

  return {
    id: registro.id,
    cliente_id: registro.cliente,
    servico_id: registro.servico,
    profissional_id: registro.profissional,
    pacote_id: registro.pacote_origem ?? "",
    pacoteNome: registro.pacote_nome || "",
    sessaoPacoteStatus: registro.sessao_pacote_status || "",
    dataInicio: inicio.data,
    horaInicio: inicio.hora,
    dataFim: fim.data,
    horaFim: fim.hora,
    duracaoMinutos: Number.isFinite(duracao) ? duracao : 0,
    cliente: registro.cliente_nome || "Cliente não identificado",
    clienteTelefone: registro.cliente_telefone || "",
    clienteCpf: "",
    servico: registro.servico_nome || "Procedimento não identificado",
    servicoPreco:
      registro.servico_preco === undefined || registro.servico_preco === null
        ? null
        : Number(registro.servico_preco),
    servicoDuracaoMinutos: registro.servico_duracao_minutos ?? null,
    precoAcordado:
      registro.preco_acordado === undefined || registro.preco_acordado === null
        ? null
        : Number(registro.preco_acordado),
    valorCobrado:
      registro.preco_acordado !== undefined && registro.preco_acordado !== null
        ? Number(registro.preco_acordado)
        : registro.servico_preco === undefined || registro.servico_preco === null
        ? null
        : Number(registro.servico_preco),
    profissional: registro.profissional_nome || "Profissional não identificado",
    statusApi: registro.status,
    resultado: registro.resultado,
    motivoCancelamento: registro.motivo_cancelamento || "",
    observacoes: registro.observacoes || "",
    criadoEm: registro.created_at || "",
    status: calcularStatusVisual(registro, agora),
    editavel: ["PENDENTE", "CONFIRMADO"].includes(registro.status),
    faltaRegistravel:
      ["PENDENTE", "CONFIRMADO"].includes(registro.status) ||
      (registro.status === "CONCLUIDO" && registro.resultado !== "FALTA"),
    corrigeConcluido: registro.status === "CONCLUIDO",
  };
};

const CAMPOS_ROTULOS = {
  cliente: "Cliente",
  profissional: "Profissional",
  servico: "Procedimento",
  pacote_origem: "Pacote",
  data_hora_inicio: "Início",
  data_hora_fim: "Término",
  motivo: "Motivo",
  decisao_sessao: "Decisão sobre a sessão",
  justificativa: "Justificativa",
  observacoes: "Observações",
  preco_acordado: "Valor do agendamento",
  resolucao_conflito: "Conflito",
  non_field_errors: "",
};

const extrairMensagens = (dados) => {
  if (dados === null || dados === undefined) return [];

  if (typeof dados === "string") return [dados];

  if (Array.isArray(dados)) {
    return dados.flatMap((item) => extrairMensagens(item));
  }

  if (typeof dados === "object") {
    return Object.entries(dados).flatMap(([campo, valor]) => {
      if (campo === "conflitos_confirmados" || campo === "conflitos_pendentes") {
        return [];
      }

      const mensagens = extrairMensagens(valor);

      if (campo === "detail" || campo === "non_field_errors") return mensagens;

      const rotulo = CAMPOS_ROTULOS[campo];

      return mensagens.map((mensagem) =>
        rotulo ? `${rotulo}: ${mensagem}` : mensagem
      );
    });
  }

  return [];
};

export const interpretarErro = (erro, mensagemPadrao) => {
  const resposta = erro?.response;

  if (!resposta) {
    return {
      tipo: "erro",
      titulo: "Sem conexão com o servidor",
      mensagem:
        "Não foi possível falar com o servidor. Verifique sua conexão e tente novamente.",
      detalhe: "",
      status: 0,
    };
  }

  const mensagens = extrairMensagens(resposta.data).filter(Boolean);
  const detalheServidor = mensagens[0] || "";

  if (resposta.status === 409) {
    const exigeResolucao = Array.isArray(resposta.data?.opcoes);

    return {
      tipo: "conflito",
      titulo: "Conflito de horário",
      mensagem:
        "Este horário possui um conflito com outro agendamento. Escolha outro horário para continuar.",
      detalhe: exigeResolucao
        ? "Há um agendamento pendente neste mesmo horário. Verifique a agenda ou escolha outro horário."
        : detalheServidor,
      status: 409,
    };
  }

  if (resposta.status === 403) {
    return {
      tipo: "erro",
      titulo: "Ação não permitida",
      mensagem:
        detalheServidor || "Você não tem permissão para realizar esta ação.",
      detalhe: "",
      status: 403,
    };
  }

  if (resposta.status === 401) {
    return {
      tipo: "erro",
      titulo: "Sessão expirada",
      mensagem: "Sua sessão expirou. Entre novamente para continuar.",
      detalhe: "",
      status: 401,
    };
  }

  if (resposta.status === 404) {
    return {
      tipo: "erro",
      titulo: "Registro não encontrado",
      mensagem:
        "Este agendamento não foi encontrado. Atualize a página e tente novamente.",
      detalhe: "",
      status: 404,
    };
  }

  if (resposta.status === 429) {
    return {
      tipo: "erro",
      titulo: "Muitas requisições",
      mensagem: "Aguarde alguns instantes antes de tentar novamente.",
      detalhe: "",
      status: 429,
    };
  }

  if (resposta.status >= 500) {
    return {
      tipo: "erro",
      titulo: "Erro no servidor",
      mensagem:
        "Ocorreu um erro inesperado no servidor. Tente novamente em instantes.",
      detalhe: "",
      status: resposta.status,
    };
  }

  return {
    tipo: "erro",
    titulo: "Não foi possível concluir",
    mensagem: detalheServidor || mensagemPadrao,
    detalhe: mensagens.slice(1).join(" "),
    status: resposta.status,
  };
};