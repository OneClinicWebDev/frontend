<template>
  <div class="page-container">
    <main class="page-content">
      <div class="action-panel">
        <div class="top-row">
          <div class="search-input-wrapper">
            <i class="pi pi-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              :placeholder="placeholderBusca"
              class="search-input"
            />
          </div>
          <button class="btn-novo" @click="abrirModalCriacao">
            <i class="pi pi-plus"></i> Novo Atendimento
          </button>
        </div>

        <div class="filters-row">
          <div class="filter-group">
            <span class="filter-label"><i class="pi pi-calendar"></i> Período:</span>
            <div class="chips-container">
              <button
                v-for="item in periodosBusca"
                :key="item.value"
                :class="['chip chip-periodo', { active: periodo === item.value }]"
                @click="periodo = item.value"
              >
                {{ item.label }}
              </button>
            </div>
            <div v-if="periodo === 'personalizado'" class="periodo-datas">
              <input
                v-model="dataDe"
                type="date"
                class="date-input"
                aria-label="Data inicial"
              />
              <span class="date-separator">até</span>
              <input
                v-model="dataAte"
                type="date"
                class="date-input"
                aria-label="Data final"
              />
            </div>
          </div>
        </div>

        <div class="filters-row">
          <div class="filter-group">
            <span class="filter-label"><i class="pi pi-filter"></i> Buscar em:</span>
            <div class="chips-container">
              <button
                v-for="campo in camposBusca"
                :key="campo.value"
                :class="['chip', { active: camposAtivos.includes(campo.value) }]"
                @click="toggleCampo(campo.value)"
              >
                {{ campo.label }}
              </button>
            </div>
          </div>
          <div class="divider"></div>
          <div class="filter-group">
            <span class="filter-label"><i class="pi pi-check-circle"></i> Status:</span>
            <div class="chips-container">
              <button
                v-for="status in statusBusca"
                :key="status.value"
                :class="['chip chip-status', { active: filtroStatus === status.value }]"
                @click="filtroStatus = status.value"
              >
                {{ status.label }}
              </button>
            </div>
          </div>
          <button class="btn-limpar" @click="limparFiltros" v-if="temFiltroAtivo">
            <i class="pi pi-filter-slash"></i> Limpar
          </button>
        </div>
      </div>

      <div v-if="mensagemPeriodo" class="status-banner erro" role="alert">
        <i class="pi pi-exclamation-triangle"></i>
        <span>{{ mensagemPeriodo }}</span>
      </div>

      <div v-else-if="erroCarregamento" class="status-banner erro" role="alert">
        <i class="pi pi-exclamation-triangle"></i>
        <span>{{ erroCarregamento }}</span>
        <button type="button" class="banner-acao" @click="recarregar">
          Tentar novamente
        </button>
      </div>

      <div v-else-if="carregando" class="status-banner" role="status">
        <i class="pi pi-spin pi-spinner"></i>
        <span>Carregando atendimentos...</span>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">{{ totalFiltrados }}</span>
          <span class="stat-label">Atendimentos na Seleção</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ atendimentosHoje }}</span>
          <span class="stat-label">Agendados para Hoje</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ atendimentosAndamento }}</span>
          <span class="stat-label">Em Andamento</span>
        </div>
      </div>

      <section v-for="grupo in grupos" :key="grupo.data" class="dia-grupo">
        <h3 class="dia-titulo">
          <i class="pi pi-calendar"></i>
          {{ grupo.rotulo }}
          <span class="dia-contagem">{{ grupo.itens.length }}</span>
        </h3>

        <TransitionGroup name="list" tag="div" class="atendimentos-grid">
          <AtendimentoCard
            v-for="atendimento in grupo.itens"
            :key="atendimento.id"
            :atendimento="atendimento"
            :pode-editar="podeEditarAgenda"
            :pode-encerrar="podeGerenciar"
            @detalhes="abrirModalDetalhes"
            @editar="abrirModalEdicao"
            @cancelar="abrirAcao('cancelar', $event)"
            @falta="abrirAcao('falta', $event)"
            @concluir="abrirAcao('concluir', $event)"
          />
        </TransitionGroup>
      </section>

      <div v-if="!grupos.length && !carregando" class="empty-state">
        <i class="pi pi-calendar-times empty-icon"></i>
        <p>Nenhum atendimento encontrado com os filtros atuais.</p>
      </div>
    </main>

    <AtendimentoModal
      :is-open="detalhesAberto"
      :atendimento="atendimentoDetalhe"
      :pode-editar="podeEditarAgenda"
      :pode-encerrar="podeGerenciar"
      @close="fecharDetalhes"
      @editar="abrirModalEdicao"
      @cancelar="abrirAcao('cancelar', $event)"
      @falta="abrirAcao('falta', $event)"
      @concluir="abrirAcao('concluir', $event)"
    />

    <AgendaFormModal
      :isOpen="formAberto"
      :editing="editando"
      :form="form"
      :clientesBD="clientesBD"
      :servicosBD="servicosBD"
      :profissionaisBD="profissionaisBD"
      :isValid="formValido"
      :salvando="salvando"
      :alerta="alertaForm"
      :avisosAcesso="avisosAcesso"
      :somenteLeitura="somenteLeitura"
      :edicaoParcial="edicaoParcialForm"
      :mensagemSomenteLeitura="mensagemSomenteLeitura"
      :permitirCancelar="permitirAcoesEncerramento"
      :permitirFalta="permitirFaltaForm"
      :permitirConcluir="permitirConcluirForm"
      @close="fecharFormulario"
      @save="salvarAtendimento"
      @cancelar-agendamento="abrirAcao('cancelar')"
      @registrar-falta="abrirAcao('falta')"
      @concluir-agendamento="abrirAcao('concluir')"
      @limpar-alerta="alertaForm = null"
      @notify="handleNotify"
    />

    <AgendaAcaoModal
      :isOpen="acao.aberto"
      :modo="acao.modo"
      :agendamento="acao.item"
      :processando="processandoAcao"
      :erro="acao.erro"
      @close="fecharAcao"
      @confirmar="confirmarAcao"
    />

    <Transition name="toast">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <i
          :class="
            toast.type === 'error' ? 'pi pi-exclamation-circle' : 'pi pi-check-circle'
          "
        ></i>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import AtendimentoCard from "./components/AtendimentoCard.vue";
