<template>
  <div class="client-card" @dblclick="emitirDblClick">
    <div class="card-header">
      <div class="client-info-main">
        <div class="client-avatar">{{ cliente.iniciais }}</div>
        <div class="client-name-status">
          <h3 class="client-name">{{ cliente.nome }}</h3>
          <span :class="['status-badge', getBadgeClass(cliente.status_cadastro)]">
            {{ cliente.status_cadastro }}
          </span>
        </div>
      </div>
      
      <div class="menu-container">
        <button class="btn-dots" @click.stop="toggleMenu">
          <i class="pi pi-ellipsis-v"></i>
        </button>
        
        <div class="dropdown-menu" v-if="isMenuAberto">
          <button class="dropdown-item" @click.stop="emitirAcao('detalhes')">
            <i class="pi pi-eye"></i> Ver Perfil
          </button>
          <button class="dropdown-item" @click.stop="emitirAcao('editar')">
            <i class="pi pi-pencil"></i> Editar
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" @click.stop="emitirAcao('toggle-status')">
            <i :class="['pi', cliente.status_cadastro === 'ATIVO' ? 'pi-ban' : 'pi-check-circle']"></i> 
            {{ cliente.status_cadastro === 'ATIVO' ? 'Desativar' : 'Ativar' }}
          </button>
        </div>
      </div>
    </div>

    <div class="client-contact">
      <div class="contact-row">
        <i class="pi pi-phone"></i>
        <span class="font-semibold">{{ cliente.telefone }}</span>
      </div>
      <div class="contact-row">
        <i class="pi pi-envelope"></i>
        <span>{{ cliente.email }}</span>
      </div>
      <div class="contact-row">
        <i class="pi pi-map-marker"></i>
        <span>CEP: {{ cliente.cep || 'N/A' }} - Nº {{ cliente.numero || 'S/N' }}</span>
      </div>
    </div>

    <hr class="card-divider" />

    <div class="card-footer">
      <div class="footer-info">
        <span class="info-label">Cadastrado em</span>
        <span class="info-value">{{ cliente.criadoEm ? cliente.criadoEm.split(' ')[0] : 'N/A' }}</span>
      </div>
      <div class="footer-info text-right">
        <span class="info-label">CPF</span>
        <span class="info-value text-sm">{{ cliente.cpf }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  cliente: Object
})

const emit = defineEmits(['editar', 'toggle-status', 'detalhes'])
const isMenuAberto = ref(false)

const toggleMenu = () => {
  isMenuAberto.value = !isMenuAberto.value
}

const fecharMenu = () => {
  isMenuAberto.value = false
}

const emitirAcao = (acao) => {
  emit(acao, props.cliente)
  fecharMenu()
}

const emitirDblClick = () => {
  emit('detalhes', props.cliente)
}

const getBadgeClass = (status) => {
  if (status === 'ATIVO') return 'badge-ativo'
  return 'badge-inativo'
}

onMounted(() => {
  window.addEventListener('click', fecharMenu)
})

onUnmounted(() => {
  window.removeEventListener('click', fecharMenu)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.client-card {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', sans-serif;
}

.client-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.12);
  border-color: #d1d5db;
}

.client-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: transparent;
  transition: all 0.3s ease;
}

.client-card:hover::before {
  background-color: #1CA4A7;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.client-info-main {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.client-avatar {
  width: 40px;
  height: 40px;
  background-color: #E0F2F1;
  color: #00796B;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.client-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
}

.status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
}

.badge-ativo {
  background-color: #DEF7EC;
  color: #03543F;
}

.badge-inativo {
  background-color: #F3F4F6;
  color: #4B5563;
}

.menu-container {
  position: relative;
}

.btn-dots {
  background: none;
  border: none;
  color: #6B7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-dots:hover {
  color: #1F2937;
  background-color: #F9FAFB;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  min-width: 160px;
  z-index: 10;
  transform-origin: top right;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 500;
  color: #1F2937;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.dropdown-item:hover {
  background-color: #F9FAFB;
  color: #1CA4A7;
}

.dropdown-divider {
  height: 1px;
  background-color: #E5E7EB;
  margin: 0.25rem 0;
}

.client-contact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background-color: #F9FAFB;
  padding: 0.75rem;
  border-radius: 8px;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4B5563;
  font-size: 0.85rem;
}

.font-semibold {
  font-weight: 600;
  color: #1F2937;
}

.contact-row i {
  color: #9CA3AF;
  font-size: 0.9rem;
  width: 14px;
  text-align: center;
}

.card-divider {
  border: 0;
  border-top: 1px solid #E5E7EB;
  margin: 0 0 1rem 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.text-right {
  align-items: flex-end;
}

.info-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: #6B7280;
  text-transform: uppercase;
}

.info-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1F2937;
}

.text-sm {
  font-size: 0.85rem;
}
</style>