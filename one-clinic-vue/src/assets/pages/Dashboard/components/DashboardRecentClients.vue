<template>
  <div class="panel clientes-panel">
    <div class="panel-header">
      <h3>Clientes Recentes</h3>
      <router-link v-if="podeVerClientes" to="/app/clientes" class="link-ver-tudo">
        Ver todos
      </router-link>
    </div>

    <div v-if="carregando && !clientes.length" class="estado-vazio">
      <i class="pi pi-spin pi-spinner"></i>
      <span>Carregando clientes...</span>
    </div>

    <div v-else-if="!clientes.length" class="estado-vazio">
      <i class="pi pi-users"></i>
      <span>Nenhum atendimento concluído nos últimos 30 dias.</span>
    </div>

    <div v-else class="clientes-list">
      <div v-for="cliente in clientes" :key="cliente.id" class="cliente-item">
        <div class="avatar">{{ gerarIniciais(cliente.nome) }}</div>

        <div class="cliente-info">
          <span class="cliente-name">{{ cliente.nome }}</span>
          <span class="cliente-visit">Última visita: {{ cliente.ultimaVisita }}</span>
        </div>

        <div class="cliente-count">
          <span class="count-num">{{ cliente.visitas }}</span>
          <span class="count-label">{{ cliente.visitas === 1 ? 'visita' : 'visitas' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { gerarIniciais } from '@/utils/agendamentos'

defineProps({
  clientes: { type: Array, default: () => [] },
  carregando: Boolean,
  podeVerClientes: Boolean,
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
}

.clientes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cliente-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.cliente-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cliente-name {
  font-weight: 600;
}

.cliente-visit {
  font-size: 0.8rem;
  color: var(--cor-secundaria);
}

.cliente-count {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.count-num {
  font-weight: 700;
}

.count-label {
  font-size: 0.75rem;
  color: var(--cor-secundaria);
}

.estado-vazio {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 2rem 1rem;
  color: var(--cor-secundaria, #6b7280);
  font-size: 0.9rem;
  text-align: center;
}

@media (max-width: 768px) {
  .panel {
    padding: 1rem;
  }
}
</style>