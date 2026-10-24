
<template>
  <header class="system-header" data-cy="header">
    <div class="header-left">
      <h1 data-cy="page-title">{{ pageTitle }}</h1>
    </div>

    <div class="header-right">
      <div class="datetime-wrapper" data-cy="datetime-wrapper">
        <div class="datetime-block" data-cy="date-block">
          <i class="pi pi-calendar"></i>
          <span data-cy="current-date">{{ currentDate }}</span>
        </div>

        <div class="divider"></div>

        <div class="datetime-block" data-cy="time-block">
          <i class="pi pi-clock"></i>
          <span data-cy="current-time">{{ currentTime }}</span>
        </div>
      </div>

      <div class="user-menu" ref="menuRef" data-cy="user-menu">
        <button
          class="user-button"
          data-cy="user-button"
          type="button"
          :class="{ 'is-active': menuOpen }"
          :aria-expanded="menuOpen"
          aria-haspopup="true"
          @click="toggleMenu"
        >
          <div class="avatar" data-cy="avatar">
            {{ initials }}
          </div>

          <div class="user-info">
            <span class="user-name" data-cy="user-name">
              {{ clinicaAtivaNome }}
            </span>

            <span class="user-role" data-cy="user-role">
              {{ userRoleLabel }}
            </span>
          </div>

          <i
            class="pi pi-chevron-down toggle-icon"
            data-cy="toggle-icon"
            :class="{ rotate: menuOpen }"
          ></i>
        </button>

        <Transition name="dropdown">
          <div
            v-if="menuOpen"
            class="dropdown-menu"
            data-cy="dropdown-menu"
            role="menu"
          >
            <div class="dropdown-header-mobile" data-cy="dropdown-mobile-header">
              <span class="mobile-name" data-cy="mobile-user-name">
                {{ clinicaAtivaNome }}
              </span>

              <span class="mobile-role" data-cy="mobile-user-role">
                {{ userRoleLabel }}
              </span>

              <span v-if="usuarioNome" class="mobile-account">
                {{ usuarioNome }}
              </span>
            </div>

            <div class="account-summary">
              <div class="account-summary-avatar">
                {{ usuarioIniciais }}
              </div>

              <div class="account-summary-info">
                <span class="account-summary-name">
                  {{ usuarioNome || 'Minha conta' }}
                </span>
                <span class="account-summary-label">
                  Conta conectada
                </span>
              </div>
            </div>

            <button
              class="dropdown-item"
              data-cy="menu-profile"
              type="button"
              role="menuitem"
              @click="goToProfile"
            >
              <i class="pi pi-user"></i>
              <span>Meu Perfil</span>
              <i class="pi pi-angle-right item-arrow"></i>
            </button>

            <button
              v-if="isAdmin"
              class="dropdown-item"
              data-cy="menu-settings"
              type="button"
              role="menuitem"
              @click="goToClinica"
            >
              <i class="pi pi-building"></i>
              <span>Configurações da Clínica</span>
              <i class="pi pi-angle-right item-arrow"></i>
            </button>

            <div
              v-if="vinculos.length > 1"
              class="clinic-switcher"
            >
              <div class="section-heading">
                <i class="pi pi-sitemap"></i>
                <span>Minhas clínicas</span>
              </div>

              <button
                v-for="vinculo in vinculos"
                :key="vinculo.clinica_id"
                type="button"
                class="clinic-option"
                :class="{
                  'clinic-option-active':
                    String(vinculo.clinica_id) === String(clinicaAtivaId),
                }"
                :disabled="
                  trocandoClinica ||
                  String(vinculo.clinica_id) === String(clinicaAtivaId)
                "
                @click="switchClinic(vinculo.clinica_id)"
              >
                <span class="clinic-option-icon">
                  <i class="pi pi-building"></i>
                </span>

                <span class="clinic-option-info">
                  <span class="clinic-option-name">
                    {{ vinculo.clinica_nome }}
                  </span>
                  <span class="clinic-option-role">
                    {{ formatRole(vinculo.role) }}
                  </span>
                </span>

                <i
                  v-if="String(vinculo.clinica_id) === String(clinicaAtivaId)"
                  class="pi pi-check clinic-check"
                ></i>

                <i
                  v-else
                  class="pi pi-arrow-right clinic-arrow"
                ></i>
              </button>
            </div>

            <div class="dropdown-divider"></div>

            <button
              class="dropdown-item"
              data-cy="menu-switch-account"
              type="button"
              role="menuitem"
              :disabled="encerrandoSessao"
              @click="switchAccount"
            >
              <i class="pi pi-users"></i>
              <span>Trocar de Conta</span>
              <i class="pi pi-angle-right item-arrow"></i>
            </button>

            <button
              class="dropdown-item logout-item"
              data-cy="menu-logout"
              type="button"
              role="menuitem"
              :disabled="encerrandoSessao"
              @click="handleLogout"
            >
              <i :class="encerrandoSessao ? 'pi pi-spin pi-spinner' : 'pi pi-sign-out'"></i>
              <span>{{ encerrandoSessao ? 'Encerrando sessão...' : 'Sair do Sistema' }}</span>
            </button>

            <p v-if="erroMenu" class="menu-error" role="alert">
              {{ erroMenu }}
            </p>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../../store/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const menuOpen = ref(false)
