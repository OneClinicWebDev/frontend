<script setup>
import { features } from '../Home.js'
</script>

<template>
  <section id="recursos" class="features">
    <div class="container">
      <div class="section-header">
        <span class="section-tag">Recursos</span>
        <h2 class="section-title">Tudo que sua clínica precisa</h2>
        <p class="section-description">
          Ferramentas completas para gerenciar todos os aspectos do seu negócio.
        </p>
      </div>
      <div class="features-grid">
        <div v-for="feature in features" :key="feature.title" class="feature-card">
          <div class="feature-icon">
            <i :class="feature.icon"></i>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features {
  padding: 6rem 0;
}
.section-header {
  text-align: center;
  margin-bottom: 4rem;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.feature-card {
  background: #FFFFFF;
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid #E5E7EB;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.feature-card:hover {
  transform: translateY(-10px);
  border-color: var(--cor-primaria);
  box-shadow: 0 15px 35px rgba(28, 164, 167, 0.1);
}
.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--cor-clara);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  transition: transform 0.3s ease, background 0.3s ease;
}
.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
  background: var(--cor-primaria);
}
.feature-card:hover .feature-icon i {
  color: var(--branco);
}
.feature-icon i {
  font-size: 1.5rem;
  color: var(--cor-secundaria);
  transition: color 0.3s ease;
}
.feature-title {
  margin-bottom: 0.75rem;
  font-size: 1.2rem;
  color: var(--cor-escura);
}
.feature-description {
  color: #6B7280;
  line-height: 1.7;
}

@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>