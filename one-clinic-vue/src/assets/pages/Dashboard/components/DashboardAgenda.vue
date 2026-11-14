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
@keyframes panel-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.panel {
  box-sizing: border-box;
  background: linear-gradient(135deg, #ffffff 0%, #fdfdfe 100%);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02);
  font-family: "Inter", sans-serif;
  animation: panel-in 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}
.panel-header h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}
.panel-header h3::before {
  content: "";
  width: 4px;
  height: 16px;
  border-radius: 4px;
  background: var(--cor-primaria, #1ca4a7);
}
.link-ver-tudo {
  padding: 6px 12px;
  border-radius: 20px;
  background: #f1f5f9;
  color: var(--cor-primaria, #1ca4a7);
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.link-ver-tudo:hover {
  background: rgba(28, 164, 167, 0.12);
  color: #158a8d;
}
.estado-vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 36px 16px;
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  background: #f8fafc;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}
.estado-vazio i {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #94a3b8;
  font-size: 22px;
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
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.agenda-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -4px rgba(28, 164, 167, 0.12);
  border-color: rgba(28, 164, 167, 0.4);
}
.time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 92px;
  flex-shrink: 0;
  padding: 8px 10px;
  border-radius: 10px;
  background: #f0fdfa;
  color: #0f172a;
  font-size: 13px;
  font-weight: 600;
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
  color: #1e293b;
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
  font-weight: 500;
  white-space: nowrap;
}
.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
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
@media (max-width: 1024px) {
  .panel {
    padding: 20px;
  }
}
@media (max-width: 760px) {
  .agenda-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .side-info {
    align-items: flex-start;
  }
  .time {
    width: auto;
  }
}
@media (max-width: 640px) {
  .panel {
    padding: 16px;
    border-radius: 16px;
  }
}
</style>