const menuRef = ref(null)
const currentTime = ref('')
const currentDate = ref('')
const trocandoClinica = ref(false)
const encerrandoSessao = ref(false)
const erroMenu = ref('')
let timer = null

const updateDateTime = () => {
  const now = new Date()

  currentTime.value = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  currentDate.value = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const pageTitle = computed(() => route.meta.title || 'Sistema')

const clinicaAtiva = computed(() => authStore.clinicaAtiva)

const clinicaAtivaId = computed(() => authStore.clinicaAtivaId)

const clinicaAtivaNome = computed(
  () => clinicaAtiva.value?.clinica_nome || 'Selecione uma clínica',
)

const userRole = computed(() => clinicaAtiva.value?.role || '')

const userRoleLabel = computed(() => formatRole(userRole.value))

const vinculos = computed(() => authStore.vinculos || [])

const usuarioNome = computed(
  () => authStore.usuario?.nome || authStore.usuario?.nome_completo || '',
)

const initials = computed(() => {
  const nome = clinicaAtivaNome.value.trim()

  if (!nome || nome === 'Selecione uma clínica') {
    return 'OC'
  }

  const palavras = nome.split(/\s+/)

  return palavras.length > 1
    ? `${palavras[0][0]}${palavras[1][0]}`.toUpperCase()
    : nome.substring(0, 2).toUpperCase()
})

const usuarioIniciais = computed(() => {
  const nome = usuarioNome.value.trim()

  if (!nome) {
    return 'US'
  }

  const palavras = nome.split(/\s+/)

  return palavras.length > 1
    ? `${palavras[0][0]}${palavras[palavras.length - 1][0]}`.toUpperCase()
    : nome.substring(0, 2).toUpperCase()
})

const isAdmin = computed(() => userRole.value === 'ADMIN')

function formatRole(role) {
  const roles = {
    ADMIN: 'Administrador',
    SECRETARIO: 'Secretário',
    PROFISSIONAL: 'Profissional',
  }

  return roles[role] || role || 'Usuário'
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
  erroMenu.value = ''
}

function closeMenu(event) {
  if (menuRef.value && !menuRef.value.contains(event.target)) {
    menuOpen.value = false
    erroMenu.value = ''
  }
}

function goToProfile() {
  menuOpen.value = false
  router.push('/app/meu-perfil')
}

function goToClinica() {
  menuOpen.value = false
  router.push('/app/configuracoes-clinica')
}

async function switchClinic(clinicaId) {
  if (
    trocandoClinica.value ||
    String(clinicaId) === String(authStore.clinicaAtivaId)
  ) {
    return
  }

  trocandoClinica.value = true
  erroMenu.value = ''

  try {
    authStore.setClinicaAtiva(clinicaId)
    menuOpen.value = false
    await router.replace('/app/dashboard')
  } catch (error) {
    erroMenu.value =
      error.message || 'Não foi possível trocar de clínica.'
  } finally {
    trocandoClinica.value = false
  }
}

async function switchAccount() {
  if (encerrandoSessao.value) {
    return
  }

  encerrandoSessao.value = true
  erroMenu.value = ''
  menuOpen.value = false

  try {
    await authStore.logout()
    await router.replace('/')
  } catch {
    authStore.limparSessao()
    await router.replace('/')
  } finally {
    encerrandoSessao.value = false
  }
}

async function handleLogout() {
  if (encerrandoSessao.value) {
    return
  }

  encerrandoSessao.value = true
  erroMenu.value = ''
  menuOpen.value = false

  try {
    await authStore.logout()
    await router.replace('/')
  } catch {
    authStore.limparSessao()
    await router.replace('/')
  } finally {
    encerrandoSessao.value = false
  }
}

onMounted(() => {
  updateDateTime()
  timer = setInterval(updateDateTime, 60000)
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }

  document.removeEventListener('click', closeMenu)
})
</script>

