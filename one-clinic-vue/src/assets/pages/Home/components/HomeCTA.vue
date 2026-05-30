<script setup>
import { Button } from '../Home.js'
</script>

<template>
  <section class="cta">
    <div class="container cta-content">
      <h2 class="cta-title">Pronto para transformar sua clínica?</h2>
      <p class="cta-description">Comece seu teste gratuito de 14 dias.</p>
      <div class="cta-actions">
        <Button label="Começar Agora" class="btn-cta btn-large" />
        <Button label="Falar com Consultor" text class="btn-cta-text btn-large" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta {
  padding: 6rem 0;
  background: linear-gradient(135deg, var(--cor-secundaria), var(--cor-escura));
  position: relative;
  overflow: hidden;
}
.cta-content {
  text-align: center;
  position: relative;
  z-index: 2;
}
.cta-title {
  color: white;
  font-size: 2.8rem;
  margin-bottom: 1rem;
}
.cta-description {
  color: #D1FAE5;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}
.cta-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.btn-cta {
  background: var(--branco) !important;
  border: none !important;
  color: var(--cor-secundaria) !important;
  font-weight: 600 !important;
  font-size: 0.95rem !important;
  padding: 0.875rem 1.75rem !important;
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 4px 14px rgba(255, 255, 255, 0.2) !important;
}
.btn-cta:hover {
  background: var(--cor-clara) !important;
  transform: translateY(-3px) !important;
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3) !important;
}
.btn-cta-text {
  color: var(--branco) !important;
  font-weight: 600 !important;
  font-size: 0.95rem !important;
  padding: 0.875rem 1.75rem !important;
  border-radius: 12px !important;
  border: 2px solid rgba(255, 255, 255, 0.3) !important;
  background: transparent !important;
  transition: all 0.3s ease !important;
}
.btn-cta-text:hover {
  background: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  transform: translateY(-3px) !important;
}

@media (max-width: 768px) {
  .cta-actions {
    flex-direction: column;
    width: 100%;
  }
  .cta-actions :deep(.p-button) {
    width: 100%;
  }
}
</style>