import AtendimentoModal from "./components/AtendimentoModal.vue";
import AgendaFormModal from "../Agenda/components/AgendaFormModal.vue";
import AgendaAcaoModal from "../Agenda/components/AgendaAcaoModal.vue";
import { useAgendamentos } from "@/composables/useAgendamentos";
import {
  hojeNoFuso,
  inicioDaSemana,
  precoParaCampo,
  rotuloDia,
  somarDias,
} from "@/utils/agendamentos";

const {
  agora,
  agendamentos,
  carregando,
  erroCarregamento,
  salvando,
  processandoAcao,
  clientesBD,
  profissionaisBD,
  servicosBD,
  avisosAcesso,
  colaboradorId,
  profissionalComAutonomia,
  podeGerenciar,
  podeEditarAgenda,
  carregarCadastros,
  carregarAgendamentos,
  salvarAgendamento,
  cancelar,
  registrarFalta,
  concluir,
} = useAgendamentos();

const searchQuery = ref("");
const camposAtivos = ref(["cliente", "procedimento"]);
const filtroStatus = ref("todos");
const periodo = ref("hoje");
const dataDe = ref("");
const dataAte = ref("");
const toast = ref({ show: false, message: "", type: "success" });

const detalhesAberto = ref(false);
const idDetalhe = ref(null);

const formAberto = ref(false);
const editando = ref(false);
const idEdicao = ref(null);
const alertaForm = ref(null);
const acao = ref({ aberto: false, modo: "cancelar", item: null, erro: "" });

let toastTimer;

const camposBusca = [
  { label: "Cliente", value: "cliente" },
  { label: "Procedimento", value: "procedimento" },
  { label: "Profissional", value: "profissional" },
];

const periodosBusca = [
  { label: "Hoje", value: "hoje" },
  { label: "Esta semana", value: "semana" },
  { label: "Este mês", value: "mes" },
  { label: "Personalizado", value: "personalizado" },
];

const statusBusca = [
  { label: "Todos", value: "todos" },
  { label: "Agendados", value: "agendado" },
  { label: "Em Andamento", value: "andamento" },
  { label: "Aguardando conclusão", value: "aguardando" },
  { label: "Concluídos", value: "concluido" },
  { label: "Faltas", value: "falta" },
  { label: "Cancelados", value: "cancelado" },
];