<style scoped>
.system-header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  padding: 0 2rem;
  background: rgba(255, 255, 255, 0.88);
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.025);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.header-left {
  display: flex;
  align-items: center;
  min-width: 0;
}

.header-left h1 {
  position: relative;
  margin: 0;
  color: var(--cor-escura);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.035em;
}

.header-left h1::after {
  position: absolute;
  bottom: -7px;
  left: 0;
  width: 28px;
  height: 3px;
  border-radius: 10px;
  background: var(--cor-primaria);
  content: '';
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.75rem;
}

.datetime-wrapper {
  display: flex;
  align-items: center;
  gap: 1.15rem;
  padding-right: 1.75rem;
  border-right: 1px solid rgba(15, 23, 42, 0.08);
}

.datetime-block {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  color: var(--cor-secundaria);
  font-size: 0.84rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.datetime-block:hover {
  color: var(--cor-escura);
}

.datetime-block i {
  color: var(--cor-primaria);
  font-size: 1rem;
}

.divider {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--cor-secundaria);
  opacity: 0.35;
}

.user-menu {
  position: relative;
}

.user-button {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.4rem 0.85rem 0.4rem 0.4rem;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.025);
  cursor: pointer;
  transition:
    border-color 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
}

.user-button:hover,
.user-button.is-active {
  border-color: rgba(28, 164, 167, 0.25);
  background: rgba(28, 164, 167, 0.035);
  box-shadow: 0 5px 18px rgba(28, 164, 167, 0.09);
}

.user-button:active {
  transform: scale(0.98);
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--cor-primaria), #158284);
  box-shadow: 0 0 0 3px rgba(28, 164, 167, 0.1);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  transition: transform 0.25s ease;
}

.user-button:hover .avatar {
  transform: scale(1.04);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  max-width: 180px;
  gap: 0.2rem;
}

.user-name {
  overflow: hidden;
  max-width: 100%;
  color: var(--cor-escura);
  font-size: 0.88rem;
  font-weight: 650;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  color: var(--cor-secundaria);
  font-size: 0.73rem;
  font-weight: 500;
}

.toggle-icon {
  margin-left: 0.2rem;
  color: var(--cor-secundaria);
  font-size: 0.7rem;
  transition:
    transform 0.25s ease,
    color 0.25s ease;
}

.toggle-icon.rotate {
  transform: rotate(180deg);
  color: var(--cor-primaria);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  z-index: 999;
  width: 310px;
  max-height: min(78vh, 650px);
  overflow-y: auto;
  padding: 0.55rem;
  border: 1px solid rgba(15, 23, 42, 0.07);
  border-radius: 18px;
  background: #fff;
  box-shadow:
    0 20px 55px rgba(15, 23, 42, 0.13),
    0 4px 14px rgba(15, 23, 42, 0.04);
  transform-origin: top right;
}

.account-summary {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.85rem 0.75rem 1rem;
  margin-bottom: 0.4rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.07);
}

.account-summary-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: 1px solid rgba(28, 164, 167, 0.14);
  border-radius: 13px;
  background: rgba(28, 164, 167, 0.09);
  color: var(--cor-primaria);
  font-size: 0.85rem;
  font-weight: 700;
}

.account-summary-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 0.25rem;
}

.account-summary-name {
  overflow: hidden;
  color: var(--cor-escura);
  font-size: 0.88rem;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-summary-label {
  color: var(--cor-secundaria);
  font-size: 0.74rem;
}

.dropdown-header-mobile {
  display: none;
  padding: 1rem 0.75rem;
  margin-bottom: 0.45rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.07);
}

.mobile-name {
  display: block;
  color: var(--cor-escura);
  font-size: 0.95rem;
  font-weight: 650;
}

