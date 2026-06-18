<template>
  <div class="page-container">
    <main class="page-content">
      
      <div class="action-panel">
        <div class="top-row">
          <div class="search-input-wrapper">
            <i class="pi pi-search search-icon"></i>
            <input
              v-model="filters.search"
              type="text"
              class="search-input"
              placeholder="Buscar por cliente ou serviço..."
            >
          </div>

          <div class="action-buttons">
            <div class="view-toggle">
              <button
                class="btn-view"
                :class="{ active: displayMode === 'calendar' }"
                @click="displayMode = 'calendar'"
                title="Visualização em Calendário"
              >
                <i class="pi pi-calendar"></i>
              </button>
              <button
                class="btn-view"
                :class="{ active: displayMode === 'list' }"
                @click="displayMode = 'list'"
                title="Visualização em Lista"
              >
                <i class="pi pi-list"></i>
              </button>
            </div>

            <div class="view-toggle" v-show="displayMode === 'calendar'">
              <button class="btn-view" :class="{ active: currentView === 'timeGridDay' }" @click="changeView('timeGridDay')">Dia</button>
              <button class="btn-view" :class="{ active: currentView === 'timeGridWeek' }" @click="changeView('timeGridWeek')">Semana</button>
              <button class="btn-view" :class="{ active: currentView === 'dayGridMonth' }" @click="changeView('dayGridMonth')">Mês</button>
            </div>

            <button class="btn-novo" @click="openCreateModal">
              <i class="pi pi-plus"></i> Novo Agendamento
            </button>
          </div>
        </div>

        <div class="filters-row">
          <div class="filter-group">
            <span class="filter-label"><i class="pi pi-user"></i> Profissional:</span>
            <select v-model="filters.profissional" class="filter-select">
              <option value="">Todos</option>
              <option v-for="p in profissionaisBD" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          
          <div class="divider"></div>

          <div class="filter-group">
            <span class="filter-label"><i class="pi pi-check-circle"></i> Status:</span>
            <select v-model="filters.status" class="filter-select">
              <option value="">Todos</option>
              <option value="confirmado">Confirmado</option>
              <option value="pendente">Pendente</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div class="divider"></div>

          <div class="filter-group">
            <span class="filter-label"><i class="pi pi-calendar-minus"></i> Período:</span>
            <div class="date-range-inputs">
              <input v-model="filters.dataInicio" type="date" class="filter-select">
              <span class="date-separator">até</span>
              <input v-model="filters.dataFim" type="date" class="filter-select">
            </div>
          </div>

          <button class="btn-limpar" @click="clearFilters" v-if="hasActiveFilters">
            <i class="pi pi-filter-slash"></i> Limpar
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <h2 class="stat-number">{{ totalAgendamentos }}</h2>
          <p class="stat-label">Total de Agendamentos</p>
        </div>
        <div class="stat-card">
          <h2 class="stat-number text-success">{{ confirmados }}</h2>
          <p class="stat-label">Confirmados</p>
        </div>
        <div class="stat-card">
          <h2 class="stat-number text-warning">{{ pendentes }}</h2>
          <p class="stat-label">Pendentes</p>
        </div>
        <div class="stat-card">
          <h2 class="stat-number text-danger">{{ cancelados }}</h2>
          <p class="stat-label">Cancelados</p>
        </div>
      </div>

      <div class="agenda-content" :class="{ 'layout-list': displayMode === 'list' }">
        
        <div class="calendar-wrapper action-panel" v-show="displayMode === 'calendar'">
          <FullCalendar ref="calendarRef" :options="calendarOptions" />
        </div>

        <aside class="side-panel action-panel" v-show="displayMode === 'calendar'">
          <div class="panel-header">
            <h3><i class="pi pi-clock"></i> Próximos Atendimentos</h3>
          </div>
          <div class="appointments-list">
            <div
              v-for="item in filteredAppointments"
              :key="item.id"
              class="appointment-card"
              @click="editAppointment(item)"
            >
              <div class="appointment-header">
                <span class="appointment-time">{{ formatarDataBR(item.dataInicio) }} • {{ item.horaInicio }}</span>
                <span :class="['status-badge', `badge-${item.status}`]">{{ formatStatus(item.status) }}</span>
              </div>
              <div class="appointment-client">{{ item.cliente }}</div>
              <div class="appointment-details">
                <span><i class="pi pi-tag"></i> {{ item.servico }}</span>
                <span><i class="pi pi-user"></i> {{ item.profissional }}</span>
              </div>
            </div>
            <div v-if="filteredAppointments.length === 0" class="empty-state">
              <i class="pi pi-calendar-times"></i>
              <p>Nenhum agendamento.</p>
            </div>
          </div>
        </aside>

        <TransitionGroup name="list" tag="div" class="cards-grid" v-show="displayMode === 'list'">
          <div
            v-for="item in filteredAppointments"
            :key="item.id"
            class="appointment-card large-card"
            @click="editAppointment(item)"
          >
            <div class="appointment-header">
              <span class="appointment-time">
                <i class="pi pi-calendar"></i> {{ formatarDataBR(item.dataInicio) }} | {{ item.horaInicio }} às {{ item.horaFim }}
              </span>
              <span :class="['status-badge', `badge-${item.status}`]">{{ formatStatus(item.status) }}</span>
            </div>
            
            <div class="appointment-client-large">
              <div class="client-avatar">{{ gerarIniciais(item.cliente) }}</div>
              <h4>{{ item.cliente }}</h4>
            </div>

            <hr class="card-divider" />

            <div class="appointment-details-grid">
              <div class="detail-item">
                <span class="detail-label">Serviço</span>
                <span class="detail-value">{{ item.servico }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Profissional</span>
                <span class="detail-value">{{ item.profissional }}</span>
              </div>
              <div class="detail-item" v-if="item.dataInicio !== item.dataFim">
                <span class="detail-label">Término</span>
                <span class="detail-value">{{ formatarDataBR(item.dataFim) }}</span>
              </div>
            </div>
          </div>
        </TransitionGroup>

        <div v-if="displayMode === 'list' && filteredAppointments.length === 0" class="empty-state list-empty">
          <i class="pi pi-search"></i>
          <p>Nenhum agendamento encontrado para os filtros atuais.</p>
        </div>
      </div>
    </main>

    <Transition name="fade">
      <div v-if="modalOpen" class="modal-overlay" @click.self="closeModal">
        <Transition name="scale">
          <div class="modal-container" v-if="modalOpen">
            <header class="modal-header">
              <h3>{{ editing ? 'Editar Agendamento' : 'Novo Agendamento' }}</h3>
              <button class="btn-close" @click="closeModal">
                <i class="pi pi-times"></i>
              </button>
            </header>

            <div class="modal-body">
              <div class="form-group">
                <label>Cliente</label>
                <select v-model="form.cliente" class="form-control">
                  <option value="" disabled>Selecione o cliente...</option>
                  <option v-for="c in clientesBD" :key="c.cpf" :value="c.nome">{{ c.nome }} ({{ c.cpf }})</option>
                </select>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label>Serviço</label>
                  <select v-model="form.servico" class="form-control">
                    <option value="" disabled>Selecione...</option>
                    <option v-for="s in servicosBD" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Profissional</label>
                  <select v-model="form.profissional" class="form-control">
                    <option value="" disabled>Selecione...</option>
                    <option v-for="p in profissionaisBD" :key="p" :value="p">{{ p }}</option>
                  </select>
                </div>
              </div>

              <div class="dates-box">
                <div class="form-row">
                  <div class="form-group">
                    <label>Data Inicial</label>
                    <input v-model="form.dataInicio" type="date" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Hora Inicial</label>
                    <input v-model="form.horaInicio" type="time" class="form-control">
                  </div>
                </div>
                <div class="form-row mt-3">
                  <div class="form-group">
                    <label>Data Final</label>
                    <input v-model="form.dataFim" type="date" class="form-control">
                  </div>
                  <div class="form-group">
                    <label>Hora Final</label>
                    <input v-model="form.horaFim" type="time" class="form-control">
                  </div>
                </div>
              </div>

              <div class="form-group mt-3">
                <label>Status do Agendamento</label>
                <select v-model="form.status" class="form-control">
                  <option value="confirmado">Confirmado</option>
                  <option value="pendente">Pendente</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>

            <footer class="modal-footer">
              <button v-if="editing" type="button" class="btn-excluir" @click="deleteAppointment">
                Excluir
              </button>
              <div class="footer-actions">
                <button type="button" class="btn-cancelar" @click="closeModal">Cancelar</button>
                <button 
                  type="button" 
                  class="btn-salvar" 
                  @click="saveAppointment"
                  :disabled="!isFormValid"
                >
                  Salvar
                </button>
              </div>
            </footer>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const calendarRef = ref(null)
const currentView = ref('timeGridWeek')
const displayMode = ref('calendar')
const modalOpen = ref(false)
const editing = ref(false)
const selectedId = ref(null)

const filters = ref({
  search: '',
  profissional: '',
  status: '',
  dataInicio: '',
  dataFim: ''
})

const hasActiveFilters = computed(() => {
  return filters.value.search !== '' || 
         filters.value.profissional !== '' || 
         filters.value.status !== '' || 
         filters.value.dataInicio !== '' || 
         filters.value.dataFim !== ''
})

const clearFilters = () => {
  filters.value = { search: '', profissional: '', status: '', dataInicio: '', dataFim: '' }
}

const clientesBD = ref([
  { nome: 'Ana Silva', cpf: '111.222.333-44' },
  { nome: 'Carla Santos', cpf: '222.333.444-55' },
  { nome: 'Marcos Paulo', cpf: '333.444.555-66' }
])

const servicosBD = ref(['Limpeza de Pele', 'Botox', 'Preenchimento Facial', 'Drenagem Linfática'])
const profissionaisBD = ref(['Dra. Maria', 'Dr. Paulo', 'Dra. Fernanda'])

const form = ref({
  cliente: '', servico: '', profissional: '', 
  dataInicio: '', horaInicio: '', dataFim: '', horaFim: '', status: 'confirmado'
})

const isFormValid = computed(() => {
  return form.value.cliente && form.value.servico && 
         form.value.profissional && form.value.dataInicio && 
         form.value.horaInicio && form.value.dataFim && form.value.horaFim
})

const appointments = ref([
  {
    id: 1, cliente: 'Ana Silva', servico: 'Limpeza de Pele', profissional: 'Dra. Maria',
    dataInicio: '2026-06-18', horaInicio: '09:00', dataFim: '2026-06-18', horaFim: '10:00', status: 'confirmado'
  },
  {
    id: 2, cliente: 'Carla Santos', servico: 'Botox', profissional: 'Dr. Paulo',
    dataInicio: '2026-06-18', horaInicio: '11:00', dataFim: '2026-06-18', horaFim: '12:00', status: 'pendente'
  },
  {
    id: 3, cliente: 'Marcos Paulo', servico: 'Preenchimento Facial', profissional: 'Dra. Fernanda',
    dataInicio: '2026-06-19', horaInicio: '14:00', dataFim: '2026-06-19', horaFim: '15:30', status: 'em_andamento'
  }
])

const formatarDataBR = (data) => {
  if (!data) return ''
  const partes = data.split('-')
  if (partes.length !== 3) return data
  return `${partes[2]}/${partes[1]}/${partes[0]}`
}

const formatStatus = (status) => {
  const map = {
    'confirmado': 'Confirmado',
    'pendente': 'Pendente',
    'em_andamento': 'Em Andamento',
    'cancelado': 'Cancelado'
  }
  return map[status] || status
}

const gerarIniciais = (nome) => {
  if(!nome) return ''
  return nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

const filteredAppointments = computed(() => {
  return appointments.value.filter(item => {
    const s = filters.value.search.toLowerCase()
    const matchSearch = item.cliente.toLowerCase().includes(s) || item.servico.toLowerCase().includes(s)
    const matchProf = !filters.value.profissional || item.profissional === filters.value.profissional
    const matchStatus = !filters.value.status || item.status === filters.value.status
    const matchDataIni = !filters.value.dataInicio || item.dataInicio >= filters.value.dataInicio
    const matchDataFim = !filters.value.dataFim || item.dataInicio <= filters.value.dataFim

    return matchSearch && matchProf && matchStatus && matchDataIni && matchDataFim
  }).sort((a, b) => {
    const dateA = new Date(`${a.dataInicio}T${a.horaInicio}`)
    const dateB = new Date(`${b.dataInicio}T${b.horaInicio}`)
    return dateA - dateB
  })
})

const totalAgendamentos = computed(() => filteredAppointments.value.length)
const confirmados = computed(() => filteredAppointments.value.filter(i => i.status === 'confirmado').length)
const pendentes = computed(() => filteredAppointments.value.filter(i => i.status === 'pendente').length)
const cancelados = computed(() => filteredAppointments.value.filter(i => i.status === 'cancelado').length)

// Cores suaves para o calendário
const eventColors = {
  'confirmado': { bg: '#ECFDF5', border: '#A7F3D0', text: '#10B981' }, // Verde suave
  'pendente': { bg: '#FFF7ED', border: '#FED7AA', text: '#F97316' },   // Laranja suave
  'em_andamento': { bg: '#EFF6FF', border: '#BFDBFE', text: '#3B82F6' }, // Azul suave
  'cancelado': { bg: '#FEF2F2', border: '#FECACA', text: '#EF4444' }     // Vermelho suave
}

const events = computed(() => {
  return filteredAppointments.value.map(item => {
    const theme = eventColors[item.status] || eventColors['confirmado']
    return {
      id: item.id,
      title: `${item.cliente} • ${item.servico}`,
      start: `${item.dataInicio}T${item.horaInicio}`,
      end: `${item.dataFim}T${item.horaFim}`,
      backgroundColor: theme.bg,
      borderColor: theme.border,
      textColor: theme.text,
      extendedProps: { ...item }
    }
  })
})

const openCreateModal = () => {
  editing.value = false
  form.value = {
    cliente: '', servico: '', profissional: '', status: 'confirmado',
    dataInicio: '', horaInicio: '', dataFim: '', horaFim: ''
  }
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
}

const editAppointment = appointment => {
  editing.value = true
  selectedId.value = appointment.id
  form.value = { ...appointment }
  modalOpen.value = true
}

const saveAppointment = () => {
  if (editing.value) {
    const index = appointments.value.findIndex(item => item.id === selectedId.value)
    appointments.value[index] = { ...form.value, id: selectedId.value }
  } else {
    appointments.value.push({ id: Date.now(), ...form.value })
  }
  closeModal()
}

const deleteAppointment = () => {
  appointments.value = appointments.value.filter(item => item.id !== selectedId.value)
  closeModal()
}

const changeView = view => {
  if(displayMode.value !== 'calendar') return
  currentView.value = view
  if (calendarRef.value) {
    calendarRef.value.getApi().changeView(view)
  }
}

const calendarOptions = {
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'timeGridWeek',
  editable: true,
  selectable: true,
  locale: 'pt-br',
  slotMinTime: '07:00:00',
  slotMaxTime: '21:00:00',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: ''
  },
  buttonText: { today: 'Hoje' },
  select(info) {
    editing.value = false
    const dateStr = info.startStr.slice(0, 10)
    const timeStr = info.startStr.includes('T') ? info.startStr.substring(11, 16) : ''
    let endStr = info.endStr.slice(0, 10)
    let endTimeStr = info.endStr.includes('T') ? info.endStr.substring(11, 16) : ''

    if(!endTimeStr && timeStr) {
       endStr = dateStr
       const [h, m] = timeStr.split(':')
       endTimeStr = `${String(Number(h)+1).padStart(2, '0')}:${m}`
    }

    form.value = {
      cliente: '', servico: '', profissional: '', status: 'confirmado',
      dataInicio: dateStr, horaInicio: timeStr, dataFim: endStr || dateStr, horaFim: endTimeStr
    }
    modalOpen.value = true
  },
  eventClick(info) {
    const item = appointments.value.find(e => e.id == info.event.id)
    if (item) editAppointment(item)
  },
  eventDrop(info) {
    const item = appointments.value.find(e => e.id == info.event.id)
    if (!item) return
    item.dataInicio = info.event.start.toISOString().split('T')[0]
    if(info.event.start.toTimeString) item.horaInicio = info.event.start.toTimeString().slice(0, 5)
    if(info.event.end) {
      item.dataFim = info.event.end.toISOString().split('T')[0]
      item.horaFim = info.event.end.toTimeString().slice(0, 5)
    }
  },
  eventResize(info) {
    const item = appointments.value.find(e => e.id == info.event.id)
    if (!item || !info.event.end) return
    item.dataFim = info.event.end.toISOString().split('T')[0]
    item.horaFim = info.event.end.toTimeString().slice(0, 5)
  }
}

Object.defineProperty(calendarOptions, 'events', {
  get() { return events.value }
})
</script>

<style scoped>
/* Base Layout Baseado no Clientes */
.page-container {
  min-height: 100vh;
  background-color: var(--cor-fundo);
  display: flex;
  flex-direction: column;
}

.page-content {
  padding: 2rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.action-panel {
  background-color: var(--branco);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid var(--cor-clara);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Top Actions & Search */
.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-input-wrapper {
  position: relative;
  flex-grow: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--cor-secundaria);
  opacity: 0.6;
  font-size: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid var(--cor-clara);
  border-radius: 10px;
  outline: none;
  font-size: 0.95rem;
  color: var(--cor-escura);
  background-color: var(--cor-fundo);
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: var(--cor-primaria);
  background-color: var(--branco);
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.1);
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.view-toggle {
  display: flex;
  background-color: var(--cor-fundo);
  border: 1px solid var(--cor-clara);
  border-radius: 10px;
  padding: 0.25rem;
  gap: 0.25rem;
}

.btn-view {
  background: transparent;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  color: var(--cor-secundaria);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-view:hover {
  color: var(--cor-escura);
}

.btn-view.active {
  background-color: var(--branco);
  color: var(--cor-primaria);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  font-weight: 600;
}

.btn-novo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--cor-primaria);
  color: var(--branco);
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-novo:hover {
  background-color: #158a8d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.25);
}

/* Filters */
.filters-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--cor-clara);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cor-secundaria);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--cor-clara);
  border-radius: 8px;
  outline: none;
  font-size: 0.85rem;
  color: var(--cor-escura);
  background-color: var(--cor-fundo);
  transition: all 0.2s;
}

