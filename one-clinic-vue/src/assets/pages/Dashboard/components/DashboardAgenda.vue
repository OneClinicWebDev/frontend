<template>
  <div class="panel agenda-panel">
    <div class="panel-header">
      <h3>Agenda de Hoje</h3>
      <router-link to="/app/atendimentos" class="link-ver-tudo">Ver tudo</router-link>
    </div>
    <div v-if="carregando && !itens.length" class="estado-vazio">
      <i class="pi pi-spin pi-spinner"></i>
      <span>Carregando agenda...</span>
    </div>
    <div v-else-if="!itens.length" class="estado-vazio">
      <i class="pi pi-calendar"></i>
      <span>
        {{
          erro
            ? "Não foi possível carregar a agenda de hoje."
            : "Nenhum agendamento para hoje."
        }}
      </span>
    </div>
    <div v-else class="agenda-list">
      <div v-for="item in itens" :key="item.id" class="agenda-item">
        <span class="time">
          <i class="pi pi-clock"></i>
          {{ item.horaInicio }}
        </span>
        <div class="client-info">
          <span class="client-name">{{ item.cliente }}</span>
          <span class="procedure">{{ item.servico }}</span>
        </div>
        <div class="side-info">
          <span class="professional">{{ item.profissional }}</span>
          <span :class="['status-badge', `badge-${item.status}`]">
            {{ formatarStatus(item.status) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatarStatus } from "@/utils/agendamentos";
defineProps({
  itens: { type: Array, default: () => [] },
  carregando: Boolean,
  erro: Boolean,
});
</script>

<style scoped>
.panel {
  background: linear-gradient(180deg, #ffffff 0%, #fcfdff 100%);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05);
  font-family: "Inter", sans-serif;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}
.link-ver-tudo {
  color: var(--cor-primaria, #1ca4a7);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  transition: color 0.25s ease;
}
.link-ver-tudo:hover {
  color: #158a8d;
}
.estado-vazio {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 32px 16px;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  background: #f8fafc;
  color: #64748b;
  font-size: 14px;
  text-align: center;
}
.agenda-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.agenda-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.agenda-item:hover {
  background: #ffffff;
  border-color: rgba(28, 164, 167, 0.4);
  transform: translateX(4px);
}
.time {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 90px;
  flex-shrink: 0;
  color: #475569;
  font-size: 13px;
  font-weight: 500;
}
.time i {
  color: var(--cor-primaria, #1ca4a7);
}
.client-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.client-name {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}
.procedure {
  font-size: 12px;
  color: #64748b;
}
.side-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}
.professional {
  color: #475569;
  font-size: 13px;
  white-space: nowrap;
}
.status-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}
.badge-pendente {
  background: #ffedd5;
  color: #c2410c;
}
.badge-confirmado {
  background: #e0f2fe;
  color: #0369a1;
}
.badge-em_andamento {
  background: #fef3c7;
  color: #92400e;
}
.badge-aguardando {
  background: #f1f5f9;
  color: #475569;
}
.badge-concluido {
  background: #ecfdf5;
  color: #047857;
}
.badge-falta {
  background: #f3e8ff;
  color: #7e22ce;
}
@media (max-width: 768px) {
  .panel {
    padding: 16px;
  }
  .agenda-item {
    flex-direction: column;
    align-items: flex-start;
  }
  .side-info {
    align-items: flex-start;
  }
  .time {
    width: auto;
  }
}
</style>
