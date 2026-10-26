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
      @close="closeModal"
      @save="saveAppointment"
      @delete="deleteAppointment"
      @notify="handleNotify"
      @add-servico="adicionarServico"
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
import { ref, computed, watch, onBeforeUnmount } from "vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

import AgendaHeader from "./components/AgendaHeader.vue";
import AgendaStats from "./components/AgendaStats.vue";
import AgendaCalendar from "./components/AgendaCalendar.vue";
import AgendaSideList from "./components/AgendaSideList.vue";
import AgendaGridList from "./components/AgendaGridList.vue";
import AgendaFormModal from "./components/AgendaFormModal.vue";

const calendarComponentRef = ref(null);
const currentView = ref("timeGridWeek");
const displayMode = ref("calendar");
const modalOpen = ref(false);
const editing = ref(false);
const selectedId = ref(null);
const toast = ref({ show: false, message: "", type: "success" });

let toastTimer;

const filters = ref({
  search: "",
  profissional: "",
  status: "",
  dataInicio: "",
  dataFim: "",
});

const clientesBD = ref([
  { id: 1, nome: "Ana Silva", cpf: "111.222.333-44" },
  { id: 2, nome: "Carla Santos", cpf: "222.333.444-55" },
  { id: 3, nome: "Marcos Paulo", cpf: "333.444.555-66" },
]);

const servicosBD = ref([
  { id: 101, nome: "Limpeza de Pele" },
  { id: 102, nome: "Botox" },
  { id: 103, nome: "Preenchimento Facial" },
  { id: 104, nome: "Drenagem Linfática" },
]);

const profissionaisBD = ref([
  { id: 201, nome: "Dra. Maria", cpf: "444.555.666-77" },
  { id: 202, nome: "Dr. Paulo", cpf: "555.666.777-88" },
  { id: 203, nome: "Dra. Fernanda", cpf: "666.777.888-99" },
]);

const form = ref({
  cliente: "",
  cliente_id: "",
  servico: "",
  servico_id: "",
  profissional: "",
  profissional_id: "",
  dataInicio: "",
  horaInicio: "",
  dataFim: "",
  horaFim: "",
  status: "confirmado",
});

const appointments = ref([
  {
    id: 1,
    cliente_id: 1,
    servico_id: 101,
    profissional_id: 201,
    dataInicio: "2026-10-18",
    horaInicio: "09:00",
    dataFim: "2026-10-18",
    horaFim: "10:00",
    status: "confirmado",
  },
  {
    id: 2,
    cliente_id: 2,
    servico_id: 102,
    profissional_id: 202,
    dataInicio: "2026-10-18",
    horaInicio: "11:00",
    dataFim: "2026-10-18",
    horaFim: "12:00",
    status: "pendente",
  },
  {
    id: 3,
    cliente_id: 3,
    servico_id: 103,
    profissional_id: 203,
    dataInicio: "2026-10-19",
    horaInicio: "14:00",
    dataFim: "2026-10-19",
    horaFim: "15:30",
    status: "em_andamento",
  },
]);

const normalizarTexto = (valor) =>
  String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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

const resolverPessoa = (lista, id, nome) =>
  lista.find((item) => String(item.id) === String(id)) ||
  lista.find(
    (item) => normalizarTexto(item.nome) === normalizarTexto(nome)
  );

const resolvedAppointments = computed(() =>
  appointments.value.map((item) => {
    const cliente = resolverPessoa(
      clientesBD.value,
      item.cliente_id,
      item.cliente
    );

    const servico = resolverPessoa(
      servicosBD.value,
      item.servico_id,
      item.servico
    );

    const profissional = resolverPessoa(
      profissionaisBD.value,
      item.profissional_id,
      item.profissional
    );

    return {
      ...item,
      cliente: cliente?.nome || item.cliente || "Cliente não encontrado",
      clienteCpf: cliente?.cpf || item.clienteCpf || "",
      servico: servico?.nome || item.servico || "Serviço não encontrado",
      profissional:
        profissional?.nome ||
        item.profissional ||
        "Profissional não atribuído",
    };
  })
);

const filteredAppointments = computed(() => {
  const termo = String(filters.value.search ?? "").trim();
  const termoTexto = normalizarTexto(termo);
  const termoNumerico = apenasNumeros(termo);
  const buscaSomenteNumeros =
    termo !== "" && /^[\d\s./()-]+$/.test(termo);

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
      const dateA = new Date(`${a.dataInicio}T${a.horaInicio}`);
      const dateB = new Date(`${b.dataInicio}T${b.horaInicio}`);

      return dateA - dateB;
    });
});

const totalAgendamentos = computed(
  () => filteredAppointments.value.length
);

const confirmados = computed(
  () =>
    filteredAppointments.value.filter(
      (item) => item.status === "confirmado"
    ).length
);

const pendentes = computed(
  () =>
    filteredAppointments.value.filter(
      (item) => item.status === "pendente"
    ).length
);

const cancelados = computed(
  () =>
    filteredAppointments.value.filter(
      (item) => item.status === "cancelado"
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
      extendedProps: { ...item },
    };
  })
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

const preencherFormVazio = () => ({
  cliente: "",
  cliente_id: "",
  servico: "",
  servico_id: "",
  profissional: "",
  profissional_id: "",
  dataInicio: "",
  horaInicio: "",
  dataFim: "",
  horaFim: "",
  status: "confirmado",
});

