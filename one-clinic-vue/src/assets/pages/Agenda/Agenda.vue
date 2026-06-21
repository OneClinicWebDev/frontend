<template>
  <div class="page-container">
    <main class="page-content">
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

      <AgendaStats
        :total="totalAgendamentos"
        :confirmados="confirmados"
        :pendentes="pendentes"
        :cancelados="cancelados"
      />

      <div class="agenda-content" :class="{ 'layout-list': displayMode === 'list' }">
        <AgendaCalendar
          v-show="displayMode === 'calendar'"
          ref="calendarComponentRef"
          :options="calendarOptions"
        />

        <AgendaSideList
          v-show="displayMode === 'calendar'"
          :appointments="filteredAppointments"
          @edit="editAppointment"
        />

        <AgendaGridList
          v-show="displayMode === 'list'"
          :appointments="filteredAppointments"
          @edit="editAppointment"
        />
      </div>
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
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
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

const filters = ref({
  search: "",
  profissional: "",
  status: "",
  dataInicio: "",
  dataFim: "",
});

const hasActiveFilters = computed(() => {
  return (
    filters.value.search !== "" ||
    filters.value.profissional !== "" ||
    filters.value.status !== "" ||
    filters.value.dataInicio !== "" ||
    filters.value.dataFim !== ""
  );
});

const clearFilters = () => {
  filters.value = {
    search: "",
    profissional: "",
    status: "",
    dataInicio: "",
    dataFim: "",
  };
};

const clientesBD = ref([
  { nome: "Ana Silva", cpf: "111.222.333-44" },
  { nome: "Carla Santos", cpf: "222.333.444-55" },
  { nome: "Marcos Paulo", cpf: "333.444.555-66" },
]);

const servicosBD = ref([
  "Limpeza de Pele",
  "Botox",
  "Preenchimento Facial",
  "Drenagem Linfática",
]);
const profissionaisBD = ref(["Dra. Maria", "Dr. Paulo", "Dra. Fernanda"]);

const form = ref({
  cliente: "",
  servico: "",
  profissional: "",
  dataInicio: "",
  horaInicio: "",
  dataFim: "",
  horaFim: "",
  status: "confirmado",
});

const isFormValid = computed(() => {
  return (
    form.value.cliente &&
    form.value.servico &&
    form.value.profissional &&
    form.value.dataInicio &&
    form.value.horaInicio &&
    form.value.dataFim &&
    form.value.horaFim
  );
});

const appointments = ref([
  {
    id: 1,
    cliente: "Ana Silva",
    servico: "Limpeza de Pele",
    profissional: "Dra. Maria",
    dataInicio: "2026-06-18",
    horaInicio: "09:00",
    dataFim: "2026-06-18",
    horaFim: "10:00",
    status: "confirmado",
  },
  {
    id: 2,
    cliente: "Carla Santos",
    servico: "Botox",
    profissional: "Dr. Paulo",
    dataInicio: "2026-06-18",
    horaInicio: "11:00",
    dataFim: "2026-06-18",
    horaFim: "12:00",
    status: "pendente",
  },
  {
    id: 3,
    cliente: "Marcos Paulo",
    servico: "Preenchimento Facial",
    profissional: "Dra. Fernanda",
    dataInicio: "2026-06-19",
    horaInicio: "14:00",
    dataFim: "2026-06-19",
    horaFim: "15:30",
    status: "em_andamento",
  },
]);

