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
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.12);
  border-color: #1CA4A7;
}

.stat-number {
  font-size: 2.2rem;
  font-weight: 800;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
}

.stat-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #6B7280;
  margin: 0;
}
</style>