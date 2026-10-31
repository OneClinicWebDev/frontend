<template>
  <div class="page-container">
    <main class="page-content">
      <div class="agenda-header-section">
        <AgendaHeader
          v-model:filters="filters"
          v-model:displayMode="displayMode"
          :currentView="currentView"
          :profissionaisBD="profissionaisBD"
          :hasActiveFilters="hasActiveFilters"
          @changeView="changeView"
          @openCreateModal="openCreateModal"
          @clearFilters="clearFilters"
        />
      </div>

      <div v-if="erroCarregamento" class="status-banner erro" role="alert">
        <i class="pi pi-exclamation-triangle"></i>
        <span>{{ erroCarregamento }}</span>
        <button type="button" class="banner-acao" @click="recarregar">
          Tentar novamente
        </button>
      </div>

      <div v-else-if="carregando" class="status-banner" role="status">
        <i class="pi pi-spin pi-spinner"></i>
        <span>Atualizando a agenda...</span>
      </div>

      <section class="stats-section">
        <AgendaStats
          :total="totalAgendamentos"
          :confirmados="confirmados"
          :pendentes="pendentes"
          :cancelados="cancelados"
        />
      </section>

      <section
        class="agenda-content"
        :class="{
          'layout-list': displayMode === 'list',
          'layout-calendar': displayMode === 'calendar'
        }"
      >
        <div
          v-show="displayMode === 'calendar'"
          class="calendar-wrapper"
        >
          <AgendaCalendar
            ref="calendarComponentRef"
            :options="calendarOptions"
          />
        </div>

        <aside
          v-show="displayMode === 'calendar'"
          class="agenda-side-wrapper"
        >
          <AgendaSideList
            :appointments="filteredAppointments"
            @edit="editAppointment"
          />
        </aside>

        <div
          v-show="displayMode === 'list'"
          class="agenda-grid-wrapper"
        >
          <AgendaGridList
            :appointments="filteredAppointments"
            @edit="editAppointment"
          />
        </div>
      </section>
    </main>

    <AgendaFormModal
      :isOpen="modalOpen"
      :editing="editing"
      :form="form"
      :clientesBD="clientesBD"
      :servicosBD="servicosBD"
      :profissionaisBD="profissionaisBD"
      :isValid="isFormValid"
      :salvando="salvando"
      :alerta="alertaForm"
      :avisosAcesso="avisosAcesso"
      :somenteLeitura="somenteLeitura"
      :mensagemSomenteLeitura="mensagemSomenteLeitura"
      :permitirCancelar="permitirAcoesEncerramento"
      :permitirFalta="permitirFaltaForm"
      @close="closeModal"
      @save="saveAppointment"
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
      <div
        v-if="toast.show"
        :class="['toast-notification', toast.type]"
        role="status"
        aria-live="polite"
      >
        <i
          :class="
            toast.type === 'error'
              ? 'pi pi-exclamation-circle'
              : 'pi pi-check-circle'
          "
        ></i>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import AgendaHeader from "./components/AgendaHeader.vue";
import AgendaStats from "./components/AgendaStats.vue";
import AgendaCalendar from "./components/AgendaCalendar.vue";
import AgendaSideList from "./components/AgendaSideList.vue";
import AgendaGridList from "./components/AgendaGridList.vue";
import AgendaFormModal from "./components/AgendaFormModal.vue";
import AgendaAcaoModal from "./components/AgendaAcaoModal.vue";
import { useAgendamentos } from "@/composables/useAgendamentos";
import { precoParaCampo } from "@/utils/agendamentos";

const {
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
  reagendarAgendamento,
  cancelar,
  registrarFalta,
} = useAgendamentos();

const calendarComponentRef = ref(null);
const currentView = ref("timeGridWeek");
const displayMode = ref("calendar");
const modalOpen = ref(false);
const editing = ref(false);
const selectedId = ref(null);
const alertaForm = ref(null);
const janela = ref(null);
const toast = ref({ show: false, message: "", type: "success" });
const acao = ref({ aberto: false, modo: "cancelar", item: null, erro: "" });

let toastTimer;

const filters = ref({
  search: "",
  profissional: "",
  status: "",
  dataInicio: "",
  dataFim: "",
});