const grupoDoStatus = {
  pendente: "agendado",
  confirmado: "agendado",
  em_andamento: "andamento",
  aguardando: "aguardando",
  concluido: "concluido",
  falta: "falta",
  cancelado: "cancelado",
};

const profissionalPadrao = () => {
  if (!profissionalComAutonomia.value) return { nome: "", id: "" };

  const proprio = profissionaisBD.value.find(
    (item) => String(item.id) === colaboradorId.value
  );

  return proprio ? { nome: proprio.nome, id: proprio.id } : { nome: "", id: "" };
};

const preencherFormVazio = () => ({
  cliente: "",
  cliente_id: "",
  servico: "",
  servico_id: "",
  servicoPreco: null,
  servicoDuracao: null,
  profissional: profissionalPadrao().nome,
  profissional_id: profissionalPadrao().id,
  pacote_id: "",
  pacoteNome: "",
  dataInicio: "",
  horaInicio: "",
  dataFim: "",
  horaFim: "",
  observacoes: "",
  precoAcordado: "",
});

const form = ref(preencherFormVazio());

const hoje = computed(() => hojeNoFuso(agora.value));

const intervalo = computed(() => {
  if (periodo.value === "hoje") {
    return { inicio: hoje.value, fim: hoje.value };
  }

  if (periodo.value === "semana") {
    const inicio = inicioDaSemana(hoje.value);

    return { inicio, fim: somarDias(inicio, 6) };
  }

  if (periodo.value === "mes") {
    const [ano, mes] = hoje.value.split("-").map(Number);
    const ultimo = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
    const prefixo = `${ano}-${String(mes).padStart(2, "0")}`;

    return {
      inicio: `${prefixo}-01`,
      fim: `${prefixo}-${String(ultimo).padStart(2, "0")}`,
    };
  }

  return { inicio: dataDe.value, fim: dataAte.value };
});

const mensagemPeriodo = computed(() =>
  periodo.value === "personalizado" &&
  intervalo.value.inicio &&
  intervalo.value.fim &&
  intervalo.value.inicio > intervalo.value.fim
    ? "A data final deve ser igual ou posterior à data inicial."
    : ""
);

const parametrosConsulta = computed(() => {
  if (mensagemPeriodo.value) return null;

  const params = {};

  if (intervalo.value.inicio) params.data_inicio = intervalo.value.inicio;
  if (intervalo.value.fim) params.data_fim = intervalo.value.fim;

  return params;
});

const recarregar = () => {
  const params = parametrosConsulta.value;

  if (!params) return Promise.resolve();

  return carregarAgendamentos(params);
};

watch(parametrosConsulta, recarregar, { immediate: true });

onMounted(() => {
  carregarCadastros();
});

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer);
});

const valorDoCampo = (item, campo) => {
  if (campo === "procedimento") return item.servico;

  return item[campo];
};

const atendimentosFiltrados = computed(() => {
  let resultado = agendamentos.value;

  if (filtroStatus.value !== "todos") {
    resultado = resultado.filter((a) => grupoDoStatus[a.status] === filtroStatus.value);
  }

  if (!searchQuery.value || camposAtivos.value.length === 0) return resultado;

  const queryNormal = searchQuery.value.toLowerCase();

  return resultado.filter((a) =>
    camposAtivos.value.some((campo) =>
      String(valorDoCampo(a, campo) ?? "")
        .toLowerCase()
        .includes(queryNormal)
    )
  );
});

const grupos = computed(() => {
  const mapa = new Map();

  [...atendimentosFiltrados.value]
    .sort((a, b) => {
      const chaveA = `${a.dataInicio}T${a.horaInicio}`;
      const chaveB = `${b.dataInicio}T${b.horaInicio}`;

      if (chaveA === chaveB) return String(a.id).localeCompare(String(b.id));

      return chaveA < chaveB ? -1 : 1;
    })
    .forEach((item) => {
      if (!mapa.has(item.dataInicio)) mapa.set(item.dataInicio, []);

      mapa.get(item.dataInicio).push(item);
    });

  return [...mapa.entries()].map(([data, itens]) => ({
    data,
    rotulo: rotuloDia(data, hoje.value),
    itens,
  }));
});

const totalFiltrados = computed(() => atendimentosFiltrados.value.length);