const openCreateModal = () => {
  editing.value = false;
  selectedId.value = null;
  form.value = preencherFormVazio();
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
};

const editAppointment = (appointment) => {
  const original = appointments.value.find(
    (item) => String(item.id) === String(appointment.id)
  );

  if (!original) return;

  editing.value = true;
  selectedId.value = original.id;

  const cliente = resolverPessoa(
    clientesBD.value,
    original.cliente_id,
    appointment.cliente
  );

  const servico = resolverPessoa(
    servicosBD.value,
    original.servico_id,
    appointment.servico
  );

  const profissional = resolverPessoa(
    profissionaisBD.value,
    original.profissional_id,
    appointment.profissional
  );

  form.value = {
    ...original,
    cliente: cliente?.nome || appointment.cliente || "",
    cliente_id: cliente?.id ?? original.cliente_id ?? "",
    servico: servico?.nome || appointment.servico || "",
    servico_id: servico?.id ?? original.servico_id ?? "",
    profissional:
      profissional?.nome || appointment.profissional || "",
    profissional_id:
      profissional?.id ?? original.profissional_id ?? "",
    dataFim: original.dataFim || original.dataInicio,
  };

  modalOpen.value = true;
};

const adicionarServico = (nome) => {
  const nomeLimpo = String(nome ?? "").trim();

  if (!nomeLimpo) return;

  const existente = servicosBD.value.find(
    (servico) =>
      normalizarTexto(servico.nome) === normalizarTexto(nomeLimpo)
  );

  if (existente) {
    form.value.servico = existente.nome;
    form.value.servico_id = existente.id;
    return;
  }

  const novoServico = {
    id: Date.now(),
    nome: nomeLimpo,
  };

  servicosBD.value.push(novoServico);
  form.value.servico = novoServico.nome;
  form.value.servico_id = novoServico.id;
};

watch(
  () => form.value.cliente,
  (nome) => {
    const cliente = clientesBD.value.find(
      (item) =>
        normalizarTexto(item.nome) === normalizarTexto(nome)
    );

    form.value.cliente_id = cliente?.id ?? "";
  }
);

watch(
  () => form.value.servico,
  (nome) => {
    const servico = servicosBD.value.find(
      (item) =>
        normalizarTexto(item.nome) === normalizarTexto(nome)
    );

    form.value.servico_id = servico?.id ?? "";
  }
);

watch(
  () => form.value.profissional,
  (nome) => {
    const profissional = profissionaisBD.value.find(
      (item) =>
        normalizarTexto(item.nome) === normalizarTexto(nome)
    );

    form.value.profissional_id = profissional?.id ?? "";
  }
);

const saveAppointment = () => {
  const cliente = resolverPessoa(
    clientesBD.value,
    form.value.cliente_id,
    form.value.cliente
  );

  const servico = resolverPessoa(
    servicosBD.value,
    form.value.servico_id,
    form.value.servico
  );

  const profissional = resolverPessoa(
    profissionaisBD.value,
    form.value.profissional_id,
    form.value.profissional
  );

  if (!cliente || !servico || !profissional) {
    dispararToast(
      "Selecione um cliente, procedimento e profissional válidos.",
      "error"
    );
    return;
  }

  const dataInicio = form.value.dataInicio;
  const dataFim = form.value.dataFim || dataInicio;
  const horaInicio = form.value.horaInicio;
  const horaFim = form.value.horaFim;

  if (
    !dataInicio ||
    !horaInicio ||
    !horaFim ||
    !dataFim ||
    `${dataFim}T${horaFim}` <= `${dataInicio}T${horaInicio}`
  ) {
    dispararToast(
      "Confira a data e os horários do agendamento.",
      "error"
    );
    return;
  }

  if (dataFim !== dataInicio) {
    dispararToast(
      "O agendamento não pode ultrapassar a meia-noite.",
      "error"
    );
    return;
  }

  const dados = {
    id: editing.value ? selectedId.value : Date.now(),
    cliente_id: cliente.id,
    servico_id: servico.id,
    profissional_id: profissional.id,
    dataInicio,
    horaInicio,
    dataFim,
    horaFim,
    status: form.value.status || "confirmado",
  };

  if (editing.value) {
    const index = appointments.value.findIndex(
      (item) => String(item.id) === String(selectedId.value)
    );

    if (index !== -1) {
      appointments.value[index] = dados;
    }

    dispararToast("Agendamento atualizado com sucesso!");
  } else {
    appointments.value.push(dados);
    dispararToast("Novo agendamento criado com sucesso!");
  }

  closeModal();
};

const deleteAppointment = () => {
  appointments.value = appointments.value.filter(
    (item) => String(item.id) !== String(selectedId.value)
  );

  dispararToast("Agendamento excluído com sucesso!");
  closeModal();
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

const atualizarHorarioEvento = (evento, info) => {
  const item = appointments.value.find(
    (appointment) =>
      String(appointment.id) === String(evento.id)
  );

  if (!item) {
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

  item.dataInicio = dataInicio;
  item.horaInicio = formatarHoraLocal(inicio);
  item.dataFim = dataFim;
  item.horaFim = formatarHoraLocal(fim);

  dispararToast("Horário do agendamento atualizado!");
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
  select(info) {
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
    const item = appointments.value.find(
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
