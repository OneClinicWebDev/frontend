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
          <span class="count-label">{{
            cliente.visitas === 1 ? "visita" : "visitas"
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { gerarIniciais } from "@/utils/agendamentos";
defineProps({
  clientes: { type: Array, default: () => [] },
  carregando: Boolean,
  podeVerClientes: Boolean,
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
.clientes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cliente-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 12px;
  transition: background 0.25s ease;
}
.cliente-item:hover {
  background: #f8fafc;
}
.avatar {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #f0fdfa;
  border: 1px solid #ccfbf1;
  color: var(--cor-primaria, #1ca4a7);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}
.cliente-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.cliente-name {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}
.cliente-visit {
  font-size: 12px;
  color: #64748b;
}
.cliente-count {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.count-num {
  font-size: 16px;
  font-weight: 500;
  color: #0f172a;
}
.count-label {
  font-size: 11px;
  color: #94a3b8;
}
@media (max-width: 768px) {
  .panel {
    padding: 16px;
  }
}
</style>
