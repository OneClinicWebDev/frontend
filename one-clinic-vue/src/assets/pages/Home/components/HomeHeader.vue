<script setup>
import { Button } from '../Home.js'
</script>

<template>
  <header class="header">
    <div class="container header-content">
      <div class="logo">
        <img src="https://asfldefzwlocpuszoedj.supabase.co/storage/v1/object/public/LOGO/ONE%20CLINIC%20-%20LOGO%20-%20PNG.png" alt="One Clinic Logo" class="logo-img-main" />
        <span class="logo-text">
          <span class="logo-one">ONE</span>
          <span class="logo-clinic">clinic</span>
        </span>
      </div>
      <nav class="nav-desktop">
        <a href="#recursos" class="nav-link">Recursos</a>
        <a href="#beneficios" class="nav-link">Benefícios</a>
        <a href="#contato" class="nav-link">Contato</a>
      </nav>
      <div class="header-actions">
        <Button label="Entrar" text class="btn-text"/>
        <Button label="Começar Grátis" class="btn-primary"/>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #E5E7EB;
  transition: all 0.3s ease-in-out;
}
.header-content {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-desktop {
  display: flex;
  gap: 2rem;
}
.nav-link {
  text-decoration: none;
  color: var(--cor-secundaria);
  font-weight: 500;
  transition: color 0.3s ease, transform 0.3s ease;
}
.nav-link:hover {
  color: var(--cor-primaria);
  transform: translateY(-2px);
}
.header-actions {
  display: flex;
  gap: 0.75rem;
}

@media (max-width: 1024px) {
  .nav-desktop {
    display: none;
  }
  .header-actions {
    display: none;
  }
  .header-content {
    justify-content: center;
  }
}
</style>