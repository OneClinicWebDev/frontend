<template>
  <header class="system-header">
    <div class="header-left">
      <h1>{{ pageTitle }}</h1>
    </div>

    <div class="header-right">
      <div class="user-menu" ref="menuRef">
        <button class="user-button" @click="toggleMenu">
          <div class="avatar">
            {{ initials }}
          </div>

          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
          </div>

          <i
            class="pi"
            :class="menuOpen ? 'pi-chevron-up' : 'pi-chevron-down'"
          ></i>
        </button>

        <Transition name="dropdown">
          <div v-if="menuOpen" class="dropdown-menu">
            <button class="dropdown-item">
              <i class="pi pi-user"></i>
              <span>Meu Perfil</span>
            </button>

            <button class="dropdown-item">
              <i class="pi pi-cog"></i>
              <span>Configurações</span>
            </button>

            <div class="dropdown-divider"></div>

            <button
              class="dropdown-item logout"
              @click="logout"
            >
              <i class="pi pi-sign-out"></i>
              <span>Sair</span>
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
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.system-header {
  height: 64px;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  background: var(--branco);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-left h1 {
  margin: 0;
  color: var(--cor-escura);
  font-size: 1.45rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0.35rem 0.5rem;
  border-radius: 10px;
  transition: all 0.25s ease;
}

.user-button:hover {
  background: rgba(28, 164, 167, 0.08);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--branco);
  background: linear-gradient(
    135deg,
    var(--cor-primaria),
    var(--cor-escura)
  );
  box-shadow: 0 4px 10px rgba(28, 164, 167, 0.2);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-name {
  color: var(--cor-escura);
  font-weight: 600;
  font-size: 0.9rem;
}

.user-button > i {
  font-size: 0.8rem;
  color: var(--cor-secundaria);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: 240px;
  background: var(--branco);
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  z-index: 999;
}

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.9rem;
  background: transparent;
  border: none;
  padding: 1rem 1.1rem;
  cursor: pointer;
  color: var(--cor-escura);
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.dropdown-item i {
  font-size: 1rem;
  color: var(--cor-secundaria);
}

.dropdown-item:hover {
  background: rgba(28, 164, 167, 0.08);
}

.dropdown-divider {
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
}

.logout {
  color: #ef4444;
}

.logout i {
  color: #ef4444;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .system-header {
    padding: 0 1rem;
  }

  .header-left h1 {
    font-size: 1.2rem;
  }

  .user-name {
    display: none;
  }

  .dropdown-menu {
    width: 220px;
  }
}

@media (max-width: 480px) {
  .system-header {
    height: 60px;
    min-height: 60px;
  }

  .header-left h1 {
    font-size: 1.05rem;
  }

  .avatar {
    width: 36px;
    height: 36px;
    font-size: 0.85rem;
  }
}
</style>