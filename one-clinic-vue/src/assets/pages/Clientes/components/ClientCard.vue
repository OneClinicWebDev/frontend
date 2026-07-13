<template>
  <div class="client-card" @dblclick="emitirDblClick">
    <div class="card-header">
      <div class="client-info-main">
        <div class="client-avatar">{{ cliente.iniciais }}</div>
        <div class="client-name-status">
          <h3 class="client-name">{{ cliente.nome }}</h3>
          <span :class="['status-badge', getBadgeClass(cliente.status)]">
            {{ formatStatus(cliente.status) }}
          </span>
        </div>
      </div>
      
      <div class="menu-container">
        <button class="btn-dots" @click.stop="toggleMenu">
          <i class="pi pi-ellipsis-v"></i>
        </button>
        
        <div class="dropdown-menu" v-if="isMenuAberto">
          <button class="dropdown-item" @click.stop="emitirAcao('detalhes')">
            <i class="pi pi-eye"></i> Ver detalhes
          </button>
          <button class="dropdown-item" @click.stop="emitirAcao('editar')">
            <i class="pi pi-pencil"></i> Editar
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item" @click.stop="emitirAcao('toggle-status')">
            <i :class="['pi', cliente.status === 'ativo' ? 'pi-ban' : 'pi-check-circle']"></i> 
            {{ cliente.status === 'ativo' ? 'Desativar' : 'Ativar' }}
          </button>
        </div>
      </div>
    </div>

    <div class="client-contact">
      <div class="contact-row">
        <i class="pi pi-wallet"></i>
        <span :class="['font-semibold', cliente.statusFinanceiro === 'Em atraso' ? 'text-red' : 'text-green']">
          {{ cliente.statusFinanceiro }}
        </span>
      </div>
      <div class="contact-row">
        <i class="pi pi-envelope"></i>
        <span>{{ cliente.email }}</span>
      </div>
      <div class="contact-row">
        <i class="pi pi-phone"></i>
        <span>{{ cliente.telefone }}</span>
      </div>
    </div>

    <hr class="card-divider" />

    <div class="card-footer">
      <div class="footer-info">
        <span class="info-label">Última Visita</span>
        <span class="info-value">{{ cliente.ultimaVisita || 'Nenhuma' }}</span>
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
  if (status === 'ativo') return 'badge-ativo'
  return 'badge-inativo'
}

const formatStatus = (status) => {
  return status
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
  border: 1px solid #E2E8F0;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  font-family: 'Inter', sans-serif;
}

.client-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.12);
  border-color: #CBD5E1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
}

.client-info-main {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.client-avatar {
  width: 50px;
  height: 50px;
  background-color: #F1F5F9;
  color: #1CA4A7;
  border: 1px solid #E2E8F0;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.client-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #334155;
  margin: 0 0 0.35rem 0;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  text-transform: capitalize;
  display: inline-block;
}

.badge-ativo {
  background-color: #ECFDF5;
  color: #059669;
}

.badge-inativo {
  background-color: #F1F5F9;
  color: #64748B;
}

.menu-container {
  position: relative;
}

.btn-dots {
  background: none;
  border: none;
  color: #94A3B8;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 8px;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.btn-dots:hover {
  color: #334155;
  background-color: #F1F5F9;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  min-width: 180px;
  z-index: 10;
  transform-origin: top right;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.dropdown-item:hover {
  background-color: #F8FAFC;
  color: #1CA4A7;
}

.dropdown-divider {
  height: 1px;
  background-color: #F1F5F9;
  margin: 0.25rem 0;
}

.client-contact {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #64748B;
  font-size: 0.9rem;
}

.font-semibold {
  font-weight: 600;
  color: #334155;
}

.text-green {
  color: #059669;
}

.text-red {
  color: #EF4444;
}

.contact-row i {
  color: #94A3B8;
  font-size: 1rem;
  width: 16px;
  text-align: center;
}

.card-divider {
  border: 0;
  border-top: 1px dashed #E2E8F0;
  margin: 0 0 1.25rem 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.text-right {
  align-items: flex-end;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94A3B8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #334155;
}

.text-sm {
  font-size: 0.85rem;
}
</style>