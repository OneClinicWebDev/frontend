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
        {{ erro ? 'Não foi possível carregar a agenda de hoje.' : 'Nenhum agendamento para hoje.' }}
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
import { formatarStatus } from '@/utils/agendamentos'

defineProps({
  itens: { type: Array, default: () => [] },
  carregando: Boolean,
  erro: Boolean,
})
</script>

<style scoped>
.panel {
  background: var(--branco, #ffffff);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.panel-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cor-escura, #111827);
}

.link-ver-tudo {
  color: var(--cor-primaria, #1ca4a7);
  text-decoration: none;
  font-size: 0.875rem;
}

.agenda-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.agenda-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--cor-clara, #f9fafb);
  border-radius: 10px;
  transition: all 0.25s ease;
}

.agenda-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 90px;
  flex-shrink: 0;
  color: var(--cor-secundaria, #4b5563);
}

.client-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.client-name {
  font-weight: 600;
  color: var(--cor-escura, #111827);
}

.procedure {
  font-size: 0.85rem;
  color: var(--cor-secundaria, #6b7280);
}

.side-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
}

.professional {
  color: var(--cor-secundaria, #4b5563);
  white-space: nowrap;
}

.status-badge {
  padding: 0.15rem 0.55rem;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.4px;
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
  background: #def7ec;
  color: #03543f;
}

.badge-falta {
  background: #f3e8ff;
  color: #7e22ce;
}

.estado-vazio {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 2rem 1rem;
  color: var(--cor-secundaria, #6b7280);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .panel {
    padding: 1rem;
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