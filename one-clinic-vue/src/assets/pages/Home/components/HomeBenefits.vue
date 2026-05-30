<script setup>
import { benefits } from '../Home.js'
</script>

<template>
  <section id="beneficios" class="benefits">
    <div class="container benefits-content">
      <div class="benefits-text">
        <span class="section-tag">Benefícios</span>
        <h2 class="section-title">Por que escolher a OneClinic?</h2>
        <div class="benefits-list">
          <div v-for="benefit in benefits" :key="benefit.title" class="benefit-item">
            <div class="benefit-check">
              <i class="pi pi-check"></i>
            </div>
            <div>
              <h4 class="benefit-title">{{ benefit.title }}</h4>
              <p class="benefit-description">{{ benefit.description }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="benefits-visual">
        <div class="visual-card">
          <div class="visual-header">
            <span class="visual-dot"></span>
            <span class="visual-dot"></span>
            <span class="visual-dot"></span>
          </div>
          <div class="visual-content">
            <div class="visual-stat">
              <i class="pi pi-chart-line"></i>
              <div>
                <span class="visual-stat-value">+127%</span>
                <span class="visual-stat-label">Produtividade</span>
              </div>
            </div>
            <div class="visual-divider"></div>
            <div class="visual-stat">
              <i class="pi pi-clock"></i>
              <div>
                <span class="visual-stat-value">-45%</span>
                <span class="visual-stat-label">Tempo em tarefas</span>
              </div>
            </div>
            <div class="visual-divider"></div>
            <div class="visual-stat">
              <i class="pi pi-heart"></i>
              <div>
                <span class="visual-stat-value">+89%</span>
                <span class="visual-stat-label">Satisfação cliente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.benefits {
  padding: 6rem 0;
  background: #F9FAFB;
}
.benefits-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}
.benefits-list {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.benefit-item {
  display: flex;
  gap: 1rem;
  transition: transform 0.3s ease;
}
.benefit-item:hover {
  transform: translateX(10px);
}
.benefit-check {
  min-width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--cor-primaria);
  display: flex;
  align-items: center;
  justify-content: center;
}
.benefit-check i {
  color: white;
  font-size: 0.7rem;
}
.benefit-title {
  margin-bottom: 0.3rem;
  color: var(--cor-escura);
}
.benefit-description {
  color: #6B7280;
  line-height: 1.6;
}
.visual-card {
  background: var(--cor-secundaria);
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(11, 48, 66, 0.2);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}
.visual-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 25px 50px rgba(11, 48, 66, 0.3);
}
.visual-header {
  background: var(--cor-escura);
  padding: 1rem 1.5rem;
  display: flex;
  gap: 0.5rem;
}
.visual-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--cor-primaria);
}
.visual-dot:nth-child(2) {
  background: #F59E0B;
}
.visual-dot:nth-child(3) {
  background: #10B981;
}
.visual-content {
  padding: 2rem;
}
.visual-stat {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  transition: background 0.3s ease, padding-left 0.3s ease;
  border-radius: 0.5rem;
}
.visual-stat:hover {
  background: rgba(255, 255, 255, 0.05);
  padding-left: 1rem;
}
.visual-stat i {
  font-size: 1.5rem;
  color: var(--cor-primaria);
}
.visual-stat-value {
  display: block;
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
}
.visual-stat-label {
  color: #D1FAE5;
}
.visual-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

@media (max-width: 1024px) {
  .benefits-content {
    grid-template-columns: 1fr;
  }
}
</style>