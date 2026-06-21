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
  gap: 1.25rem;
}

.stat-card {
  background-color: var(--branco);
  border: 1px solid var(--cor-clara);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  border-color: var(--cor-primaria);
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--cor-escura);
  margin: 0 0 0.2rem 0;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--cor-secundaria);
  font-weight: 500;
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

@media (max-width: 992px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>