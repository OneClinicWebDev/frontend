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
              <input v-model="dataDe" type="date" class="date-input" aria-label="Data inicial" />
              <span class="date-separator">até</span>
              <input v-model="dataAte" type="date" class="date-input" aria-label="Data final" />
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
      :mensagemSomenteLeitura="mensagemSomenteLeitura"
      :permitirCancelar="permitirAcoesEncerramento"
      :permitirFalta="permitirAcoesEncerramento"
      @close="fecharFormulario"
      @save="salvarAtendimento"
      @cancelar-agendamento="abrirAcao('cancelar')"
      @registrar-falta="abrirAcao('falta')"
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
import { hojeNoFuso, inicioDaSemana, rotuloDia, somarDias } from "@/utils/agendamentos";

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
  podeGerenciar,
  podeEditarAgenda,
  carregarCadastros,
  carregarAgendamentos,
  salvarAgendamento,
  cancelar,
  registrarFalta,
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

const preencherFormVazio = () => ({
  cliente: "",
  cliente_id: "",
  servico: "",
  servico_id: "",
  servicoPreco: null,
  servicoDuracao: null,
  profissional: "",
  profissional_id: "",
  pacote_id: "",
  pacoteNome: "",
  dataInicio: "",
  horaInicio: "",
  dataFim: "",
  horaFim: "",
  observacoes: "",
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
    resultado = resultado.filter(
      (a) => grupoDoStatus[a.status] === filtroStatus.value
    );
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
    agendamentos.value.find(
      (item) => String(item.id) === String(idDetalhe.value)
    ) || null
);

const itemEmEdicao = computed(() =>
  editando.value
    ? agendamentos.value.find(
        (item) => String(item.id) === String(idEdicao.value)
      ) || null
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

  return !itemEmEdicao.value.editavel || atravessaMeiaNoite.value;
});

const mensagemSomenteLeitura = computed(() => {
  if (!podeEditarAgenda.value) {
    return "Seu perfil não permite alterar a agenda.";
  }

  if (!editando.value || !itemEmEdicao.value) return "";

  if (!itemEmEdicao.value.editavel) {
    return "Agendamentos concluídos ou cancelados não podem ser editados.";
  }

  if (atravessaMeiaNoite.value) {
    return "Este agendamento ultrapassa a meia-noite e só pode ser consultado nesta tela.";
  }

  return "";
});

const permitirAcoesEncerramento = computed(
  () =>
    podeGerenciar.value &&
    Boolean(itemEmEdicao.value) &&
    itemEmEdicao.value.editavel
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
      : "Falta registrada com sucesso.",
    modo === "cancelar" ? "error" : "info"
  );

  await recarregar();
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.page-container {
  min-height: 100vh;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
  font-family: "Inter", sans-serif;
}
.page-content {
  padding: 2rem;
  flex-grow: 1;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
}
.action-panel {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.search-input-wrapper {
  position: relative;
  flex-grow: 1;
  max-width: 600px;
}
.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  opacity: 0.6;
  font-size: 1.1rem;
}
.search-input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 3rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  font-size: 1rem;
  color: #1f2937;
  background-color: #f9fafb;
  transition: all 0.3s ease;
  font-family: inherit;
}
.search-input:focus {
  border-color: #1ca4a7;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.1);
}
.btn-novo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #1ca4a7;
  color: #ffffff;
  padding: 0.85rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-family: inherit;
}
.btn-novo:hover {
  background-color: #158a8d;
  transform: translateY(-2px);
}

.filters-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.chip {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}
.chip:hover {
  border-color: #1ca4a7;
  color: #1ca4a7;
}
.chip.active {
  background-color: #1ca4a7;
  border-color: #1ca4a7;
  color: #ffffff;
}
.chip-status.active {
  background-color: #1f2937;
  border-color: #1f2937;
  color: #ffffff;
}
.divider {
  width: 1px;
  height: 24px;
  background-color: #e5e7eb;
}
.btn-limpar {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
}
.btn-limpar:hover {
  background-color: #fef2f2;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.stat-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}
.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}
.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.chip-periodo.active {
  background-color: #1ca4a7;
  border-color: #1ca4a7;
}
.periodo-datas {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.date-input {
  padding: 0.4rem 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  font-size: 0.85rem;
  color: #1f2937;
  background-color: #f9fafb;
  font-family: inherit;
}
.date-input:focus {
  border-color: #1ca4a7;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(28, 164, 167, 0.1);
}
.date-separator {
  font-size: 0.85rem;
  color: #6b7280;
}

.status-banner {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  color: #4b5563;
  font-size: 0.85rem;
}
.status-banner.erro {
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
}
.banner-acao {
  margin-left: auto;
  padding: 0.45rem 0.85rem;
  border: 1px solid currentColor;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.dia-grupo {
  margin-bottom: 2rem;
}
.dia-titulo {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
}
.dia-titulo i {
  color: #1ca4a7;
  font-size: 0.95rem;
}
.dia-contagem {
  padding: 0.1rem 0.55rem;
  border-radius: 20px;
  background-color: #e5e7eb;
  color: #4b5563;
  font-size: 0.75rem;
  font-weight: 600;
}

.atendimentos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
  opacity: 0.6;
  gap: 0.5rem;
  grid-column: 1 / -1;
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #1f2937;
  color: #ffffff;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
  border-left: 4px solid;
  z-index: 3000;
}
.toast-notification.success {
  border-left-color: #1ca4a7;
}
.toast-notification.success i {
  color: #1ca4a7;
  font-size: 1.2rem;
}
.toast-notification.error {
  border-left-color: #ef4444;
}
.toast-notification.error i {
  color: #ef4444;
  font-size: 1.2rem;
}
.toast-notification.info {
  border-left-color: #3b82f6;
}
.toast-notification.info i {
  color: #3b82f6;
  font-size: 1.2rem;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
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

@media (max-width: 992px) {
  .filters-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .divider {
    display: none;
  }
  .btn-limpar {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .page-content {
    padding: 1rem;
  }
  .top-row {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input-wrapper {
    max-width: 100%;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .btn-novo {
    justify-content: center;
  }
  .btn-limpar {
    width: 100%;
    justify-content: center;
  }
}
</style>