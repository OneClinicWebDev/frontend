<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-header">
        <i class="pi pi-calendar stat-icon"></i>
        <span v-if="emAndamento" class="trend positive"
          >{{ emAndamento }} em andamento</span
        >
      </div>
      <div class="stat-value">{{ carregando ? "..." : agendamentosHoje }}</div>
      <div class="stat-label">Agendamentos Hoje</div>
    </div>
    <div class="stat-card">
      <div class="stat-header">
        <i class="pi pi-users stat-icon"></i>
      </div>
      <div class="stat-value">{{ valorClientes }}</div>
      <div class="stat-label">Clientes Ativos</div>
    </div>
    <div class="stat-card">
      <div class="stat-header">
        <i class="pi pi-dollar stat-icon"></i>
        <span class="trend neutral">Módulo financeiro</span>
      </div>
      <div class="stat-value stat-value-dev">Em desenvolvimento</div>
      <div class="stat-label">Receita do Mês</div>
    </div>
    <div class="stat-card">
      <div class="stat-header">
        <i class="pi pi-chart-line stat-icon"></i>
        <span v-if="taxaComparecimento !== null" class="trend neutral">
          {{ atendimentosConsiderados }} atendimentos
        </span>
      </div>
      <div class="stat-value">{{ valorTaxa }}</div>
      <div class="stat-label">Comparecimento (30 dias)</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
const props = defineProps({
  agendamentosHoje: { type: Number, default: 0 },
  emAndamento: { type: Number, default: 0 },
  clientesAtivos: { type: Number, default: null },
  taxaComparecimento: { type: Number, default: null },
  atendimentosConsiderados: { type: Number, default: 0 },
  carregando: Boolean,
});
const valorClientes = computed(() =>
  props.clientesAtivos === null ? "—" : props.clientesAtivos
);
const valorTaxa = computed(() => {
  if (props.carregando) return "...";
  return props.taxaComparecimento === null ? "—" : `${props.taxaComparecimento}%`;
});
</script>

<style scoped>
@keyframes stat-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 20px;
  font-family: "Inter", sans-serif;
}
.stat-card {
  box-sizing: border-box;
  background: #ffffff;
  padding: 20px 24px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: stat-in 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
}
.stat-card:nth-child(2) {
  animation-delay: 0.05s;
}
.stat-card:nth-child(3) {
  animation-delay: 0.1s;
}
.stat-card:nth-child(4) {
  animation-delay: 0.15s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 20px -4px rgba(28, 164, 167, 0.12);
  border-color: var(--cor-primaria, #1ca4a7);
}
.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  margin-bottom: 14px;
}
.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f0fdfa;
  color: var(--cor-primaria, #1ca4a7);
  font-size: 16px;
}
.trend {
  padding: 4px 10px;
  border-radius: 20px;
  background: #f1f5f9;
  font-size: 11px;
  font-weight: 600;
}
.positive {
  background: #ecfdf5;
  color: #047857;
}
.neutral {
  color: #64748b;
}
.stat-value {
  font-size: 1.8rem;
  font-weight: 600;
  line-height: 1.2;
  color: #0f172a;
  margin-bottom: 4px;
}
.stat-value-dev {
  font-size: 15px;
  font-weight: 600;
  line-height: 2.16rem;
  color: #94a3b8;
}
.stat-label {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #64748b;
}
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .stat-card {
    padding: 16px;
  }
}
</style>