.filter-select:focus {
  border-color: var(--cor-primaria);
  background-color: var(--branco);
}

.date-range-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date-separator {
  font-size: 0.8rem;
  color: var(--cor-secundaria);
}

.divider {
  width: 1px;
  height: 24px;
  background-color: var(--cor-clara);
}

.btn-limpar {
  background: none;
  border: none;
  color: #EF4444;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
}

.btn-limpar:hover {
  background-color: #FEF2F2;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.stat-card {
  background-color: var(--branco);
  border: 1px solid var(--cor-clara);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
  transition: transform 0.3s ease, border-color 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  border-color: var(--cor-primaria);
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--cor-escura);
  margin: 0 0 0.2rem 0;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--cor-secundaria);
  font-weight: 500;
  margin: 0;
}

.text-success { color: #10B981 !important; }
.text-warning { color: #F97316 !important; }
.text-danger { color: #EF4444 !important; }

/* Content Layout */
.agenda-content {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 1.5rem;
}

.agenda-content.layout-list {
  display: block;
}

/* Cards de Agendamento Genéricos */
.appointment-card {
  background-color: var(--branco);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  cursor: pointer;
}

.appointment-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(28, 164, 167, 0.1);
  border-color: var(--cor-clara);
}

.appointment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.appointment-time {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cor-escura);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.appointment-client {
  font-size: 1rem;
  font-weight: 600;
  color: var(--cor-escura);
  margin-bottom: 0.5rem;
}

.appointment-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: var(--cor-secundaria);
}

.appointment-details span {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

/* Status Badges - Cores Suaves/Pastéis */
.status-badge {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  border: 1px solid transparent;
}

.badge-confirmado { background-color: #ECFDF5; color: #10B981; border-color: #A7F3D0; }
.badge-pendente { background-color: #FFF7ED; color: #F97316; border-color: #FED7AA; }
.badge-em_andamento { background-color: #EFF6FF; color: #3B82F6; border-color: #BFDBFE; }
.badge-cancelado { background-color: #FEF2F2; color: #EF4444; border-color: #FECACA; }

/* Side Panel */
.panel-header {
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--cor-clara);
}

.panel-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--cor-escura);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.appointments-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.appointments-list::-webkit-scrollbar { width: 4px; }
.appointments-list::-webkit-scrollbar-thumb { background: rgba(0,0,0,.1); border-radius: 4px; }

/* Cards Grid (List Mode) */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.large-card {
  padding: 1.25rem;
}

.appointment-client-large {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.5rem 0 1rem 0;
}

.client-avatar {
  width: 40px;
  height: 40px;
  background-color: var(--cor-fundo);
  border: 1px solid var(--cor-clara);
  color: var(--cor-secundaria);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 0.9rem;
}

.appointment-client-large h4 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--cor-escura);
}

.card-divider {
  border: 0;
  border-top: 1px dashed var(--cor-clara);
  margin: 0 0 1rem 0;
}

.appointment-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--cor-secundaria);
  font-weight: 500;
}

