<template>
  <div class="stats-grid">
    <div class="stat-card">
      <h2 class="stat-number">{{ total }}</h2>
      <p class="stat-label">Total de Agendamentos</p>
    </div>
    <div class="stat-card">
      <h2 class="stat-number text-success">{{ confirmados }}</h2>
      <p class="stat-label">Confirmados</p>
    </div>
    <div class="stat-card">
      <h2 class="stat-number text-warning">{{ pendentes }}</h2>
      <p class="stat-label">Pendentes</p>
    </div>
    <div class="stat-card">
      <h2 class="stat-number text-danger">{{ cancelados }}</h2>
      <p class="stat-label">Cancelados</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  total: Number,
  confirmados: Number,
  pendentes: Number,
  cancelados: Number,
});
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
.stat-card {
  background-color: var(--branco);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
  transition: transform 0.3s ease, border-color 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--cor-primaria);
}
.stat-number {
  font-size: 1.8rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 4px 0;
}
.stat-label {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0;
}
.text-success {
  color: #10b981 !important;
}
.text-warning {
  color: #f97316 !important;
}
.text-danger {
  color: #ef4444 !important;
}
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}
</style>