const atendimentosHoje = computed(
  () =>
    agendamentos.value.filter(
      (a) => a.dataInicio === hoje.value && a.status !== "cancelado"
    ).length
);

const atendimentosAndamento = computed(
  () => agendamentos.value.filter((a) => a.status === "em_andamento").length
);

const placeholderBusca = computed(() => {
  const campos = camposBusca
    .filter((c) => camposAtivos.value.includes(c.value))
    .map((c) => c.label);
  return `Buscar por ${campos.join(", ")}...`;
});

const temFiltroAtivo = computed(() => {
  return (
    searchQuery.value.length > 0 ||
    camposAtivos.value.length !== 2 ||
    filtroStatus.value !== "todos" ||
    periodo.value !== "hoje"
  );
});

const toggleCampo = (campo) => {
  const index = camposAtivos.value.indexOf(campo);
  if (index === -1) {
    camposAtivos.value.push(campo);
  } else if (camposAtivos.value.length > 1) {
    camposAtivos.value.splice(index, 1);
  }
};

const limparFiltros = () => {
  camposAtivos.value = ["cliente", "procedimento"];
  filtroStatus.value = "todos";
  searchQuery.value = "";
  periodo.value = "hoje";
  dataDe.value = "";
  dataAte.value = "";
};

const dispararToast = (mensagem, tipo = "success") => {
  clearTimeout(toastTimer);

  toast.value.message = mensagem;
  toast.value.type = tipo;
  toast.value.show = true;

  toastTimer = setTimeout(() => {
    toast.value.show = false;
  }, 3500);
};

const handleNotify = ({ message, type }) => dispararToast(message, type);

const atendimentoDetalhe = computed(
  () =>
    agendamentos.value.find((item) => String(item.id) === String(idDetalhe.value)) || null
);

const itemEmEdicao = computed(() =>
  editando.value
    ? agendamentos.value.find((item) => String(item.id) === String(idEdicao.value)) ||
      null
    : null
);

const atravessaMeiaNoite = computed(
  () =>
    Boolean(itemEmEdicao.value) &&
    itemEmEdicao.value.dataFim !== itemEmEdicao.value.dataInicio
);

const somenteLeitura = computed(() => {
  if (!podeEditarAgenda.value) return true;
  if (!editando.value) return false;
  if (!itemEmEdicao.value) return true;

  return (
    !(itemEmEdicao.value.editavel || itemEmEdicao.value.edicaoParcial) ||
    atravessaMeiaNoite.value
  );
});

const edicaoParcialForm = computed(
  () =>
    editando.value &&
    Boolean(itemEmEdicao.value) &&
    Boolean(itemEmEdicao.value.edicaoParcial)
);

const mensagemSomenteLeitura = computed(() => {
  if (!podeEditarAgenda.value) {
    return "Seu perfil não permite alterar a agenda.";
  }

  if (!editando.value || !itemEmEdicao.value) return "";

  if (!itemEmEdicao.value.editavel && !itemEmEdicao.value.edicaoParcial) {
    return "Agendamentos concluídos ou cancelados não podem ser editados.";
  }

  if (atravessaMeiaNoite.value) {
    return "Este agendamento ultrapassa a meia-noite e só pode ser consultado nesta tela.";
  }

  return "";
});

const permitirAcoesEncerramento = computed(
  () => podeGerenciar.value && Boolean(itemEmEdicao.value) && itemEmEdicao.value.editavel
);

const permitirFaltaForm = computed(
  () =>
    podeGerenciar.value &&
    Boolean(itemEmEdicao.value) &&
    itemEmEdicao.value.faltaRegistravel
);

const permitirConcluirForm = computed(
  () =>
    podeGerenciar.value && Boolean(itemEmEdicao.value) && itemEmEdicao.value.concluivel
);

const formValido = computed(
  () =>
    Boolean(form.value.cliente_id) &&
    Boolean(form.value.servico_id) &&
    Boolean(form.value.profissional_id) &&
    Boolean(form.value.dataInicio) &&
    Boolean(form.value.horaInicio) &&
    Boolean(form.value.horaFim)
);

const abrirModalCriacao = () => {
  if (!podeEditarAgenda.value) {
    dispararToast("Seu perfil não permite criar agendamentos.", "error");
    return;
  }

  editando.value = false;
  idEdicao.value = null;
  alertaForm.value = null;
  form.value = {
    ...preencherFormVazio(),
    dataInicio: hoje.value,
    dataFim: hoje.value,
  };
  formAberto.value = true;
};

