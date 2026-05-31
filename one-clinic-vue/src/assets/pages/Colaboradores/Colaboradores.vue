<template>
  <div class="page-container">
    <main class="page-content">
      <div class="action-panel">
        <div class="top-row">
          <div class="search-input-wrapper">
            <i class="pi pi-search search-icon"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              :placeholder="placeholderBusca" 
              class="search-input"
            />
          </div>
          <button class="btn-novo" @click="abrirModalCriacao">
            <i class="pi pi-plus"></i> Novo Colaborador
          </button>
        </div>

        <div class="filters-row">
          <div class="filter-group">
            <span class="filter-label"><i class="pi pi-filter"></i> Buscar em:</span>
            <div class="chips-container">
              <button 
                v-for="campo in camposBusca" 
                :key="campo.value"
                :class="['chip', { active: camposAtivos.includes(campo.value) }]"
                @click="toggleCampo(campo.value)"
              >
                {{ campo.label }}
              </button>
            </div>
          </div>

          <div class="divider"></div>

          <div class="filter-group">
            <span class="filter-label"><i class="pi pi-check-circle"></i> Status:</span>
            <div class="chips-container">
              <button 
                v-for="status in statusBusca" 
                :key="status.value"
                :class="['chip chip-status', { active: filtroStatus === status.value }]"
                @click="filtroStatus = status.value"
              >
                {{ status.label }}
              </button>
            </div>
          </div>

          <button class="btn-limpar" @click="limparFiltros" v-if="temFiltroAtivo">
            <i class="pi pi-filter-slash"></i> Limpar
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">{{ totalColaboradores }}</span>
          <span class="stat-label">Total de Profissionais</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ colaboradoresAtivos }}</span>
          <span class="stat-label">Profissionais Ativos</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ totalAtendimentos }}</span>
          <span class="stat-label">Total de Atendimentos</span>
        </div>
      </div>

      <TransitionGroup name="list" tag="div" class="collaborators-grid">
        <ColaboradorCard 
          v-for="colaborador in colaboradoresFiltrados" 
          :key="colaborador.id" 
          :colaborador="colaborador"
          @detalhes="abrirModalDetalhes"
          @editar="abrirModalEdicao"
          @toggle-status="alternarStatus"
        />
      </TransitionGroup>
      
      <div v-if="colaboradoresFiltrados.length === 0" class="empty-state">
        <i class="pi pi-users"></i>
        <p>Nenhum colaborador encontrado.</p>
      </div>
    </main>

    <ColaboradorModal 
      :is-open="isModalOpen" 
      :mode="modalMode"
      :colaborador-edicao="colaboradorSelecionado"
      @close="fecharModal"
      @save="salvarColaborador"
    />

    <Transition name="toast">
      <div v-if="toast.show" class="toast-notification">
        <i class="pi pi-check-circle"></i>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ColaboradorCard from './components/ColaboradorCard.vue'
import ColaboradorModal from './components/ColaboradorModal.vue'

const searchQuery = ref('')
const camposAtivos = ref(['nome'])
const filtroStatus = ref('todos')
const isModalOpen = ref(false)
const modalMode = ref('criar')
const colaboradorSelecionado = ref(null)
const toast = ref({ show: false, message: '' })

const camposBusca = [
  { label: 'Nome', value: 'nome' },
  { label: 'CPF', value: 'cpf' },
  { label: 'Função/Espec.', value: 'cargoBusca' }
]

const statusBusca = [
  { label: 'Todos', value: 'todos' },
  { label: 'Ativos', value: 'ativo' },
  { label: 'Inativos', value: 'inativo' }
]

