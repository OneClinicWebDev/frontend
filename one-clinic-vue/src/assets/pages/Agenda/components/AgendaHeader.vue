<template>
  <div class="action-panel">
    <div class="top-row">
      <div class="search-input-wrapper">
        <i class="pi pi-search search-icon"></i>
        <input
          v-model="filters.search"
          type="text"
          class="search-input"
          placeholder="Buscar por cliente ou serviço..."
        />
      </div>

      <div class="action-buttons">
        <div class="view-toggle">
          <button
            class="btn-view"
            :class="{ active: displayMode === 'calendar' }"
            @click="$emit('update:displayMode', 'calendar')"
            title="Visualização em Calendário"
          >
            <i class="pi pi-calendar"></i>
          </button>
          <button
            class="btn-view"
            :class="{ active: displayMode === 'list' }"
            @click="$emit('update:displayMode', 'list')"
            title="Visualização em Lista"
          >
            <i class="pi pi-list"></i>
          </button>
        </div>

        <div class="view-toggle" v-show="displayMode === 'calendar'">
          <button
            class="btn-view"
            :class="{ active: currentView === 'timeGridDay' }"
            @click="$emit('changeView', 'timeGridDay')"
          >
            Dia
          </button>
          <button
            class="btn-view"
            :class="{ active: currentView === 'timeGridWeek' }"
            @click="$emit('changeView', 'timeGridWeek')"
          >
            Semana
          </button>
          <button
            class="btn-view"
            :class="{ active: currentView === 'dayGridMonth' }"
            @click="$emit('changeView', 'dayGridMonth')"
          >
            Mês
          </button>
        </div>

        <button class="btn-novo" @click="$emit('openCreateModal')">
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
          <input v-model="filters.dataInicio" type="date" class="filter-select" />
          <span class="date-separator">até</span>
          <input v-model="filters.dataFim" type="date" class="filter-select" />
        </div>
      </div>

      <button class="btn-limpar" @click="$emit('clearFilters')" v-if="hasActiveFilters">
        <i class="pi pi-filter-slash"></i> Limpar
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  filters: {
    type: Object,
    required: true,
  },
  displayMode: {
    type: String,
    required: true,
  },
  currentView: {
    type: String,
    required: true,
  },
  profissionaisBD: {
    type: Array,
    required: true,
  },
  hasActiveFilters: {
    type: Boolean,
    required: true,
  },
});

defineEmits(["update:displayMode", "changeView", "openCreateModal", "clearFilters"]);
</script>

<style scoped>
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  color: #ef4444;
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
  background-color: #fef2f2;
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
  .top-row {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input-wrapper {
    max-width: 100%;
  }
  .action-buttons {
    flex-wrap: wrap;
    justify-content: space-between;
  }
  .btn-novo {
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
  }
}
</style>