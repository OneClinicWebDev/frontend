<script setup>
import { Button } from '../Home.js'
defineEmits(['open-login'])
</script>

<template>
  <section class="hero">
    <div class="hero-bg">
      <div class="hero-circle hero-circle-1"></div>
      <div class="hero-circle hero-circle-2"></div>
    </div>
    <div class="container hero-content">
      <span class="hero-tag">Novo</span>
      <h1 class="hero-title">
        Gestão completa para sua
        <span class="hero-highlight">clínica de estética</span>
      </h1>
      <p class="hero-description">
        Simplifique o dia a dia da sua clínica com agendamentos inteligentes,
        controle financeiro, gestão de clientes e muito mais.
      </p>
      <div class="hero-actions">
        <Button label="Começar Teste Grátis" class="btn-primary btn-large" />
        <Button label="Entrar" outlined class="btn-outline btn-large" @click="$emit('open-login')" />
      </div>
      <div class="hero-stats">
        <div class="stat">
          <span class="stat-value">500+</span>
          <span class="stat-label">Clínicas ativas</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">50k+</span>
          <span class="stat-label">Agendamentos/mês</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">98%</span>
          <span class="stat-label">Satisfação</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  overflow: hidden;
  padding: 9rem 0 6rem;
  background: linear-gradient(180deg, #FFFFFF 0%, #F3F4F6 100%);
}
.hero-bg {
  position: absolute;
  inset: 0;
}
.hero-circle {
  position: absolute;
  border-radius: 50%;
  transition: transform 1s ease-in-out;
}
.hero:hover .hero-circle-1 {
  transform: scale(1.05) translate(-20px, 20px);
}
.hero:hover .hero-circle-2 {
  transform: scale(1.05) translate(20px, -20px);
}
.hero-circle-1 {
  width: 600px;
  height: 600px;
  background: var(--cor-primaria);
  opacity: 0.08;
  top: -200px;
  right: -100px;
}
.hero-circle-2 {
  width: 400px;
  height: 400px;
  background: var(--cor-secundaria);
  opacity: 0.05;
  bottom: -100px;
  left: -100px;
}
.hero-content {
  position: relative;
  text-align: center;
}
.hero-tag {
  display: inline-block;
  background: var(--cor-clara);
  color: var(--cor-secundaria);
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.hero-title {
  font-size: 3.5rem;
  line-height: 1.1;
  margin: 1.5rem 0;
  font-weight: 700;
}
.hero-highlight {
  color: var(--cor-primaria);
}
.hero-description {
  max-width: 700px;
  margin: 0 auto 2rem;
  line-height: 1.7;
  color: #4B5563;
  font-size: 1.1rem;
}
.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
}
.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
}
.stat {
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
}
.stat:hover {
  transform: translateY(-5px);
}
.stat-value {
  color: var(--cor-primaria);
  font-size: 1.6rem;
  font-weight: 700;
}
.stat-label {
  color: #6B7280;
}
.stat-divider {
  width: 1px;
  height: 40px;
  background: #D1D5DB;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }
  .hero-actions {
    flex-direction: column;
    width: 100%;
  }
  .hero-actions :deep(.p-button) {
    width: 100%;
  }
  .hero-stats {
    flex-direction: column;
    gap: 1rem;
  }
  .stat-divider {
    width: 40px;
    height: 1px;
  }
}
</style>