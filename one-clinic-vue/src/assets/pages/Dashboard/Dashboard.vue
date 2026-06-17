<template>
  <div class="dashboard-container">
    <DashboardStats />

    <div class="content-grid">
      <DashboardAgenda />
      <DashboardRecentClients />
    </div>

    <DashboardActions
      @novo-cliente="abrirModalCliente"
    />

    <ClientModal
      :isOpen="isModalOpen"
      mode="criar"
      :clienteEdicao="null"
      @close="fecharModal"
      @save="salvarCliente"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

import DashboardStats from './components/DashboardStats.vue'
import DashboardAgenda from './components/DashboardAgenda.vue'
import DashboardRecentClients from './components/DashboardRecentClients.vue'
import DashboardActions from './components/DashboardActions.vue'

import ClientModal from '../Clientes/components/ClientModal.vue'

const isModalOpen = ref(false)

const abrirModalCliente = () => {
  isModalOpen.value = true
}

const fecharModal = () => {
  isModalOpen.value = false
}

const salvarCliente = (cliente) => {
  console.log('Cliente criado:', cliente)

  isModalOpen.value = false
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