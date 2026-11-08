<template>
  <div>
    <TransitionGroup name="list" tag="div" class="cards-grid">
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
            {{ formatarDataBR(item.dataInicio) }} | {{ item.horaInicio }} às
            {{ item.horaFim }}
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
          <div class="detail-item">
            <span class="detail-label">Duração</span>
            <span class="detail-value">{{ formatarDuracao(item.duracaoMinutos) }}</span>
          </div>
          <div v-if="item.pacoteNome" class="detail-item">
            <span class="detail-label">Pacote</span>
            <span class="detail-value">{{ item.pacoteNome }}</span>
          </div>
          <div v-if="item.dataInicio !== item.dataFim" class="detail-item">
            <span class="detail-label">Término</span>
            <span class="detail-value">{{ formatarDataBR(item.dataFim) }}</span>
          </div>
        </div>
      </div>
    </TransitionGroup>
    <div v-if="appointments.length === 0" class="empty-state list-empty">
      <div class="empty-icon-wrapper">
        <i class="pi pi-search"></i>
      </div>
      <h3>Nenhum agendamento encontrado</h3>
      <p>Não existem agendamentos para os filtros atuais.</p>
    </div>
  </div>
</template>

<script setup>
import { formatarDuracao } from "@/utils/agendamentos";

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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.appointment-card {
  box-sizing: border-box;
  min-width: 0;
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
  margin-bottom: 12px;
  min-width: 0;
}
.appointment-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.appointment-time i {
  color: var(--cor-primaria, #1ca4a7);
}
.status-badge {
  flex-shrink: 0;
  padding: 3px 9px;
  border-radius: 999px;
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
.appointment-client-large {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
  min-width: 0;
}
.client-avatar {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid #cbd5e1;
  color: #475569;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
}
.appointment-client-large h4 {
  margin: 0;
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-divider {
  border: 0;
  border-top: 1px dashed #e2e8f0;
  margin: 0 0 14px;
}
.appointment-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  min-width: 0;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.detail-label {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.detail-value {
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  text-align: center;
}
.empty-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #e2e8f0;
  display: grid;
  place-items: center;
  color: #64748b;
  font-size: 24px;
  margin-bottom: 12px;
}
.empty-state h3 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}
.empty-state p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}
.list-empty {
  grid-column: 1 / -1;
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
</style>
