<script setup>
defineProps({
  label: { type: String, default: '' },
  size: {
    type: String,
    default: 'md',
    validator: (valor) => ['sm', 'md', 'lg'].includes(valor),
  },
  fullscreen: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
})
</script>

<template>
  <div
    class="app-loader"
    :class="[
      `app-loader--${size}`,
      { 'app-loader--fullscreen': fullscreen, 'app-loader--block': block },
    ]"
    role="status"
    aria-live="polite"
  >
    <span class="oc-spinner" aria-hidden="true"></span>
    <span v-if="label" class="app-loader__label">{{ label }}</span>
    <span v-else class="app-loader__sr">Carregando</span>
  </div>
</template>

<style scoped>
.app-loader {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.9rem;
}

.app-loader--block {
  display: flex;
  width: 100%;
  min-height: 220px;
}

.app-loader--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  background: var(--branco, #ffffff);
  animation: app-loader-entrada 0.2s ease 0.25s both;
}

.app-loader--sm .oc-spinner {
  font-size: 1.25rem;
}

.app-loader--md .oc-spinner {
  font-size: 2rem;
}

.app-loader--lg .oc-spinner {
  font-size: 3rem;
}

.app-loader__label {
  font-size: 0.95rem;
  font-weight: 500;
  color: #64748b;
  text-align: center;
}

.app-loader__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

@keyframes app-loader-entrada {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>