const profissionalPadrao = () => {
  if (!profissionalComAutonomia.value) return { nome: "", id: "" };

  const proprio = profissionaisBD.value.find(
    (item) => String(item.id) === colaboradorId.value
  );

  return proprio
    ? { nome: proprio.nome, id: proprio.id }
    : { nome: "", id: "" };
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

const normalizarTexto = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();

const apenasNumeros = (valor) =>
  String(valor ?? "").replace(/\D/g, "");

const dispararToast = (mensagem, tipo = "success") => {
  clearTimeout(toastTimer);

  toast.value = {
    show: true,
    message: mensagem,
    type: tipo,
  };

  toastTimer = setTimeout(() => {
    toast.value.show = false;
    toastTimer = undefined;
  }, 3500);
};

const handleNotify = ({ message, type }) => {
  dispararToast(message, type);
};

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer);
});

const parametrosConsulta = computed(() => {
  const params = {};

  if (displayMode.value === "calendar") {
    if (!janela.value) return null;

    params.data_inicio = janela.value.inicio;
    params.data_fim = janela.value.fim;

    return params;
  }

  if (filters.value.dataInicio) params.data_inicio = filters.value.dataInicio;
  if (filters.value.dataFim) params.data_fim = filters.value.dataFim;

  return params;
});

const recarregar = () => {
  const params = parametrosConsulta.value;

  if (!params) return Promise.resolve();

  return carregarAgendamentos(params);
};

watch(parametrosConsulta, () => {
  recarregar();
});

onMounted(() => {
  carregarCadastros();
});

const hasActiveFilters = computed(() =>
  Boolean(
    filters.value.search ||
    filters.value.profissional ||
    filters.value.status ||
    filters.value.dataInicio ||
    filters.value.dataFim
  )
);

const clearFilters = () => {
  filters.value = {
    search: "",
    profissional: "",
    status: "",
    dataInicio: "",
    dataFim: "",
  };
};

const cpfPorCliente = computed(() => {
  const mapa = new Map();

  clientesBD.value.forEach((cliente) => {
    mapa.set(String(cliente.id), cliente.cpf);
  });

  return mapa;
});

const resolvedAppointments = computed(() =>
  agendamentos.value.map((item) => ({
    ...item,
    clienteCpf: cpfPorCliente.value.get(String(item.cliente_id)) || "",
  }))
);

const filteredAppointments = computed(() => {
  const termo = String(filters.value.search ?? "").trim();
  const termoTexto = normalizarTexto(termo);
  const termoNumerico = apenasNumeros(termo);
  const buscaSomenteNumeros =
    termo !== "" && /^[\d\s./()*-]+$/.test(termo);

  return resolvedAppointments.value
    .filter((item) => {
      const matchSearch =
        !termo ||
        (buscaSomenteNumeros
          ? apenasNumeros(item.clienteCpf).includes(termoNumerico)
          : normalizarTexto(item.cliente).includes(termoTexto) ||
            normalizarTexto(item.servico).includes(termoTexto) ||
            normalizarTexto(item.profissional).includes(termoTexto) ||
            (termoNumerico.length >= 3 &&
              apenasNumeros(item.clienteCpf).includes(termoNumerico)));

      const matchProf =
        !filters.value.profissional ||
        String(item.profissional_id) ===
          String(filters.value.profissional) ||
        item.profissional === filters.value.profissional;

      const matchStatus =
        !filters.value.status ||
        item.status === filters.value.status;

      const matchDataIni =
        !filters.value.dataInicio ||
        item.dataInicio >= filters.value.dataInicio;

      const matchDataFim =
        !filters.value.dataFim ||
        item.dataInicio <= filters.value.dataFim;

      return (
        matchSearch &&
        matchProf &&
        matchStatus &&
        matchDataIni &&
        matchDataFim
      );
    })
    .sort((a, b) => {
      const dateA = `${a.dataInicio}T${a.horaInicio}`;
      const dateB = `${b.dataInicio}T${b.horaInicio}`;

      if (dateA === dateB) return String(a.id).localeCompare(String(b.id));

      return dateA < dateB ? -1 : 1;
    });
});

const totalAgendamentos = computed(
  () => filteredAppointments.value.length
);

