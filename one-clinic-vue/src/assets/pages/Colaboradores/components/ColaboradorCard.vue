<template>
  <div class="colab-card" @dblclick="emitirDblClick">
    <div class="card-header">
      <div class="colab-info-main">
        <div class="colab-avatar">{{ colaborador.iniciais }}</div>
        <div class="colab-name-role">
          <h3 class="colab-name">{{ colaborador.nome }}</h3>
          <span class="colab-role">{{ cargoExibicao }}</span>
          <span :class="['status-badge', colaborador.status === 'ativo' ? 'badge-ativo' : 'badge-inativo']">
            {{ colaborador.status }}
          </span>
        </div>
      </div>
      
      <div class="menu-container">
        <button class="btn-dots" @click.stop="toggleMenu">
          <i class="pi pi-ellipsis-h"></i>
        </button>
        
        <Transition name="dropdown">
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
        </Transition>
      </div>
    </div>

    <div class="colab-contact">
      <div class="contact-row">
        <i class="pi pi-envelope"></i>
        <span>{{ colaborador.email }}</span>
      </div>
      <div class="contact-row">
        <i class="pi pi-phone"></i>
        <span>{{ colaborador.telefone }}</span>
      </div>
      <div class="contact-row">
        <i class="pi pi-calendar"></i>
        <span>{{ colaborador.horario }}</span>
      </div>
    </div>

    <div class="card-footer">
      <div class="rating-info" v-if="colaborador.funcao === 'Profissional'">
        <i class="pi pi-star-fill text-warning"></i>
        <span class="rating-value">{{ colaborador.avaliacao.toFixed(1) }}</span>
      </div>
      <div class="rating-info" v-else></div>
      
      <div class="footer-stats">
        <span class="stats-value">{{ colaborador.atendimentos }}</span>
        <span class="stats-label">atendimentos</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  colaborador: Object
})

const emit = defineEmits(['editar', 'toggle-status', 'detalhes'])
const isMenuAberto = ref(false)

const cargoExibicao = computed(() => {
  return props.colaborador.funcao === 'Profissional' 
    ? props.colaborador.especialidade 
    : props.colaborador.funcao
})

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

onMounted(() => {
  window.addEventListener('click', fecharMenu)
})

onUnmounted(() => {
  window.removeEventListener('click', fecharMenu)
})
</script>

<style scoped>
.colab-card {
  background-color: var(--branco, #FFFFFF);
  border: 1px solid var(--cor-clara, #E5E7EB);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  user-select: none;
}

.colab-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px -3px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.colab-info-main {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}

.colab-avatar {
  width: 56px;
  height: 56px;
  background-color: var(--cor-escura, #1F2937);
  color: var(--branco, #FFFFFF);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.colab-name-role {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.colab-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--cor-escura, #1F2937);
  margin: 0 0 0.15rem 0;
}

.colab-role {
  font-size: 0.9rem;
  color: var(--cor-secundaria, #6B7280);
  margin-bottom: 0.4rem;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  text-transform: lowercase;
}

.badge-ativo {
  background-color: var(--cor-escura, #1F2937);
  color: var(--branco, #FFFFFF);
}

.badge-inativo {
  background-color: var(--cor-clara, #E5E7EB);
  color: var(--cor-secundaria, #6B7280);
}

.menu-container {
  position: relative;
}

.btn-dots {
  background: none;
  border: none;
  color: var(--cor-secundaria, #6B7280);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  font-size: 1.2rem;
  transition: color 0.2s ease;
}

.btn-dots:hover {
  color: var(--cor-escura, #1F2937);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--branco, #FFFFFF);
  border: 1px solid var(--cor-clara, #E5E7EB);
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
  padding: 0.5rem 0;
  min-width: 160px;
  z-index: 10;
  transform-origin: top right;
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
  color: var(--cor-escura, #1F2937);
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.dropdown-item:hover {
  background-color: var(--cor-fundo, #F9FAFB);
  color: var(--cor-primaria, #1CA4A7);
}

.dropdown-divider {
  height: 1px;
  background-color: var(--cor-clara, #E5E7EB);
  margin: 0.25rem 0;
}

.colab-contact {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--cor-secundaria, #6B7280);
  font-size: 0.9rem;
}

.contact-row i {
  color: var(--cor-secundaria, #6B7280);
  opacity: 0.5;
  font-size: 1rem;
  width: 16px;
  text-align: center;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: auto;
}

.rating-info {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.text-warning {
  color: #F59E0B;
  font-size: 1.1rem;
}

.rating-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--cor-escura, #1F2937);
}

.footer-stats {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.stats-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--cor-escura, #1F2937);
  line-height: 1;
}

.stats-label {
  font-size: 0.75rem;
  color: var(--cor-secundaria, #6B7280);
  margin-top: 0.2rem;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
</style>