const colaboradores = ref([
  { id: 1, iniciais: 'DS', nome: 'Dra. Maria Santos', cpf: '111.222.333-44', funcao: 'Profissional', especialidade: 'Dermatologista', status: 'ativo', email: 'maria.santos@oneclinic.com', telefone: '(11) 98765-4321', horario: 'Segunda a Sexta, 8h-18h', avaliacao: 4.9, atendimentos: 156, criadoEm: '15/01/2026 08:00 GMT-3' },
  { id: 2, iniciais: 'DO', nome: 'Dr. Paulo Oliveira', cpf: '555.666.777-88', funcao: 'Profissional', especialidade: 'Cirurgião Plástico', status: 'ativo', email: 'paulo.oliveira@oneclinic.com', telefone: '(11) 97654-3210', horario: 'Segunda a Quinta, 9h-17h', avaliacao: 4.8, atendimentos: 98, criadoEm: '20/02/2026 09:30 GMT-3' },
  { id: 3, iniciais: 'DC', nome: 'Dra. Ana Costa', cpf: '999.888.777-66', funcao: 'Profissional', especialidade: 'Esteticista', status: 'ativo', email: 'ana.costa@oneclinic.com', telefone: '(11) 96543-2109', horario: 'Segunda a Sábado, 8h-16h', avaliacao: 4.7, atendimentos: 234, criadoEm: '10/03/2026 10:15 GMT-3' }
])

const totalColaboradores = computed(() => colaboradores.value.length)
const colaboradoresAtivos = computed(() => colaboradores.value.filter(c => c.status === 'ativo').length)
const totalAtendimentos = computed(() => colaboradores.value.reduce((acc, c) => acc + c.atendimentos, 0))

const placeholderBusca = computed(() => {
  const campos = camposBusca.filter(c => camposAtivos.value.includes(c.value)).map(c => c.label)
  return `Buscar profissional por ${campos.join(', ')}...`
})

const temFiltroAtivo = computed(() => {
  return searchQuery.value.length > 0 || 
         camposAtivos.value.length > 1 || 
         (camposAtivos.value.length === 1 && camposAtivos.value[0] !== 'nome') ||
         filtroStatus.value !== 'todos'
})

const toggleCampo = (campo) => {
  const index = camposAtivos.value.indexOf(campo)
  if (index === -1) {
    camposAtivos.value.push(campo)
  } else {
    if (camposAtivos.value.length > 1) {
      camposAtivos.value.splice(index, 1)
    }
  }
}

const limparFiltros = () => {
  camposAtivos.value = ['nome']
  filtroStatus.value = 'todos'
  searchQuery.value = ''
}

const colaboradoresFiltrados = computed(() => {
  let resultado = colaboradores.value

  if (filtroStatus.value !== 'todos') {
    resultado = resultado.filter(c => c.status === filtroStatus.value)
  }

  if (!searchQuery.value || camposAtivos.value.length === 0) {
    return resultado
  }

  const queryLimpa = searchQuery.value.toLowerCase().replace(/\D/g, '')
  const queryNormal = searchQuery.value.toLowerCase()

  return resultado.filter(c => {
    return camposAtivos.value.some(campo => {
      if (campo === 'cpf') {
        const valorLimpo = String(c[campo]).replace(/\D/g, '')
        return valorLimpo.includes(queryLimpa)
      }
      if (campo === 'cargoBusca') {
        const cargo = String(c.funcao === 'Profissional' ? c.especialidade : c.funcao).toLowerCase()
        return cargo.includes(queryNormal)
      }
      const valor = String(c[campo]).toLowerCase()
      return valor.includes(queryNormal)
    })
  })
})

const dispararToast = (mensagem) => {
  toast.value.message = mensagem
  toast.value.show = true
  setTimeout(() => {
    toast.value.show = false
  }, 3500)
}

const abrirModalCriacao = () => {
  modalMode.value = 'criar'
  colaboradorSelecionado.value = null
  isModalOpen.value = true
}

const abrirModalEdicao = (colaborador) => {
  modalMode.value = 'editar'
  colaboradorSelecionado.value = colaborador
  isModalOpen.value = true
}

const abrirModalDetalhes = (colaborador) => {
  modalMode.value = 'detalhes'
  colaboradorSelecionado.value = colaborador
  isModalOpen.value = true
}

const fecharModal = () => {
  isModalOpen.value = false
  colaboradorSelecionado.value = null
}

const gerarIniciais = (nome) => {
  const partes = nome.replace(/^(Dra?\.\s)/i, '').split(' ')
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase()
  }
  return partes[0].slice(0, 2).toUpperCase()
}

const obterTimestamp = () => {
  const agora = new Date()
  const data = agora.toLocaleDateString('pt-BR')
  const hora = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  return `${data} ${hora} GMT-3`
}