const abrirModalEdicao = (atendimento) => {
  const original = agendamentos.value.find(
    (item) => String(item.id) === String(atendimento.id)
  );

  if (!original) return;

  detalhesAberto.value = false;
  editando.value = true;
  idEdicao.value = original.id;
  alertaForm.value = null;

  form.value = {
    cliente: original.cliente,
    cliente_id: original.cliente_id,
    servico: original.servico,
    servico_id: original.servico_id,
    servicoPreco: original.servicoPreco,
    servicoDuracao: original.servicoDuracaoMinutos,
    profissional: original.profissional,
    profissional_id: original.profissional_id,
    pacote_id: original.pacote_id ? String(original.pacote_id) : "",
    pacoteNome: original.pacoteNome,
    dataInicio: original.dataInicio,
    horaInicio: original.horaInicio,
    dataFim: original.dataFim || original.dataInicio,
    horaFim: original.horaFim,
    observacoes: original.observacoes,
    precoAcordado: precoParaCampo(original.precoAcordado),
  };

  formAberto.value = true;
};

const abrirModalDetalhes = (atendimento) => {
  idDetalhe.value = atendimento.id;
  detalhesAberto.value = true;
};

const fecharDetalhes = () => {
  detalhesAberto.value = false;
  idDetalhe.value = null;
};

const fecharFormulario = () => {
  formAberto.value = false;
  alertaForm.value = null;
};

const salvarAtendimento = async () => {
  alertaForm.value = null;

  const resultado = await salvarAgendamento(
    form.value,
    editando.value ? idEdicao.value : null
  );

  if (!resultado.ok) {
    alertaForm.value = resultado.erro;
    return;
  }

  dispararToast(
    editando.value
      ? "Atendimento atualizado com sucesso!"
      : "Atendimento agendado com sucesso!"
  );

  fecharFormulario();
  await recarregar();
};

const abrirAcao = (modo, atendimento = null) => {
  const item = atendimento
    ? agendamentos.value.find((a) => String(a.id) === String(atendimento.id))
    : itemEmEdicao.value;

  if (!item) return;

  acao.value = { aberto: true, modo, item, erro: "" };
};

const fecharAcao = () => {
  acao.value = { ...acao.value, aberto: false, erro: "" };
};

const confirmarAcao = async (payload) => {
  const { modo, item } = acao.value;

  if (!item) return;

  const resultado =
    modo === "cancelar"
      ? await cancelar(item.id, payload.motivo)
      : modo === "concluir"
      ? await concluir(item.id)
      : await registrarFalta(item.id, payload);

  if (!resultado.ok) {
    acao.value = { ...acao.value, erro: resultado.erro.mensagem };
    return;
  }

  fecharAcao();
  fecharFormulario();
  fecharDetalhes();

  dispararToast(
    modo === "cancelar"
      ? "Agendamento cancelado com sucesso."
      : modo === "concluir"
      ? "Atendimento concluído com sucesso."
      : "Falta registrada com sucesso.",
    modo === "cancelar" ? "error" : modo === "concluir" ? "success" : "info"
  );

  await recarregar();
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.page-container {
  min-height: 100vh;
  background-color: var(--cor-fundo, #f5f7fa);
  display: flex;
  flex-direction: column;
  font-family: "Inter", sans-serif;
}
.page-content {
  width: min(100%, 1600px);
  margin: 0 auto;
  padding: 28px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex-grow: 1;
}
.action-panel {
  box-sizing: border-box;
  width: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #fdfdfe 100%);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02);
}
.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  min-width: 0;
}
.search-input-wrapper {
  position: relative;
  flex: 1 1 340px;
  min-width: 0;
  max-width: 480px;
}
.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 16px;
  pointer-events: none;
}
.search-input {
  box-sizing: border-box;
  width: 100%;
  height: 48px;
  padding: 0 16px 0 46px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  outline: none;
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  background: #f8fafc;
  font-family: inherit;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.search-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}