.detail-value {
  font-size: 0.9rem;
  color: var(--cor-escura);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: var(--cor-secundaria);
  opacity: 0.6;
  gap: 0.5rem;
  text-align: center;
}

.empty-state i { font-size: 2rem; }
.list-empty { grid-column: 1 / -1; background: var(--branco); border-radius: 12px; border: 1px dashed var(--cor-clara); }

/* Modais */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(4, 31, 46, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-container {
  background-color: var(--branco);
  border-radius: 12px;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  margin: 1rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background-color: var(--branco);
  border-bottom: 1px solid var(--cor-clara);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cor-escura);
}

.btn-close {
  background: var(--cor-fundo);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--cor-secundaria);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background-color: #FEF2F2;
  color: #EF4444;
}

.modal-body {
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cor-secundaria);
}

.form-control {
  padding: 0.75rem;
  border: 1px solid var(--cor-clara);
  border-radius: 8px;
  outline: none;
  font-size: 0.95rem;
  color: var(--cor-escura);
  background-color: var(--branco);
  transition: all 0.2s;
}

.form-control:focus {
  border-color: var(--cor-primaria);
  box-shadow: 0 0 0 3px rgba(28, 164, 167, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.dates-box {
  background-color: var(--cor-fundo);
  padding: 1rem;
  border-radius: 10px;
  border: 1px dashed var(--cor-clara);
  margin-top: 0.5rem;
}

.mt-3 { margin-top: 1rem; }

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--cor-clara);
  background-color: var(--cor-fundo);
}