const salvarColaborador = (dados) => {
  if (dados.id) {
    const index = colaboradores.value.findIndex(c => c.id === dados.id)
    if (index !== -1) {
      colaboradores.value[index] = {
        ...colaboradores.value[index],
        ...dados,
        iniciais: gerarIniciais(dados.nome)
      }
      dispararToast(`Colaborador "${dados.nome}" atualizado com sucesso!`)
    }
  } else {
    const novo = {
      ...dados,
      id: Date.now(),
      iniciais: gerarIniciais(dados.nome),
      criadoEm: obterTimestamp(),
      avaliacao: 0,
      atendimentos: 0
    }
    colaboradores.value.unshift(novo)
    dispararToast(`Colaborador "${dados.nome}" cadastrado com sucesso!`)
  }
}

const alternarStatus = (colaborador) => {
  const index = colaboradores.value.findIndex(c => c.id === colaborador.id)
  if (index !== -1) {
    const novoStatus = colaboradores.value[index].status === 'ativo' ? 'inativo' : 'ativo'
    colaboradores.value[index].status = novoStatus
    dispararToast(`Colaborador "${colaborador.nome}" foi marcado como ${novoStatus}.`)
  }
}
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: var(--cor-fundo, #F9FAFB);
  display: flex;
  flex-direction: column;
}

.page-content {
  padding: 2rem;
  flex-grow: 1;
}

.action-panel {
  background-color: var(--branco, #FFFFFF);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--cor-clara, #E5E7EB);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.search-input-wrapper {
  position: relative;
  flex-grow: 1;
  max-width: 600px;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--cor-secundaria, #6B7280);
  opacity: 0.6;
  font-size: 1.1rem;
}

.search-input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 3rem;
  border: 1px solid var(--cor-clara, #E5E7EB);
  border-radius: 10px;
  outline: none;
  font-size: 1rem;
  color: var(--cor-escura, #1F2937);
  background-color: var(--branco, #FFFFFF);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input:focus {
  border-color: var(--cor-primaria, #1CA4A7);
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.15);
}

.btn-novo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--cor-escura, #1F2937);
  color: var(--branco, #FFFFFF);
  padding: 0.85rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.btn-novo:hover {
  background-color: var(--cor-primaria, #1CA4A7);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.2);
}

.filters-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cor-secundaria, #6B7280);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  background-color: var(--cor-fundo, #F9FAFB);
  border: 1px solid var(--cor-clara, #E5E7EB);
  color: var(--cor-secundaria, #6B7280);
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.chip:hover {
  border-color: var(--cor-primaria, #1CA4A7);
  color: var(--cor-primaria, #1CA4A7);
  background-color: var(--branco, #FFFFFF);
}

.chip.active {
  background-color: var(--cor-primaria, #1CA4A7);
  border-color: var(--cor-primaria, #1CA4A7);
  color: var(--branco, #FFFFFF);
}

.chip-status.active {
  background-color: var(--cor-escura, #1F2937);
  border-color: var(--cor-escura, #1F2937);
}

.divider {
  width: 1px;
  height: 24px;
  background-color: var(--cor-clara, #E5E7EB);
}

.btn-limpar {
  background: none;
  border: none;
  color: #DC2626;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
}

.btn-limpar:hover {
  background-color: #FEF2F2;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: var(--branco, #FFFFFF);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid var(--cor-clara, #E5E7EB);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
}

.stat-number {
  font-size: 2rem;
  font-weight: 800;
  color: var(--cor-escura, #1F2937);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--cor-secundaria, #6B7280);
  font-weight: 500;
}

.collaborators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  position: relative;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--cor-secundaria, #6B7280);
  opacity: 0.6;
  gap: 0.5rem;
}

.empty-state i {
  font-size: 2.5rem;
}

.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background-color: var(--cor-escura, #1F2937);
  color: var(--branco, #FFFFFF);
  padding: 1rem 1.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
  border-left: 4px solid var(--cor-primaria, #1CA4A7);
  z-index: 3000;
}

.toast-notification i {
  color: var(--cor-primaria, #1CA4A7);
  font-size: 1.2rem;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.list-leave-active {
  position: absolute;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

@media (max-width: 992px) {
  .filters-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .divider {
    display: none;
  }
  .btn-limpar {
    margin-left: 0;
  }
}

@media (max-width: 768px) {
  .page-content {
    padding: 1rem;
  }
  .top-row {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input-wrapper {
    max-width: 100%;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>