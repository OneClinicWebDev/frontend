<template>
  <div class="stat-card">
    <h2 class="stat-number">{{ number }}</h2>
    <p class="stat-label">{{ label }}</p>
  </div>
</template>

<script setup>
defineProps({
  number: [String, Number],
  label: String
})
</script>

<style scoped>
.stat-card {
  background-color: var(--branco);
  border: 1px solid var(--cor-clara);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  border-color: var(--cor-primaria);
}

.stat-number {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--cor-secundaria);
  margin: 0 0 0.25rem 0;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--cor-escura);
  opacity: 0.7;
  margin: 0;
}
</style>