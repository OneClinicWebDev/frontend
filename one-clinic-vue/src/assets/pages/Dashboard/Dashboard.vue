<template>
  <div class="dashboard-container">
    <DashboardStats />

    <div class="content-grid">
      <DashboardAgenda />
      <DashboardRecentClients />
    </div>

    <DashboardActions
      @novo-cliente="abrirModalCliente"
      @novo-agendamento="abrirModalAgendamento"
    />

    <ClientModal
      :isOpen="isModalOpen"
      mode="criar"
      :clienteEdicao="null"
      @close="fecharModal"
      @save="salvarCliente"
    />

    <AgendaFormModal
      :isOpen="isModalAgendamentoOpen"
      :editing="false"
      :form="formAgendamento"
      :clientesBD="clientesBD"
      :servicosBD="servicosBD"
      :profissionaisBD="profissionaisBD"
      :isValid="true"
      @close="fecharModalAgendamento"
      @save="salvarAgendamento"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

import DashboardStats from './components/DashboardStats.vue'
import DashboardAgenda from './components/DashboardAgenda.vue'
import DashboardRecentClients from './components/DashboardRecentClients.vue'
import DashboardActions from './components/DashboardActions.vue'
import ClientModal from '../Clientes/components/ClientModal.vue'
import AgendaFormModal from '../Agenda/components/AgendaFormModal.vue'

const isModalOpen = ref(false)
const isModalAgendamentoOpen = ref(false)

const clientesBD = ref([])
const servicosBD = ref([])
const profissionaisBD = ref([])

const formAgendamento = reactive({
  cliente: '',
  servico: '',
  profissional: '',
  dataInicio: '',
  horaInicio: '',
  dataFim: '',
  horaFim: '',
  status: 'pendente'
})

const abrirModalCliente = () => {
  isModalOpen.value = true
}

const fecharModal = () => {
  isModalOpen.value = false
}

const salvarCliente = (cliente) => {
  isModalOpen.value = false
}

const abrirModalAgendamento = () => {
  isModalAgendamentoOpen.value = true
}

const fecharModalAgendamento = () => {
  isModalAgendamentoOpen.value = false
}

const salvarAgendamento = () => {
  isModalAgendamentoOpen.value = false
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  min-width: 0;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(340px, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    gap: 1rem;
  }

  .content-grid {
    gap: 1rem;
  }
}
</style>