<template>
  <div class="stat-card">
    <h2 class="stat-number">{{ number }}</h2>
    <p class="stat-label">{{ label }}</p>
  </div>
</template>

<script setup>
defineProps({
  number: [String, Number],
  label: String,
});
</script>

<style scoped>
.stat-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
  font-family: "Inter", sans-serif;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -4px rgba(28, 164, 167, 0.12);
  border-color: rgba(28, 164, 167, 0.4);
}
.stat-number {
  font-size: 30px;
  font-weight: 500;
  color: #0f172a;
  margin: 0 0 4px 0;
}
.stat-label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  margin: 0;
}
</style>