const confirmados = computed(
  () =>
    filteredAppointments.value.filter(
      (item) => item.statusApi === "CONFIRMADO"
    ).length
);

const pendentes = computed(
  () =>
    filteredAppointments.value.filter(
      (item) => item.statusApi === "PENDENTE"
    ).length
);

const cancelados = computed(
  () =>
    filteredAppointments.value.filter(
      (item) => item.statusApi === "CANCELADO"
    ).length
);

const eventColors = {
  confirmado: {
    bg: "#ECFDF5",
    border: "#A7F3D0",
    text: "#047857",
  },
  pendente: {
    bg: "#FFF7ED",
    border: "#FED7AA",
    text: "#C2410C",
  },
  em_andamento: {
    bg: "#EFF6FF",
    border: "#BFDBFE",
    text: "#1D4ED8",
  },
  aguardando: {
    bg: "#F1F5F9",
    border: "#CBD5E1",
    text: "#475569",
  },
  concluido: {
    bg: "#F0FDFA",
    border: "#99F6E4",
    text: "#0F766E",
  },
  falta: {
    bg: "#FAF5FF",
    border: "#E9D5FF",
    text: "#7E22CE",
  },
  cancelado: {
    bg: "#FEF2F2",
    border: "#FECACA",
    text: "#B91C1C",
  },
};

const events = computed(() =>
  filteredAppointments.value.map((item) => {
    const theme = eventColors[item.status] || eventColors.confirmado;

    return {
      id: String(item.id),
      title: `${item.cliente} • ${item.servico}`,
      start: `${item.dataInicio}T${item.horaInicio}`,
      end: `${item.dataFim || item.dataInicio}T${item.horaFim}`,
      backgroundColor: theme.bg,
      borderColor: theme.border,
      textColor: theme.text,
      editable: item.editavel && podeEditarAgenda.value,
      extendedProps: { ...item },
    };
  })
);

const itemAtual = computed(() =>
  editing.value
    ? agendamentos.value.find(
        (item) => String(item.id) === String(selectedId.value)
      ) || null
    : null
);

const atravessaMeiaNoite = computed(
  () =>
    Boolean(itemAtual.value) &&
    itemAtual.value.dataFim !== itemAtual.value.dataInicio
);

const somenteLeitura = computed(() => {
  if (!podeEditarAgenda.value) return true;
  if (!editing.value) return false;
  if (!itemAtual.value) return true;

  return !itemAtual.value.editavel || atravessaMeiaNoite.value;
});

