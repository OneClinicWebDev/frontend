<template>
  <div>
    <TransitionGroup name="list" tag="div" class="cards-grid">
      <div
        v-for="item in appointments"
        :key="item.id"
        class="appointment-card large-card"
        @click="$emit('edit', item)"
      >
        <div class="appointment-header">
          <span class="appointment-time">
            <i class="pi pi-calendar"></i> {{ formatarDataBR(item.dataInicio) }} |
            {{ item.horaInicio }} às {{ item.horaFim }}
          </span>
          <span :class="['status-badge', `badge-${item.status}`]">{{
            formatStatus(item.status)
          }}</span>
        </div>

        <div class="appointment-client-large">
          <div class="client-avatar">{{ gerarIniciais(item.cliente) }}</div>
          <h4>{{ item.cliente }}</h4>
        </div>

        <hr class="card-divider" />

        <div class="appointment-details-grid">
          <div class="detail-item">
            <span class="detail-label">Serviço</span>
            <span class="detail-value">{{ item.servico }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Profissional</span>
            <span class="detail-value">{{ item.profissional }}</span>
          </div>
          <div class="detail-item" v-if="item.dataInicio !== item.dataFim">
            <span class="detail-label">Término</span>
            <span class="detail-value">{{ formatarDataBR(item.dataFim) }}</span>
          </div>
        </div>
      </div>
    </TransitionGroup>

    <div v-if="appointments.length === 0" class="empty-state list-empty">
      <i class="pi pi-search"></i>
      <p>Nenhum agendamento encontrado para os filtros atuais.</p>
    </div>
  </div>
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

const gerarIniciais = (nome) => {
  if (!nome) return "";
  return nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};
</script>

<style scoped>
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
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

.large-card {
  padding: 1.25rem;
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

.appointment-client-large {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.5rem 0 1rem 0;
}

.client-avatar {
  width: 40px;
  height: 40px;
  background-color: var(--cor-fundo);
  border: 1px solid var(--cor-clara);
  color: var(--cor-secundaria);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.appointment-client-large h4 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--cor-escura);
}

.card-divider {
  border: 0;
  border-top: 1px dashed var(--cor-clara);
  margin: 0 0 1rem 0;
}

.appointment-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--cor-secundaria);
  font-weight: 500;
}

.detail-value {
  font-size: 0.9rem;
  color: var(--cor-escura);
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

.list-empty {
  grid-column: 1 / -1;
  background: var(--branco);
  border-radius: 12px;
  border: 1px dashed var(--cor-clara);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
.list-leave-active {
  position: absolute;
}
</style>