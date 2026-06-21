<template>
  <aside class="side-panel action-panel">
    <div class="panel-header">
      <h3><i class="pi pi-clock"></i> Próximos Atendimentos</h3>
    </div>
    <div class="appointments-list">
      <div
        v-for="item in appointments"
        :key="item.id"
        class="appointment-card"
        @click="$emit('edit', item)"
      >
        <div class="appointment-header">
          <span class="appointment-time"
            >{{ formatarDataBR(item.dataInicio) }} • {{ item.horaInicio }}</span
          >
          <span :class="['status-badge', `badge-${item.status}`]">{{
            formatStatus(item.status)
          }}</span>
        </div>
        <div class="appointment-client">{{ item.cliente }}</div>
        <div class="appointment-details">
          <span><i class="pi pi-tag"></i> {{ item.servico }}</span>
          <span><i class="pi pi-user"></i> {{ item.profissional }}</span>
        </div>
      </div>
      <div v-if="appointments.length === 0" class="empty-state">
        <i class="pi pi-calendar-times"></i>
        <p>Nenhum agendamento.</p>
      </div>
    </div>
  </aside>
</template>

<script setup>
defineProps({
  appointments: {
    type: Array,
    required: true,
  },
});

defineEmits(["edit"]);

const formatarDataBR = (data) => {
  if (!data) return "";
  const partes = data.split("-");
  if (partes.length !== 3) return data;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const formatStatus = (status) => {
  const map = {
    confirmado: "Confirmado",
    pendente: "Pendente",
    em_andamento: "Em Andamento",
    cancelado: "Cancelado",
  };
  return map[status] || status;
};
</script>

<style scoped>
.action-panel {
  background-color: var(--branco);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--cor-clara);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.panel-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--cor-clara);
}

.panel-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--cor-escura);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.appointments-list::-webkit-scrollbar {
  width: 4px;
}
.appointments-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.appointment-card {
  background-color: var(--branco);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  cursor: pointer;
}

.appointment-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(28, 164, 167, 0.1);
  border-color: var(--cor-clara);
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.appointment-time {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cor-escura);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.appointment-client {
  font-size: 1rem;
  font-weight: 600;
  color: var(--cor-escura);
  margin-bottom: 0.5rem;
}

.appointment-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--cor-secundaria);
}

.appointment-details span {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.status-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  border: 1px solid transparent;
}

.badge-confirmado {
  background-color: #ecfdf5;
  color: #10b981;
  border-color: #a7f3d0;
}
.badge-pendente {
  background-color: #fff7ed;
  color: #f97316;
  border-color: #fed7aa;
}
.badge-em_andamento {
  background-color: #eff6ff;
  color: #3b82f6;
  border-color: #bfdbfe;
}
.badge-cancelado {
  background-color: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--cor-secundaria);
  opacity: 0.6;
  gap: 0.5rem;
  text-align: center;
}

.empty-state i {
  font-size: 2rem;
}

@media (max-width: 1200px) {
  .side-panel {
    order: -1;
  }
}
</style>