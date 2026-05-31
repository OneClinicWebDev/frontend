<template>
  <div class="sidebar-overlay" :class="{ 'active': !isCollapsed && isMobile }" @click="isCollapsed = true"></div>

  <button v-show="isCollapsed && isMobile" class="mobile-toggle" @click="isCollapsed = false">
    <i class="pi pi-bars"></i>
  </button>

  <aside :class="['sidebar', { 'collapsed': isCollapsed }]">
    
    <div class="sidebar-header" @click="isCollapsed = !isCollapsed" title="Clique para expandir/recolher">
      
      <div v-if="isCollapsed && !isMobile" class="logo-wrapper">
        <img :src="LOGO_URL" alt="Logo" class="logo-img" />
      </div>

      <div v-else class="logo-text-wrapper">
        <div class="logo-text">
          <span class="logo-one">ONE</span>
          <span class="logo-clinic">clinic</span>
        </div>
      </div>

    </div>

    <nav class="sidebar-nav">
      <router-link to="/app/dashboard" class="nav-item" @click="closeOnMobile">
        <div class="icon-wrapper"><i class="pi pi-th-large"></i></div>
        <span>Dashboard</span>
      </router-link>
      
      <router-link to="/app/agenda" class="nav-item" @click="closeOnMobile">
        <div class="icon-wrapper"><i class="pi pi-calendar"></i></div>
        <span>Agenda</span>
      </router-link>
      
      <router-link to="/app/clientes" class="nav-item" @click="closeOnMobile">
        <div class="icon-wrapper"><i class="pi pi-users"></i></div>
        <span>Clientes</span>
      </router-link>
      
      <router-link to="/app/atendimentos" class="nav-item" @click="closeOnMobile">
        <div class="icon-wrapper"><i class="pi pi-list"></i></div>
        <span>Atendimentos</span>
      </router-link>
      
      <router-link to="/app/financeiro" class="nav-item" @click="closeOnMobile">
        <div class="icon-wrapper"><i class="pi pi-dollar"></i></div>
        <span>Financeiro</span>
      </router-link>
      
      <router-link to="/app/estoque" class="nav-item" @click="closeOnMobile">
        <div class="icon-wrapper"><i class="pi pi-box"></i></div>
        <span>Estoque</span>
      </router-link>
      
      <router-link to="/app/profissionais" class="nav-item" @click="closeOnMobile">
        <div class="icon-wrapper"><i class="pi pi-id-card"></i></div>
        <span>Profissionais</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <a href="#" class="nav-item" @click="closeOnMobile">
        <div class="icon-wrapper"><i class="pi pi-cog"></i></div>
        <span>Configurações</span>
      </a>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { LOGO_URL } from '@/config.js'

const isCollapsed = ref(true)
const isMobile = ref(false)

const checkScreenSize = () => {
  isMobile.value = window.innerWidth <= 768
}

const closeOnMobile = () => {
  if (isMobile.value) {
    isCollapsed.value = true
  }
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: var(--cor-escura, #1F2937);
  color: var(--branco, #FFFFFF);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  min-height: 100vh;
  transition: width 0.55s cubic-bezier(0.4, 0, 0.2, 1), transform 0.55s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  z-index: 1000;
}

.sidebar.collapsed {
  width: 70px;
}

.sidebar-header {
  height: 72px;
  display: flex;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.15);
  cursor: pointer;
  user-select: none;
  transition: background-color 0.4s ease;
}

.sidebar-header:hover {
  background-color: rgba(0, 0, 0, 0.25);
}

.logo-wrapper {
  width: 70px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  animation: fadeIn 0.4s ease-in-out;
}

.logo-img {
  width: 32px;
  height: 32px;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.sidebar-header:hover .logo-img {
  transform: scale(1.08) rotate(3deg);
}

.logo-text-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.4s ease-in-out;
}

.logo-text {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 1.5rem;
  width: 100%;
}

.logo-one {
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--branco, #FFFFFF);
}

.logo-clinic {
  font-weight: 300; 
  color: var(--branco, #FFFFFF);
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.sidebar-nav {
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex-grow: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  height: 46px;
  margin: 0 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 8px;
  transition: background-color 0.45s ease, color 0.45s ease;
  overflow: hidden;
}

.icon-wrapper {
  width: 54px; 
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.icon-wrapper i {
  font-size: 1.15rem;
  transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.nav-item span {
  font-size: 0.95rem;
  font-weight: 500;
  white-space: nowrap;
  transition: opacity 0.4s ease, transform 0.4s ease;
  opacity: 1;
}

.nav-item:hover, .nav-item.router-link-active {
  background-color: var(--cor-primaria, #1CA4A7);
  color: var(--branco, #FFFFFF);
}

.nav-item:hover .icon-wrapper i,
.nav-item.router-link-active .icon-wrapper i {
  transform: scale(1.15);
}

.nav-item:hover span {
  transform: translateX(4px);
}

.sidebar-footer {
  padding: 1rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-overlay {
  display: none;
}

.mobile-toggle {
  display: none;
}

@media (max-width: 768px) {
  .mobile-toggle {
    display: flex;
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 998;
    background-color: var(--cor-primaria, #1CA4A7);
    color: white;
    border: none;
    width: 44px;
    height: 44px;
    border-radius: 8px;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0,0,0,0.15);
    transition: transform 0.2s ease;
  }
  
  .mobile-toggle:active {
    transform: scale(0.95);
  }

  .sidebar-overlay.active {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(2px);
    z-index: 999;
  }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    box-shadow: 4px 0 15px rgba(0,0,0,0.3);
    transform: translateX(0);
  }

  .sidebar.collapsed {
    width: 250px;
    transform: translateX(-105%);
  }
}
</style>