.search-input:hover {
  border-color: #94a3b8;
  background: #ffffff;
}
.search-input:focus {
  border-color: var(--cor-primaria, #1ca4a7);
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.12);
}
.btn-novo {
  box-sizing: border-box;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 22px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: var(--cor-primaria, #1ca4a7);
  color: #ffffff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.25);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-novo:hover {
  background: #158a8d;
  box-shadow: 0 6px 16px rgba(28, 164, 167, 0.35);
  transform: translateY(-2px);
}
.btn-novo:focus-visible {
  outline: 3px solid rgba(28, 164, 167, 0.35);
  outline-offset: 2px;
}

.filters-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}
.filters-row + .filters-row {
  padding-top: 0;
  border-top: 0;
}
.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 12px;
}
.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}
.filter-label i {
  color: var(--cor-primaria, #1ca4a7);
  font-size: 15px;
}
.chips-container {
  box-sizing: border-box;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 4px;
  padding: 4px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #f1f5f9;
}
.chip {
  box-sizing: border-box;
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 14px;
  background: transparent;
  border: 1px solid transparent;
  color: #475569;
  border-radius: 9px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}
.chip:hover:not(.active) {
  color: #0f172a;
  background: rgba(255, 255, 255, 0.7);
}
.chip.active {
  color: var(--cor-primaria, #168f92);
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
}
.chip-status.active {
  color: #1e293b;
}
.divider {
  width: 1px;
  height: 24px;
  background-color: #e2e8f0;
}
.btn-limpar {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-left: auto;
  min-height: 36px;
  padding: 0 14px;
  background: transparent;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #dc2626;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-limpar:hover {
  background-color: #fef2f2;
  border-color: #fca5a5;
}
.periodo-datas {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.date-input {
  box-sizing: border-box;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
  background-color: #f8fafc;
  font-family: inherit;
  transition: all 0.25s ease;
}
.date-input:hover {
  border-color: #94a3b8;
  background-color: #ffffff;
}
.date-input:focus {
  border-color: var(--cor-primaria, #1ca4a7);
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.12);
}
.date-separator {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.status-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
}
.status-banner.erro {
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
}
.banner-acao {
  margin-left: auto;
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid currentColor;
  border-radius: 10px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.banner-acao:hover {
  background: rgba(255, 255, 255, 0.7);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.stat-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
  transition: transform 0.3s ease, border-color 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--cor-primaria, #1ca4a7);
}
.stat-number {
  font-size: 1.8rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}
.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.dia-grupo {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
}
.dia-titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}
.dia-titulo i {
  color: var(--cor-primaria, #1ca4a7);
  font-size: 15px;
}
.dia-contagem {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 20px;
  background-color: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}

.atendimentos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  position: relative;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  text-align: center;
  color: #64748b;
  grid-column: 1 / -1;
}
.empty-state p {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}
.empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #e2e8f0;
  display: grid;
  place-items: center;
  color: #64748b;
  font-size: 24px;
}

.toast-notification {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 3000;
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: min(420px, calc(100vw - 32px));
  padding: 15px 18px;
  border: 1px solid #d1fae5;
  border-left: 4px solid #1ca4a7;
  border-radius: 12px;
  background: #ffffff;
  color: #065f46;
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.14);
}
.toast-notification i {
  font-size: 1.2rem;
}
.toast-notification.success {
  border-left-color: #1ca4a7;
}
.toast-notification.success i {
  color: #1ca4a7;
}
.toast-notification.error {
  color: #b91c1c;
  border-color: #fecaca;
  border-left-color: #ef4444;
}
.toast-notification.error i {
  color: #ef4444;
}
.toast-notification.info {
  color: #1e40af;
  border-color: #dbeafe;
  border-left-color: #3b82f6;
}
.toast-notification.info i {
  color: #3b82f6;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.35s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
.list-leave-active {
  position: absolute;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .filters-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .divider {
    display: none;
  }
  .btn-limpar {
    margin-left: 0;
  }
}
@media (max-width: 760px) {
  .top-row {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input-wrapper {
    max-width: none;
    flex-basis: auto;
  }
}
@media (max-width: 640px) {
  .page-content {
    padding: 16px;
  }
  .action-panel {
    padding: 18px;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .dia-grupo {
    padding: 16px;
  }
  .chips-container {
    width: 100%;
  }
  .chip {
    flex: 1;
    padding: 0 10px;
  }
  .btn-limpar {
    width: 100%;
    justify-content: center;
  }
  .toast-notification {
    right: 16px;
    bottom: 16px;
  }
}
</style>