const mensagemSomenteLeitura = computed(() => {
  if (!podeEditarAgenda.value) {
    return "Seu perfil não permite alterar a agenda.";
  }

  if (!editing.value || !itemAtual.value) return "";

  if (!itemAtual.value.editavel) {
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
    Boolean(itemAtual.value) &&
    itemAtual.value.editavel
);

const permitirFaltaForm = computed(
  () =>
    podeGerenciar.value &&
    Boolean(itemAtual.value) &&
    itemAtual.value.faltaRegistravel
);

const isFormValid = computed(
  () =>
    Boolean(form.value.cliente_id) &&
    Boolean(form.value.servico_id) &&
    Boolean(form.value.profissional_id) &&
    Boolean(form.value.dataInicio) &&
    Boolean(form.value.horaInicio) &&
    Boolean(form.value.horaFim)
);

const openCreateModal = () => {
  if (!podeEditarAgenda.value) {
    dispararToast("Seu perfil não permite criar agendamentos.", "error");
    return;
  }

  editing.value = false;
  selectedId.value = null;
  alertaForm.value = null;
  form.value = preencherFormVazio();
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
  alertaForm.value = null;
};

const editAppointment = (appointment) => {
  const original = agendamentos.value.find(
    (item) => String(item.id) === String(appointment.id)
  );

  if (!original) return;

  editing.value = true;
  selectedId.value = original.id;
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

  modalOpen.value = true;
};

const saveAppointment = async () => {
  alertaForm.value = null;

  const resultado = await salvarAgendamento(
    form.value,
    editing.value ? selectedId.value : null
  );

  if (!resultado.ok) {
    alertaForm.value = resultado.erro;
    return;
  }

  dispararToast(
    editing.value
      ? "Agendamento atualizado com sucesso!"
      : "Novo agendamento criado com sucesso!"
  );

  closeModal();
  await recarregar();
};

const abrirAcao = (modo) => {
  if (!itemAtual.value) return;

  acao.value = {
    aberto: true,
    modo,
    item: itemAtual.value,
    erro: "",
  };
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
  closeModal();

  dispararToast(
    modo === "cancelar"
      ? "Agendamento cancelado com sucesso."
      : "Falta registrada com sucesso."
  );

  await recarregar();
};

const changeView = (view) => {
  if (displayMode.value !== "calendar") return;

  currentView.value = view;
  calendarComponentRef.value?.changeView(view);
};

const formatarDataLocal = (data) => {
  if (!data) return "";

  return [
    data.getFullYear(),
    String(data.getMonth() + 1).padStart(2, "0"),
    String(data.getDate()).padStart(2, "0"),
  ].join("-");
};

const formatarHoraLocal = (data) =>
  `${String(data.getHours()).padStart(2, "0")}:${String(
    data.getMinutes()
  ).padStart(2, "0")}`;

const atualizarHorarioEvento = async (evento, info) => {
  const item = agendamentos.value.find(
    (appointment) =>
      String(appointment.id) === String(evento.id)
  );

  if (!item || !item.editavel || !podeEditarAgenda.value) {
    info.revert?.();
    return;
  }

  const inicio = evento.start;
  const fim = evento.end;

  if (!inicio || !fim) {
    info.revert?.();
    return;
  }

  const dataInicio = formatarDataLocal(inicio);
  const dataFim = formatarDataLocal(fim);

  if (dataInicio !== dataFim || fim <= inicio) {
    info.revert?.();
    dispararToast(
      "O agendamento deve terminar no mesmo dia e após o início.",
      "error"
    );
    return;
  }

  const resultado = await reagendarAgendamento(
    item.id,
    dataInicio,
    formatarHoraLocal(inicio),
    formatarHoraLocal(fim)
  );

  if (!resultado.ok) {
    info.revert?.();
    dispararToast(resultado.erro.mensagem, "error");
    return;
  }

  dispararToast("Horário do agendamento atualizado!");
  await recarregar();
};

const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: "timeGridWeek",
  editable: true,
  selectable: true,
  locale: "pt-br",
  slotMinTime: "07:00:00",
  slotMaxTime: "21:00:00",
  slotDuration: "00:30:00",
  expandRows: true,
  nowIndicator: true,
  height: "auto",
  contentHeight: "auto",
  dayMaxEvents: true,
  allDaySlot: false,
  eventTimeFormat: {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  },
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "",
  },
  buttonText: {
    today: "Hoje",
  },
  datesSet(info) {
    const ultimoDia = new Date(info.end.getTime() - 1);

    janela.value = {
      inicio: formatarDataLocal(info.start),
      fim: formatarDataLocal(ultimoDia),
    };
  },
  select(info) {
    if (!podeEditarAgenda.value) {
      dispararToast("Seu perfil não permite criar agendamentos.", "error");
      return;
    }

    const data = info.startStr.slice(0, 10);
    const horaInicio = info.startStr.includes("T")
      ? info.startStr.substring(11, 16)
      : "";

    let horaFim = info.endStr.includes("T")
      ? info.endStr.substring(11, 16)
      : "";

    if (!horaFim && horaInicio) {
      const [hora, minuto] = horaInicio.split(":");
      const fimMinutos = Number(hora) * 60 + Number(minuto) + 60;

      horaFim = `${String(
        Math.floor(fimMinutos / 60) % 24
      ).padStart(2, "0")}:${String(fimMinutos % 60).padStart(
        2,
        "0"
      )}`;
    }

    editing.value = false;
    selectedId.value = null;
    alertaForm.value = null;

    form.value = {
      ...preencherFormVazio(),
      dataInicio: data,
      dataFim: data,
      horaInicio,
      horaFim,
    };

    modalOpen.value = true;
  },
  eventClick(info) {
    const item = agendamentos.value.find(
      (appointment) =>
        String(appointment.id) === String(info.event.id)
    );

    if (item) editAppointment(item);
  },
  eventDrop(info) {
    atualizarHorarioEvento(info.event, info);
  },
  eventResize(info) {
    atualizarHorarioEvento(info.event, info);
  },
};

