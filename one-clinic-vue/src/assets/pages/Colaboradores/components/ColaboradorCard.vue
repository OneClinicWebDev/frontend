<template>
  <div class="collaborator-card" @dblclick="emitirDblClick">
    <div class="card-header">
      <div class="collaborator-info-main">
        <div class="collaborator-avatar">{{ colaborador.iniciais }}</div>
        <div class="collaborator-name-status">
          <h3 class="collaborator-name">{{ colaborador.nome }}</h3>
          <span :class="['status-badge', getBadgeClass(colaborador.status)]">
            {{ formatStatus(colaborador.status) }}
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
            <i :class="['pi', colaborador.status === 'ativo' ? 'pi-ban' : 'pi-check-circle']"></i> 
            {{ colaborador.status === 'ativo' ? 'Desativar' : 'Ativar' }}
          </button>
        </div>
      </div>
    </div>

    <div class="collaborator-contact">
      <div class="contact-row">
        <i class="pi pi-briefcase"></i>
        <span class="font-semibold">{{ colaborador.cargo }}</span>
      </div>
      <div class="contact-row">
        <i class="pi pi-sitemap"></i>
        <span>{{ colaborador.departamento }}</span>
      </div>
      <div class="contact-row">
        <i class="pi pi-envelope"></i>
        <span>{{ colaborador.email }}</span>
      </div>
      <div class="contact-row">
        <i class="pi pi-phone"></i>
        <span>{{ colaborador.telefone }}</span>
      </div>
    </div>

    <hr class="card-divider" />

    <div class="card-footer">
      <div class="footer-info">
        <span class="info-label">Data de Admissão</span>
        <span class="info-value">{{ colaborador.admissao }}</span>
      </div>
      <div class="footer-info text-right">
        <span class="info-label">CPF</span>
        <span class="info-value text-sm">{{ colaborador.cpf }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  colaborador: Object
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
  emit(acao, props.colaborador)
  fecharMenu()
}

const emitirDblClick = () => {
  emit('detalhes', props.colaborador)
}

const getBadgeClass = (status) => {
  if (status === 'ativo') return 'badge-ativo'
  if (status === 'ferias') return 'badge-ferias'
  return 'badge-inativo'
}

const formatStatus = (status) => {
  if (status === 'ferias') return 'Em Férias'
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
.collaborator-card {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
}

.collaborator-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.collaborator-info-main {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.collaborator-avatar {
  width: 56px;
  height: 56px;
  background-color: #1F2937;
  color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.collaborator-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  text-transform: lowercase;
}

.badge-ativo {
  background-color: #DEF7EC;
  color: #03543F;
}

.badge-ferias {
  background-color: #FEF3C7;
  color: #92400E;
}

.badge-inativo {
  background-color: #F3F4F6;
  color: #6B7280;
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
  font-size: 1.2rem;
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
  font-size: 0.9rem;
  font-weight: 500;
  color: #1F2937;
  cursor: pointer;
  transition: all 0.2s ease;
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

.collaborator-contact {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #6B7280;
  font-size: 0.9rem;
}

.font-semibold {
  font-weight: 600;
  color: #4B5563;
}

.contact-row i {
  color: #6B7280;
  opacity: 0.6;
  font-size: 1rem;
  width: 16px;
  text-align: center;
}

.card-divider {
  border: 0;
  border-top: 1px solid #F9FAFB;
  margin: 0 0 1.25rem 0;
}

.card-footer {
  display: flex;
  justify-content: space-between;
}

.footer-info {
  display: flex;
  flex-direction: column;
}

.text-right {
  align-items: flex-end;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6B7280;
  margin-bottom: 0.25rem;
}

.info-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1F2937;
}

.text-sm {
  font-size: 0.85rem;
}
</style>