const filteredAppointments = computed(() => {
  return appointments.value
    .filter((item) => {
      const s = filters.value.search.toLowerCase();
      const matchSearch =
        item.cliente.toLowerCase().includes(s) || item.servico.toLowerCase().includes(s);
      const matchProf =
        !filters.value.profissional || item.profissional === filters.value.profissional;
      const matchStatus = !filters.value.status || item.status === filters.value.status;
      const matchDataIni =
        !filters.value.dataInicio || item.dataInicio >= filters.value.dataInicio;
      const matchDataFim =
        !filters.value.dataFim || item.dataInicio <= filters.value.dataFim;

      return matchSearch && matchProf && matchStatus && matchDataIni && matchDataFim;
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.dataInicio}T${a.horaInicio}`);
      const dateB = new Date(`${b.dataInicio}T${b.horaInicio}`);
      return dateA - dateB;
    });
});

const totalAgendamentos = computed(() => filteredAppointments.value.length);
const confirmados = computed(
  () => filteredAppointments.value.filter((i) => i.status === "confirmado").length
);
const pendentes = computed(
  () => filteredAppointments.value.filter((i) => i.status === "pendente").length
);
const cancelados = computed(
  () => filteredAppointments.value.filter((i) => i.status === "cancelado").length
);

const eventColors = {
  confirmado: { bg: "#ECFDF5", border: "#A7F3D0", text: "#10B981" },
  pendente: { bg: "#FFF7ED", border: "#FED7AA", text: "#F97316" },
  em_andamento: { bg: "#EFF6FF", border: "#BFDBFE", text: "#3B82F6" },
  cancelado: { bg: "#FEF2F2", border: "#FECACA", text: "#EF4444" },
};

const events = computed(() => {
  return filteredAppointments.value.map((item) => {
    const theme = eventColors[item.status] || eventColors["confirmado"];
    return {
      id: item.id,
      title: `${item.cliente} • ${item.servico}`,
      start: `${item.dataInicio}T${item.horaInicio}`,
      end: `${item.dataFim}T${item.horaFim}`,
      backgroundColor: theme.bg,
      borderColor: theme.border,
      textColor: theme.text,
      extendedProps: { ...item },
    };
  });
});

const openCreateModal = () => {
  editing.value = false;
  form.value = {
    cliente: "",
    servico: "",
    profissional: "",
    status: "confirmado",
    dataInicio: "",
    horaInicio: "",
    dataFim: "",
    horaFim: "",
  };
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
};

const editAppointment = (appointment) => {
  editing.value = true;
  selectedId.value = appointment.id;
  form.value = { ...appointment };
  modalOpen.value = true;
};

const saveAppointment = () => {
  if (editing.value) {
    const index = appointments.value.findIndex((item) => item.id === selectedId.value);
    appointments.value[index] = { ...form.value, id: selectedId.value };
  } else {
    appointments.value.push({ id: Date.now(), ...form.value });
  }
  closeModal();
};

const deleteAppointment = () => {
  appointments.value = appointments.value.filter((item) => item.id !== selectedId.value);
  closeModal();
};

const changeView = (view) => {
  if (displayMode.value !== "calendar") return;
  currentView.value = view;
  if (calendarComponentRef.value) {
    calendarComponentRef.value.changeView(view);
  }
};

const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: "timeGridWeek",
  editable: true,
  selectable: true,
  locale: "pt-br",
  slotMinTime: "07:00:00",
  slotMaxTime: "21:00:00",
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "",
  },
  buttonText: { today: "Hoje" },
  select(info) {
    editing.value = false;
    const dateStr = info.startStr.slice(0, 10);
    const timeStr = info.startStr.includes("T") ? info.startStr.substring(11, 16) : "";
    let endStr = info.endStr.slice(0, 10);
    let endTimeStr = info.endStr.includes("T") ? info.endStr.substring(11, 16) : "";

    if (!endTimeStr && timeStr) {
      endStr = dateStr;
      const [h, m] = timeStr.split(":");
      endTimeStr = `${String(Number(h) + 1).padStart(2, "0")}:${m}`;
    }

    form.value = {
      cliente: "",
      servico: "",
      profissional: "",
      status: "confirmado",
      dataInicio: dateStr,
      horaInicio: timeStr,
      dataFim: endStr || dateStr,
      horaFim: endTimeStr,
    };
    modalOpen.value = true;
  },
  eventClick(info) {
    const item = appointments.value.find((e) => e.id == info.event.id);
    if (item) editAppointment(item);
  },
  eventDrop(info) {
    const item = appointments.value.find((e) => e.id == info.event.id);
    if (!item) return;
    item.dataInicio = info.event.start.toISOString().split("T")[0];
    if (info.event.start.toTimeString)
      item.horaInicio = info.event.start.toTimeString().slice(0, 5);
    if (info.event.end) {
      item.dataFim = info.event.end.toISOString().split("T")[0];
      item.horaFim = info.event.end.toTimeString().slice(0, 5);
    }
  },
  eventResize(info) {
    const item = appointments.value.find((e) => e.id == info.event.id);
    if (!item || !info.event.end) return;
    item.dataFim = info.event.end.toISOString().split("T")[0];
    item.horaFim = info.event.end.toTimeString().slice(0, 5);
  },
};

Object.defineProperty(calendarOptions, "events", {
  get() {
    return events.value;
  },
});
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: var(--cor-fundo);
  display: flex;
  flex-direction: column;
}

.page-content {
  padding: 2rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.agenda-content {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
}

.agenda-content.layout-list {
  display: block;
}

@media (max-width: 1200px) {
  .agenda-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-content {
    padding: 1rem;
  }
}
</style>