<template>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-header">
        <i class="pi pi-calendar stat-icon"></i>
        <span class="trend positive">+2 ↗</span>
      </div>

      <div class="stat-value">12</div>
      <div class="stat-label">Agendamentos Hoje</div>
    </div>

    <div class="stat-card">
      <div class="stat-header">
        <i class="pi pi-users stat-icon"></i>
        <span class="trend positive">+18 ↗</span>
      </div>

      <div class="stat-value">248</div>
      <div class="stat-label">Clientes Ativos</div>
    </div>

    <div class="stat-card">
      <div class="stat-header">
        <i class="pi pi-dollar stat-icon"></i>
        <span class="trend positive">+12% ↗</span>
      </div>

      <div class="stat-value">R$ 24.500</div>
      <div class="stat-label">Receita do Mês</div>
    </div>

    <div class="stat-card">
      <div class="stat-header">
        <i class="pi pi-chart-line stat-icon"></i>
        <span class="trend negative">-3% ↘</span>
      </div>

      <div class="stat-value">78%</div>
      <div class="stat-label">Taxa de Retorno</div>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: var(--branco, #ffffff);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.stat-icon {
  color: var(--cor-secundaria, #6b7280);
  font-size: 1.2rem;
}

.trend {
  font-size: 0.85rem;
  font-weight: 600;
}

.positive {
  color: #10b981;
}

.negative {
  color: #ef4444;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--cor-escura, #111827);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--cor-secundaria, #6b7280);
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .stat-card {
    padding: 1rem;
  }
}
</style>