.footer-actions {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
}

.btn-cancelar {
  background: var(--branco);
  border: 1px solid var(--cor-clara);
  color: var(--cor-secundaria);
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-cancelar:hover { background-color: var(--cor-fundo); }

.btn-salvar {
  background-color: var(--cor-primaria);
  color: var(--branco);
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-salvar:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-salvar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-excluir {
  background: transparent;
  border: 1px solid #FECACA;
  color: #EF4444;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-excluir:hover { background-color: #FEF2F2; }

/* FullCalendar Resets (Cleaner look) */
:deep(.fc) { font-family: inherit; }
:deep(.fc-toolbar-title) { font-size: 1.15rem !important; font-weight: 600 !important; color: var(--cor-escura); }
:deep(.fc-button) { background: var(--cor-fundo) !important; border: 1px solid var(--cor-clara) !important; color: var(--cor-secundaria) !important; box-shadow: none !important; font-weight: 500 !important; border-radius: 8px !important; text-transform: capitalize; transition: all .2s ease; }
:deep(.fc-button:hover) { background: var(--branco) !important; color: var(--cor-escura) !important; border-color: var(--cor-secundaria) !important; }
:deep(.fc-button-active) { background: var(--cor-primaria) !important; color: var(--branco) !important; border-color: var(--cor-primaria) !important; }
:deep(.fc-scrollgrid) { border-color: var(--cor-clara) !important; border-radius: 10px; overflow: hidden; }
:deep(.fc-theme-standard td, .fc-theme-standard th) { border-color: var(--cor-clara) !important; }
:deep(.fc-col-header-cell) { background-color: var(--cor-fundo); padding: 0.5rem 0; font-weight: 600; font-size: 0.85rem; color: var(--cor-secundaria); }
:deep(.fc-timegrid-slot-label) { font-size: 0.8rem; color: var(--cor-secundaria); }
:deep(.fc-v-event) { border-radius: 6px !important; padding: 3px 5px !important; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: transform 0.2s ease; border-left-width: 3px !important; }
:deep(.fc-v-event:hover) { transform: scale(1.01); z-index: 5 !important; box-shadow: 0 4px 8px rgba(0,0,0,0.08); }
:deep(.fc-event-main) { font-weight: 500; font-size: 0.8rem; }
:deep(.fc-day-today) { background-color: rgba(28,164,167,.02) !important; }

/* Animações (Baseadas no Clientes) */
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: scale(0.95) translateY(10px); }
.list-leave-active { position: absolute; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.scale-enter-active, .scale-leave-active { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.scale-enter-from, .scale-leave-to { transform: scale(0.95); }

/* Responsividade */
@media (max-width: 1200px) {
  .agenda-content { grid-template-columns: 1fr; }
  .side-panel { order: -1; }
}

@media (max-width: 992px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .filters-row { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .divider { display: none; }
  .btn-limpar { margin-left: 0; }
}

@media (max-width: 768px) {
  .page-content { padding: 1rem; }
  .top-row { flex-direction: column; align-items: stretch; }
  .search-input-wrapper { max-width: 100%; }
  .action-buttons { flex-wrap: wrap; justify-content: space-between; }
  .btn-novo { width: 100%; justify-content: center; margin-top: 0.5rem; }
  .form-row { grid-template-columns: 1fr; gap: 0.5rem; }
  .modal-footer { flex-wrap: wrap; flex-direction: column-reverse; gap: 1rem; }
  .footer-actions { width: 100%; display: flex; }
  .footer-actions button { flex: 1; }
  .btn-excluir { width: 100%; }
  :deep(.fc-toolbar) { flex-direction: column; gap: 1rem; }
}
</style>