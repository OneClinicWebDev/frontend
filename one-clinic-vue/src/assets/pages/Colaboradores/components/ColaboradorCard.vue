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
        <i class="pi pi-id-card"></i>
        <span class="font-semibold">{{ colaborador.funcao }}</span>
      </div>
      <div class="contact-row" v-if="colaborador.funcao === 'Profissional' && colaborador.especialidade">
        <i class="pi pi-star"></i>
        <span class="text-highlight">{{ colaborador.especialidade }}</span>
      </div>
      <div class="contact-row" v-if="colaborador.status === 'ferias'">
        <i class="pi pi-calendar-clock"></i>
        <span class="text-ferias">{{ colaborador.inicioFerias }} até {{ colaborador.fimFerias }}</span>
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
        <span class="info-label">Admissão</span>
        <span class="info-value">{{ colaborador.admissao }}</span>
      </div>
      <div class="footer-info" v-if="colaborador.status === 'inativo' && colaborador.demissao">
        <span class="info-label text-red">Demissão</span>
        <span class="info-value">{{ colaborador.demissao }}</span>
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.collaborator-card {
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

.collaborator-card:hover {
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

.collaborator-info-main {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.collaborator-avatar {
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

.collaborator-name {
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

.badge-ferias {
  background-color: #FFFBEB;
  color: #D97706;
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

.collaborator-contact {
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

.text-highlight {
  font-weight: 500;
  color: #1CA4A7;
}

.text-ferias {
  font-weight: 500;
  color: #D97706;
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

.text-red {
  color: #EF4444;
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