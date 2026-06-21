<template>
  <header class="system-header">
    <div class="header-left">
      <h1>{{ pageTitle }}</h1>
    </div>

    <div class="header-right">
      <div class="datetime-wrapper">
        <div class="datetime-block">
          <i class="pi pi-calendar"></i>
          <span>{{ currentDate }}</span>
        </div>
        
        <div class="divider"></div>
        
        <div class="datetime-block">
          <i class="pi pi-clock"></i>
          <span>{{ currentTime }}</span>
        </div>
      </div>

      <div class="user-menu" ref="menuRef">
        <button class="user-button" @click="toggleMenu" :class="{ 'is-active': menuOpen }">
          <div class="avatar">
            {{ initials }}
          </div>

          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">Administrador</span>
          </div>

          <i
            class="pi pi-chevron-down toggle-icon"
            :class="{ 'rotate': menuOpen }"
          ></i>
        </button>

        <Transition name="dropdown">
          <div v-if="menuOpen" class="dropdown-menu">
            <div class="dropdown-header-mobile">
              <span class="mobile-name">{{ userName }}</span>
              <span class="mobile-role">Administrador</span>
            </div>
            
            <button class="dropdown-item">
              <i class="pi pi-user"></i>
              <span>Meu Perfil</span>
            </button>

            <button class="dropdown-item">
              <i class="pi pi-cog"></i>
              <span>Configurações</span>
            </button>

            <div class="dropdown-divider"></div>

            <button class="dropdown-item logout" @click="logout">
              <i class="pi pi-sign-out"></i>
              <span>Sair do Sistema</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const menuOpen = ref(false)
const menuRef = ref(null)

const userName = ref('Ana Olichta')

const currentTime = ref('')
const currentDate = ref('')
let timerInterval = null

const initials = computed(() => {
  return userName.value
    .split(' ')
    .slice(0, 2)
    .map(nome => nome[0])
    .join('')
    .toUpperCase()
})

const pageTitle = computed(() => {
  return route.name || 'Dashboard'
})

const updateDateTime = () => {
  const now = new Date()
  
  currentTime.value = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
  
  const dateStr = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
  
  currentDate.value = dateStr
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const logout = () => {
  localStorage.clear()
  sessionStorage.clear()
  menuOpen.value = false
  router.replace('/')
}

const handleClickOutside = (event) => {
  if (
    menuRef.value &&
    !menuRef.value.contains(event.target)
  ) {
    menuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  updateDateTime()
  timerInterval = setInterval(updateDateTime, 1000)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.system-header {
  height: 72px;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.02);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left h1 {
  margin: 0;
  color: var(--cor-escura);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  position: relative;
}

.header-left h1::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 24px;
  height: 3px;
  background: var(--cor-primaria);
  border-radius: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.datetime-wrapper {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding-right: 2rem;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}

.datetime-block {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cor-secundaria);
  font-size: 0.85rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.datetime-block:hover {
  color: var(--cor-escura);
}

.datetime-block i {
  color: var(--cor-primaria);
  font-size: 1.05rem;
  opacity: 0.85;
}

.divider {
  width: 4px;
  height: 4px;
  background: var(--cor-secundaria);
  border-radius: 50%;
  opacity: 0.3;
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  background: var(--branco);
  border: 1px solid rgba(0, 0, 0, 0.04);
  cursor: pointer;
  padding: 0.4rem 0.875rem 0.4rem 0.4rem;
  border-radius: 50px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.user-button:hover,
.user-button.is-active {
  border-color: rgba(28, 164, 167, 0.2);
  background: rgba(28, 164, 167, 0.02);
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.08);
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--branco);
  background: linear-gradient(135deg, var(--cor-primaria), #158284);
  box-shadow: 0 0 0 2px var(--branco), 0 0 0 4px rgba(28, 164, 167, 0.15);
  transition: transform 0.3s ease;
}

.user-button:hover .avatar {
  transform: scale(1.05);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}

.user-name {
  color: var(--cor-escura);
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1.2;
}

.user-role {
  font-size: 0.75rem;
  color: var(--cor-secundaria);
  font-weight: 500;
  opacity: 0.8;
}

.toggle-icon {
  font-size: 0.7rem;
  color: var(--cor-secundaria);
  margin-left: 0.25rem;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-icon.rotate {
  transform: rotate(-180deg);
  color: var(--cor-primaria);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 260px;
  background: var(--branco);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 12px 40px -8px rgba(0, 0, 0, 0.12), 0 4px 12px -4px rgba(0, 0, 0, 0.04);
  padding: 0.5rem;
  z-index: 999;
  transform-origin: top right;
}

.dropdown-header-mobile {
  display: none;
  padding: 1rem 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  margin-bottom: 0.5rem;
}

.mobile-name {
  display: block;
  font-weight: 600;
  color: var(--cor-escura);
  font-size: 0.95rem;
}

.mobile-role {
  display: block;
  font-size: 0.8rem;
  color: var(--cor-secundaria);
  margin-top: 0.15rem;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: transparent;
  border: none;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  color: var(--cor-escura);
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.dropdown-item i {
  font-size: 1.1rem;
  color: var(--cor-secundaria);
  transition: color 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(28, 164, 167, 0.06);
  color: var(--cor-primaria);
  transform: translateX(4px);
}

.dropdown-item:hover i {
  color: var(--cor-primaria);
}

.dropdown-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.06);
  margin: 0.5rem 0;
}

.logout {
  color: #ef4444;
}

.logout i {
  color: #ef4444;
}

.logout:hover {
  background: #fef2f2;
  color: #dc2626;
}

.logout:hover i {
  color: #dc2626;
}

.dropdown-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-10px);
}

@media (max-width: 1024px) {
  .datetime-wrapper {
    display: none;
  }
}

@media (max-width: 768px) {
  .system-header {
    padding: 0 1.25rem;
    height: 64px;
    min-height: 64px;
  }

  .header-left h1 {
    font-size: 1.25rem;
  }

  .user-info {
    display: none;
  }

  .user-button {
    padding: 0.35rem;
    border-radius: 50%;
  }

  .toggle-icon {
    display: none;
  }

  .avatar {
    width: 38px;
    height: 38px;
    box-shadow: none;
  }

  .dropdown-menu {
    width: 240px;
    top: calc(100% + 8px);
  }

  .dropdown-header-mobile {
    display: block;
  }
}

@media (max-width: 480px) {
  .system-header {
    height: 60px;
    min-height: 60px;
    padding: 0 1rem;
  }

  .header-left h1 {
    font-size: 1.15rem;
  }
}
</style>