.mobile-role,
.mobile-account {
  display: block;
  margin-top: 0.25rem;
  color: var(--cor-secundaria);
  font-size: 0.78rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;
  gap: 0.75rem;
  padding: 0.75rem 0.85rem;
  border: 0;
  border-radius: 11px;
  background: transparent;
  color: var(--cor-escura);
  cursor: pointer;
  font-size: 0.87rem;
  font-weight: 550;
  text-align: left;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.dropdown-item > i:first-child {
  width: 18px;
  color: var(--cor-secundaria);
  font-size: 1rem;
  transition: color 0.2s ease;
}

.dropdown-item:hover:not(:disabled) {
  transform: translateX(2px);
  background: rgba(28, 164, 167, 0.07);
  color: var(--cor-primaria);
}

.dropdown-item:hover:not(:disabled) > i:first-child {
  color: var(--cor-primaria);
}

.dropdown-item:disabled {
  cursor: wait;
  opacity: 0.6;
}

.item-arrow {
  margin-left: auto;
  color: #94a3b8;
  font-size: 0.85rem;
}

.clinic-switcher {
  padding: 0.8rem 0.25rem 0.35rem;
  margin-top: 0.35rem;
  border-top: 1px solid rgba(15, 23, 42, 0.07);
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.3rem 0.55rem 0.65rem;
  color: var(--cor-secundaria);
  font-size: 0.73rem;
  font-weight: 700;
  letter-spacing: 0.045em;
  text-transform: uppercase;
}

.section-heading i {
  color: var(--cor-primaria);
  font-size: 0.9rem;
}

.clinic-option {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 0.65rem;
  padding: 0.65rem 0.55rem;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.clinic-option:hover:not(:disabled) {
  transform: translateY(-1px);
  background: rgba(28, 164, 167, 0.05);
}

.clinic-option-active {
  border-color: rgba(28, 164, 167, 0.17);
  background: rgba(28, 164, 167, 0.07);
}

.clinic-option:disabled {
  cursor: default;
}

.clinic-option-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 10px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 0.9rem;
}

.clinic-option-active .clinic-option-icon {
  background: rgba(28, 164, 167, 0.13);
  color: var(--cor-primaria);
}

.clinic-option-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  gap: 0.2rem;
}

.clinic-option-name {
  overflow: hidden;
  color: var(--cor-escura);
  font-size: 0.82rem;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clinic-option-role {
  color: var(--cor-secundaria);
  font-size: 0.72rem;
}

.clinic-check {
  color: var(--cor-primaria);
  font-size: 0.9rem;
}

.clinic-arrow {
  color: #94a3b8;
  font-size: 0.8rem;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.clinic-option:hover:not(:disabled) .clinic-arrow {
  transform: translateX(2px);
  color: var(--cor-primaria);
}

.dropdown-divider {
  height: 1px;
  margin: 0.45rem 0;
  background: rgba(15, 23, 42, 0.07);
}

.logout-item {
  color: #dc4545;
}

.logout-item > i:first-child {
  color: #dc4545;
}

.logout-item:hover:not(:disabled) {
  background: #fff1f1;
  color: #c92e2e;
}

.logout-item:hover:not(:disabled) > i:first-child {
  color: #c92e2e;
}

.menu-error {
  padding: 0.55rem 0.7rem;
  margin: 0.4rem 0.15rem 0.2rem;
  border-radius: 9px;
  background: #fff1f1;
  color: #c92e2e;
  font-size: 0.78rem;
  line-height: 1.45;
}

.dropdown-enter-active {
  transition:
    opacity 0.22s ease,
    transform 0.26s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.dropdown-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  transform: translateY(-7px) scale(0.98);
  opacity: 0;
}

@media (max-width: 1024px) {
  .datetime-wrapper {
    gap: 0.8rem;
    padding-right: 1.1rem;
  }

  .header-right {
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .system-header {
    min-height: 64px;
    padding: 0 1.25rem;
  }

  .header-left h1 {
    font-size: 1.25rem;
  }

  .datetime-wrapper,
  .user-info,
  .toggle-icon {
    display: none;
  }

  .user-button {
    padding: 0.35rem;
    border-radius: 50%;
  }

  .avatar {
    width: 38px;
    height: 38px;
    box-shadow: none;
  }

  .dropdown-menu {
    top: calc(100% + 9px);
    width: min(310px, calc(100vw - 2rem));
  }

  .dropdown-header-mobile {
    display: block;
  }

  .account-summary {
    display: none;
  }
}

@media (max-width: 480px) {
  .system-header {
    min-height: 60px;
    padding: 0 1rem;
  }

  .header-left h1 {
    font-size: 1.1rem;
  }

  .dropdown-menu {
    right: -0.35rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .system-header *,
  .system-header *::before,
  .system-header *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
