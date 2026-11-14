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

.clientes-list {
  display: flex;
  flex-direction: column;
}
.cliente-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.cliente-item + .cliente-item {
  border-top: 1px dashed #e2e8f0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.cliente-item:hover {
  background: #f8fafc;
  border-color: rgba(28, 164, 167, 0.4);
  border-radius: 14px;
}
.avatar {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border: 1px solid #e2e8f0;
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
  color: #1e293b;
}
.cliente-visit {
  font-size: 12px;
  color: #64748b;
}
.cliente-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 52px;
  padding: 4px 10px;
  border-radius: 10px;
  background: #f1f5f9;
}
.count-num {
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}
.count-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #64748b;
}
@media (max-width: 1024px) {
  .panel {
    padding: 20px;
  }
}
@media (max-width: 640px) {
  .panel {
    padding: 16px;
    border-radius: 16px;
  }
}
</style>
