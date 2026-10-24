<script setup>
import { Button } from "../Home.js";
defineEmits(["open-colaborador", "open-cliente"]);
</script>

<template>
  <section class="hero">
    <div class="hero-bg">
      <div class="hero-circle hero-circle-1"></div>
      <div class="hero-circle hero-circle-2"></div>
    </div>
    
    <div class="container hero-content">
      <span class="hero-tag">Acesso ao Portal</span>
      
      <h1 class="hero-title">
        Bem-vindo à
        <span class="hero-highlight">OneClinic</span>
      </h1>
      
      <p class="hero-description">
        Selecione o seu perfil abaixo para acessar o sistema. Gestão inteligente para
        colaboradores e acompanhamento completo para clientes.
      </p>
      
      <div class="hero-actions">
        <Button
          label="Sou Colaborador"
          class="btn-primary btn-large"
          @click="$emit('open-colaborador')"
        />
        <Button
          label="Sou Cliente"
          outlined
          class="btn-outline btn-large"
          @click="$emit('open-cliente')"
        />
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
  /* Define que a altura mínima será 100% da altura da tela visível */
  min-height: 100vh;
  width: 100%;
  
  /* Flexbox para centralizar todo o conteúdo vertical e horizontalmente */
  display: flex;
  align-items: center; 
  justify-content: center;
  
  background: linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%);
  padding: 2rem; /* Espaçamento de segurança em telas menores */
  box-sizing: border-box;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
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
  background: var(--cor-primaria, #0ea5e9);
  opacity: 0.08;
  top: -150px;
  right: -150px;
}

.hero-circle-2 {
  width: 400px;
  height: 400px;
  background: var(--cor-secundaria, #6366f1);
  opacity: 0.05;
  bottom: -100px;
  left: -100px;
}

/* Container do conteúdo que fica em cima do background */
.hero-content {
  position: relative;
  z-index: 1; /* Garante que fique acima dos círculos */
  text-align: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-tag {
  display: inline-block;
  background: var(--cor-clara, #e0e7ff);
  color: var(--cor-secundaria, #4f46e5);
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 1rem;
}

.hero-title {
  font-size: 4rem;
  line-height: 1.2;
  margin: 0.5rem 0 1.5rem;
  font-weight: 800;
  color: #111827;
}

.hero-highlight {
  color: var(--cor-primaria, #0ea5e9);
}

.hero-description {
  max-width: 700px;
  margin: 0 auto 2.5rem;
  line-height: 1.7;
  color: #4b5563;
  font-size: 1.2rem;
}

.hero-actions {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 4rem;
}

/* Ajustes nos botões caso necessário */
.hero-actions :deep(.p-button),
.hero-actions .btn-large {
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
}

.hero-stats {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}

.stat {
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;
  padding: 0 1rem;
}

.stat:hover {
  transform: translateY(-5px);
}

.stat-value {
  color: var(--cor-primaria, #0ea5e9);
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #6b7280;
  font-size: 0.95rem;
  font-weight: 500;
}

.stat-divider {
  width: 2px;
  height: 50px;
  background: #e5e7eb;
}

/* Responsividade para tablets e celulares */
@media (max-width: 768px) {
  .hero {
    padding: 2rem 1rem;
    min-height: 100vh; /* Continua tela inteira */
  }

  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
    width: 100%;
    gap: 1rem;
  }

  .hero-actions :deep(.p-button), 
  .hero-actions .btn-large {
    width: 100%;
  }

  .hero-stats {
    flex-direction: column;
    gap: 1.5rem;
  }

  .stat-divider {
    width: 60px;
    height: 2px;
  }
}
</style>