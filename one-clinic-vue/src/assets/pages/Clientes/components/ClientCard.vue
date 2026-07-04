<template>
  <div class="client-card" @dblclick="emitirDblClick">
    <div class="card-header">
      <div class="client-info-main">
        <div class="client-avatar">{{ cliente.iniciais }}</div>
        <div class="client-name-status">
          <h3 class="client-name">{{ cliente.nome }}</h3>
          <div class="badges-container">
            <span :class="['status-badge', cliente.status === 'ativo' ? 'badge-ativo' : 'badge-inativo']">
              {{ cliente.status === 'ativo' ? 'Ativo' : 'Inativo' }}
            </span>
            <span :class="['status-badge', cliente.statusFinanceiro === 'Em dia' ? 'badge-em-dia' : 'badge-em-atraso']">
              {{ cliente.statusFinanceiro }}
            </span>
          </div>
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
            {{ cliente.status === 'ativo' ? 'Desativar Cadastro' : 'Ativar Cadastro' }}
          </button>
        </div>
      </div>
    </div>

    <div class="client-contact">
      <div class="contact-row">
        <i class="pi pi-id-card"></i>
        <span>{{ cliente.cpf }}</span>
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
        <span class="info-label">Última visita</span>
        <span class="info-value">{{ cliente.ultimaVisita || 'Nenhuma' }}</span>
      </div>
      <div class="footer-info text-right">
        <span class="info-label">Total de visitas</span>
        <span class="info-value">{{ cliente.totalVisitas }}</span>
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

onMounted(() => {
  window.addEventListener('click', fecharMenu)
})

onUnmounted(() => {
  window.removeEventListener('click', fecharMenu)
})
</script>

<style scoped>
.client-card {
  background-color: var(--branco);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  cursor: pointer;
}

.client-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(28, 164, 167, 0.15);
  border-color: var(--cor-clara);
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
  width: 44px;
  height: 44px;
  background-color: var(--cor-clara);
  color: var(--cor-secundaria);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 1rem;
}

.client-name {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--cor-escura);
  margin: 0 0 0.35rem 0;
}

.badges-container {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.status-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.badge-ativo {
  background-color: var(--cor-primaria);
  color: var(--branco);
}

.badge-inativo {
  background-color: var(--cor-fundo);
  color: var(--cor-secundaria);
}

.badge-em-dia {
  background-color: #d1fae5;
  color: #065f46;
}

.badge-em-atraso {
  background-color: #fee2e2;
  color: #991b1b;
}

.menu-container {
  position: relative;
}

.btn-dots {
  background: none;
  border: none;
  color: var(--cor-secundaria);
  opacity: 0.6;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s, opacity 0.2s;
}

.btn-dots:hover {
  background-color: var(--cor-fundo);
  opacity: 1;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--branco);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  min-width: 170px;
  z-index: 10;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.6rem 1rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.9rem;
  color: var(--cor-escura);
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}

.dropdown-item:hover {
  background-color: var(--cor-fundo);
  color: var(--cor-primaria);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--cor-clara);
  margin: 0.25rem 0;
}

.client-contact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cor-secundaria);
  opacity: 0.8;
  font-size: 0.85rem;
}

.contact-row i {
  color: var(--cor-primaria);
}

.card-divider {
  border: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  margin: 0 0 1rem 0;
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
  color: var(--cor-secundaria);
  opacity: 0.6;
  margin-bottom: 0.15rem;
}

.info-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cor-escura);
}
</style>