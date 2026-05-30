<script setup>
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const pageTitle = computed(() => route.name)
</script>

<template>
  <div class="system-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <img src="https://asfldefzwlocpuszoedj.supabase.co/storage/v1/object/public/LOGO/ONE%20CLINIC%20-%20LOGO%20-%20PNG.png" alt="Logo" class="logo-img" />
        <span class="logo-text">ONE<span class="font-light">clinic</span></span>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/app/dashboard" class="nav-item active">
          <i class="pi pi-th-large"></i> Dashboard
        </router-link>
        <a href="#" class="nav-item"><i class="pi pi-calendar"></i> Agenda</a>
        <a href="#" class="nav-item"><i class="pi pi-users"></i> Clientes</a>
        <a href="#" class="nav-item"><i class="pi pi-list"></i> Atendimentos</a>
        <a href="#" class="nav-item"><i class="pi pi-dollar"></i> Financeiro</a>
        <a href="#" class="nav-item"><i class="pi pi-box"></i> Estoque</a>
        <a href="#" class="nav-item"><i class="pi pi-id-card"></i> Profissionais</a>
      </nav>

      <div class="sidebar-footer">
        <a href="#" class="nav-item"><i class="pi pi-cog"></i> Configurações</a>
      </div>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <h1 class="page-title">{{ pageTitle }}</h1>
        <div class="user-profile">
          <div class="avatar">MC</div>
          <span class="user-name">Maria Costa</span>
        </div>
      </header>

      <div class="page-content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
.system-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--cor-clara, #F3F4F6);
}

.sidebar {
  width: 250px;
  background-color: var(--cor-escura, #1F2937);
  color: var(--branco, #FFFFFF);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-logo {
  height: 72px;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  background-color: rgba(0, 0, 0, 0.2);
  gap: 0.75rem;
}

.logo-img {
  width: 32px;
  height: 32px;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--branco, #FFFFFF);
}

.font-light {
  font-weight: 300;
}

.sidebar-nav {
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.2s;
  font-size: 0.95rem;
}

.nav-item:hover, .nav-item.active {
  background-color: var(--cor-primaria, #1CA4A7);
  color: var(--branco, #FFFFFF);
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.main-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.topbar {
  height: 72px;
  background-color: var(--branco, #FFFFFF);
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--cor-escura, #111827);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.avatar {
  width: 36px;
  height: 36px;
  background-color: var(--cor-secundaria, #374151);
  color: var(--branco, #FFFFFF);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.user-name {
  font-weight: 500;
  color: var(--cor-secundaria, #374151);
  font-size: 0.95rem;
}

.page-content {
  padding: 2rem;
}
</style>