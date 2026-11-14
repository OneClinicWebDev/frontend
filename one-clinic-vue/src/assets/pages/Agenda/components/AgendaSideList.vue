<template>
  <aside class="side-panel action-panel">
    <div class="panel-header">
      <h3><i class="pi pi-clock"></i> Próximos Atendimentos</h3>
      <span class="results-count">{{ appointments.length }}</span>
    </div>
    <div class="appointments-list">
      <div
        v-for="item in appointments"
        :key="item.id"
        class="appointment-card"
        tabindex="0"
        role="button"
        :aria-label="`Abrir agendamento de ${item.cliente}`"
        @click="$emit('edit', item)"
        @keydown.enter.self="$emit('edit', item)"
        @keydown.space.self.prevent="$emit('edit', item)"
      >
        <div class="appointment-header">
          <span class="appointment-time">
            <i class="pi pi-calendar"></i>
            {{ formatarDataBR(item.dataInicio) }} • {{ item.horaInicio }}
          </span>
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
        <div class="empty-icon-wrapper">
          <i class="pi pi-calendar-times"></i>
        </div>
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
    aguardando: "Aguardando conclusão",
    concluido: "Concluído",
    falta: "Falta",
    cancelado: "Cancelado",
  };
  return map[status] || status;
};
</script>

<style scoped>
.action-panel {
  box-sizing: border-box;
  background: linear-gradient(135deg, #ffffff 0%, #fdfdfe 100%);
  border-radius: 20px;
  padding: 24px;
  font-family: "Inter", sans-serif;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e2e8f0;
}
.panel-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}
.panel-header h3 i {
  color: var(--cor-primaria, #1ca4a7);
}
.results-count {
  padding: 4px 10px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
}
.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 6px;
}
.appointments-list::-webkit-scrollbar {
  width: 4px;
}
.appointments-list::-webkit-scrollbar-thumb {
  background: rgba(15, 23, 42, 0.12);
  border-radius: 4px;
}
.appointment-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.appointment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -4px rgba(28, 164, 167, 0.12);
  border-color: rgba(28, 164, 167, 0.4);
}
.appointment-card:focus-visible {
  outline: 3px solid rgba(28, 164, 167, 0.35);
  outline-offset: 2px;
}
.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.appointment-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
}
.appointment-time i {
  color: var(--cor-primaria, #1ca4a7);
  font-size: 11px;
}
.appointment-client {
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}
.appointment-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 10px;
  border-top: 1px dashed #e2e8f0;
  font-size: 12px;
  color: #64748b;
}
.appointment-details span {
  display: flex;
  align-items: center;
  gap: 6px;
}
.appointment-details i {
  color: #94a3b8;
  font-size: 11px;
}
.status-badge {
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid transparent;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}
.badge-confirmado {
  background-color: #ecfdf5;
  color: #047857;
  border-color: #a7f3d0;
}
.badge-pendente {
  background-color: #fff7ed;
  color: #c2410c;
  border-color: #fed7aa;
}
.badge-em_andamento {
  background-color: #eff6ff;
  color: #1d4ed8;
  border-color: #bfdbfe;
}
.badge-cancelado {
  background-color: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}
.badge-aguardando {
  background-color: #f1f5f9;
  color: #475569;
  border-color: #cbd5e1;
}
.badge-concluido {
  background-color: #f0fdfa;
  color: #0f766e;
  border-color: #99f6e4;
}
.badge-falta {
  background-color: #faf5ff;
  color: #7e22ce;
  border-color: #e9d5ff;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  text-align: center;
}
.empty-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #e2e8f0;
  display: grid;
  place-items: center;
  color: #64748b;
  font-size: 20px;
  margin-bottom: 10px;
}
.empty-state p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}
@media (max-width: 1200px) {
  .side-panel {
    order: -1;
  }
}
</style>