Object.defineProperty(calendarOptions, "events", {
  enumerable: true,
  get() {
    return events.value;
  },
});
</script>

<style scoped>
.page-container {
  --agenda-space-xs: 8px;
  --agenda-space-sm: 12px;
  --agenda-space-md: 20px;
  --agenda-space-lg: 28px;
  --agenda-space-xl: 36px;
  --agenda-space-2xl: 44px;

  min-height: 100vh;
  width: 100%;
  background: #f8fafc;
  color: #1e293b;
  font-family: "Inter", sans-serif;
}

.page-content {
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 36px 40px 56px;
  display: flex;
  flex-direction: column;
  gap: var(--agenda-space-xl);
}

.agenda-header-section {
  width: 100%;
  min-width: 0;
  margin-bottom: 4px;
}

.stats-section {
  width: 100%;
  min-width: 0;
  margin-bottom: 2px;
}

.agenda-content {
  width: 100%;
  min-width: 0;
  padding: 28px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 350px);
  gap: 28px;
  align-items: start;
  background: #fff;
  border: 1px solid #e8edf3;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.035);
  animation: panel-enter 0.35s ease both;
}

.calendar-wrapper {
  min-width: 0;
  width: 100%;
  padding: 4px;
}

.agenda-side-wrapper {
  min-width: 0;
  width: 100%;
  padding: 4px 0 4px 24px;
  border-left: 1px solid #edf0f4;
}

.agenda-grid-wrapper {
  min-width: 0;
  width: 100%;
  grid-column: 1 / -1;
}

.agenda-content.layout-list {
  display: block;
  padding: 28px;
}

.layout-list .agenda-grid-wrapper {
  padding: 4px;
}

.toast-notification {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 3000;
  display: flex;
  align-items: center;
  gap: 14px;
  width: max-content;
  max-width: min(440px, calc(100vw - 40px));
  padding: 17px 22px;
  border: 1px solid #a7f3d0;
  border-radius: 14px;
  background: #fff;
  color: #065f46;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.13);
  font-size: 14px;
  line-height: 1.6;
}

.toast-notification.error {
  color: #b91c1c;
  border-color: #fecaca;
}

.toast-notification i {
  flex-shrink: 0;
  font-size: 19px;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.status-banner {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-top: -16px;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  color: #475569;
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

.banner-acao:hover {
  background: rgba(153, 27, 27, 0.08);
}

@keyframes panel-enter {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (min-width: 1600px) {
  .page-content {
    padding-right: 48px;
    padding-left: 48px;
  }

  .agenda-content {
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 32px;
    padding: 32px;
  }

  .agenda-side-wrapper {
    padding-left: 28px;
  }
}

@media (max-width: 1200px) {
  .page-content {
    padding: 28px 24px 40px;
    gap: 28px;
  }

  .agenda-content {
    grid-template-columns: minmax(0, 1fr);
    gap: 28px;
    padding: 24px;
  }

  .agenda-side-wrapper {
    padding: 24px 0 0;
    border-left: 0;
    border-top: 1px solid #edf0f4;
  }
}

@media (max-width: 768px) {
  .page-container {
    --agenda-space-xl: 24px;
  }

  .page-content {
    padding: 22px 16px 36px;
    gap: 24px;
  }

  .agenda-header-section,
  .stats-section {
    margin-bottom: 0;
  }

  .agenda-content,
  .agenda-content.layout-list {
    padding: 18px;
    gap: 22px;
    border-radius: 16px;
  }

  .calendar-wrapper,
  .layout-list .agenda-grid-wrapper {
    padding: 0;
  }

  .agenda-side-wrapper {
    padding-top: 20px;
  }

  .toast-notification {
    right: 16px;
    bottom: 16px;
    max-width: calc(100vw - 32px);
    padding: 14px 17px;
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: 18px 12px 28px;
    gap: 20px;
  }

  .agenda-content,
  .agenda-content.layout-list {
    padding: 12px;
    gap: 18px;
    border-radius: 13px;
  }

  .agenda-side-wrapper {
    padding-top: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>