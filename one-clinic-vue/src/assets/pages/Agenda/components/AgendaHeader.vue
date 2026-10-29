<template>
  <section class="action-panel">
    <div class="top-row">
      <div class="search-input-wrapper">
        <i class="pi pi-search search-icon"></i>

        <input
          v-model="filters.search"
          type="text"
          class="search-input"
          placeholder="Buscar cliente, CPF, procedimento ou profissional..."
          aria-label="Buscar agendamentos"
        />

        <button
          v-if="filters.search"
          type="button"
          class="clear-search"
          aria-label="Limpar pesquisa"
          @click="filters.search = ''"
        >
          <i class="pi pi-times"></i>
        </button>
      </div>

      <div class="action-buttons">
        <div class="control-group">
          <span class="control-caption">Visualização</span>

          <div class="view-toggle" role="group" aria-label="Modo de visualização">
            <button
              type="button"
              class="btn-view"
              :class="{ active: displayMode === 'calendar' }"
              :aria-pressed="displayMode === 'calendar'"
              title="Visualização em calendário"
              @click="$emit('update:displayMode', 'calendar')"
            >
              <i class="pi pi-calendar"></i>
              <span>Calendário</span>
            </button>

            <button
              type="button"
              class="btn-view"
              :class="{ active: displayMode === 'list' }"
              :aria-pressed="displayMode === 'list'"
              title="Visualização em lista"
              @click="$emit('update:displayMode', 'list')"
            >
              <i class="pi pi-list"></i>
              <span>Lista</span>
            </button>
          </div>
        </div>

        <div v-if="displayMode === 'calendar'" class="control-group">
          <span class="control-caption">Período da agenda</span>

          <div class="view-toggle period-toggle" role="group" aria-label="Período do calendário">
            <button
              v-for="view in calendarViews"
              :key="view.value"
              type="button"
              class="btn-view period-button"
              :class="{ active: currentView === view.value }"
              :aria-pressed="currentView === view.value"
              @click="$emit('changeView', view.value)"
            >
              {{ view.label }}
            </button>
          </div>
        </div>

        <button type="button" class="btn-novo" @click="$emit('openCreateModal')">
          <i class="pi pi-plus"></i>
          <span>Novo Agendamento</span>
        </button>
      </div>
    </div>

    <div class="filters-heading">
      <div class="filters-heading-title">
        <i class="pi pi-sliders-h"></i>
        <span>Filtros da agenda</span>
      </div>

      <span class="filters-description">
        Refine os agendamentos exibidos
      </span>
    </div>

    <div class="filters-row">
      <div class="filter-group">
        <label for="filtro-profissional" class="filter-label">
          <i class="pi pi-user"></i>
          Profissional
        </label>

        <select
          id="filtro-profissional"
          v-model="filters.profissional"
          class="filter-select"
        >
          <option value="">Todos os profissionais</option>

          <option
            v-for="profissional in profissionaisBD"
            :key="profissional.id"
            :value="profissional.id"
          >
            {{ profissional.nome }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label for="filtro-status" class="filter-label">
          <i class="pi pi-check-circle"></i>
          Status
        </label>

        <select
          id="filtro-status"
          v-model="filters.status"
          class="filter-select"
        >
          <option value="">Todos os status</option>
          <option value="confirmado">Confirmado</option>
          <option value="pendente">Pendente</option>
          <option value="em_andamento">Em andamento</option>
          <option value="aguardando">Aguardando conclusão</option>
          <option value="concluido">Concluído</option>
          <option value="falta">Falta</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      <div class="filter-group filter-period">
        <label for="filtro-data-inicio" class="filter-label">
          <i class="pi pi-calendar"></i>
          Período
        </label>

        <div class="date-range-inputs">
          <input
            id="filtro-data-inicio"
            v-model="filters.dataInicio"
            type="date"
            class="filter-select date-input"
            aria-label="Data inicial"
          />

          <span class="date-separator">até</span>

          <input
            v-model="filters.dataFim"
            type="date"
            class="filter-select date-input"
            aria-label="Data final"
          />
        </div>
      </div>

      <button
        v-if="hasActiveFilters"
        type="button"
        class="btn-limpar"
        @click="$emit('clearFilters')"
      >
        <i class="pi pi-filter-slash"></i>
        Limpar filtros
      </button>
    </div>
  </section>
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

defineEmits([
  "update:displayMode",
  "changeView",
  "openCreateModal",
  "clearFilters",
]);

const calendarViews = [
  { label: "Dia", value: "timeGridDay" },
  { label: "Semana", value: "timeGridWeek" },
  { label: "Mês", value: "dayGridMonth" },
];
</script>

<style scoped>
.action-panel {
  box-sizing: border-box;
  width: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  background: var(--branco, #fff);
  border: 1px solid var(--cor-clara, #e5e7eb);
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(15, 23, 42, 0.035);
  animation: panel-enter 0.35s ease both;
}

.top-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  min-width: 0;
}

.search-input-wrapper {
  position: relative;
  flex: 1 1 300px;
  min-width: 0;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  color: #8994a5;
  font-size: 16px;
  pointer-events: none;
}

.search-input {
  box-sizing: border-box;
  width: 100%;
  height: 46px;
  padding: 0 44px 0 44px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  outline: none;
  color: #1f2937;
  background: #f8fafc;
  font: inherit;
  font-size: 13px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-input::placeholder {
  color: #98a2b3;
}

.search-input:focus {
  background: #fff;
  border-color: var(--cor-primaria, #1ca4a7);
  box-shadow: 0 0 0 3px rgba(28, 164, 167, 0.11);
}

.clear-search {
  position: absolute;
  right: 9px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  color: #64748b;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.clear-search:hover {
  color: #1f2937;
  background: #eaf0f5;
}

.action-buttons {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 16px;
  min-width: 0;
}

.control-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  min-width: 0;
}

.control-caption {
  padding-left: 3px;
  color: #8490a2;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.view-toggle {
  box-sizing: border-box;
  display: inline-flex;
  align-items: stretch;
  gap: 3px;
  min-width: 0;
  padding: 4px;
  border: 1px solid #e5eaf0;
  border-radius: 11px;
  background: #f3f6f9;
  overflow: hidden;
}

.btn-view {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 7px;
  background: transparent;
  color: #718096;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.btn-view i {
  font-size: 14px;
  line-height: 1;
}

.btn-view:hover:not(.active) {
  color: #344054;
  background: rgba(255, 255, 255, 0.65);
}

.btn-view.active {
  color: var(--cor-primaria, #168f92);
  background: #fff;
  border-color: #e5eaf0;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.period-toggle .period-button {
  min-width: 48px;
  padding-inline: 11px;
}

.btn-view:focus-visible,
.btn-novo:focus-visible,
.btn-limpar:focus-visible {
  outline: 3px solid rgba(28, 164, 167, 0.25);
  outline-offset: 2px;
}

.btn-novo {
  box-sizing: border-box;
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 17px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: var(--cor-primaria, #1ca4a7);
  color: #fff;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 3px 7px rgba(28, 164, 167, 0.12);
  transition:
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.btn-novo i {
  font-size: 13px;
}

.btn-novo:hover {
  background: #158a8d;
  box-shadow: 0 5px 12px rgba(28, 164, 167, 0.2);
  transform: translateY(-1px);
}

.filters-heading {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 19px;
  border-top: 1px solid #edf0f4;
}

.filters-heading-title {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #344054;
  font-size: 13px;
  font-weight: 700;
}

.filters-heading-title i {
  color: var(--cor-primaria, #1ca4a7);
  font-size: 15px;
}

.filters-description {
  color: #98a2b3;
  font-size: 11px;
}

.filters-row {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(165px, 0.8fr) minmax(290px, 1.35fr) auto;
  align-items: end;
  gap: 18px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  min-width: 0;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #667085;
  font-size: 11px;
  font-weight: 700;
}

.filter-label i {
  color: #96a0af;
  font-size: 13px;
}

.filter-select {
  box-sizing: border-box;
  width: 100%;
  height: 40px;
  min-width: 0;
  padding: 0 11px;
  border: 1px solid #e2e8f0;
  border-radius: 9px;
  outline: none;
  color: #344054;
  background-color: #f8fafc;
  font-family: inherit;
  font-size: 12px;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.filter-select:focus {
  border-color: var(--cor-primaria, #1ca4a7);
  background: #fff;
  box-shadow: 0 0 0 3px rgba(28, 164, 167, 0.09);
}

.date-range-inputs {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.date-input {
  flex: 1 1 0;
  width: 0;
  padding-inline: 8px;
}

.date-separator {
  flex: 0 0 auto;
  color: #98a2b3;
  font-size: 11px;
}

.btn-limpar {
  box-sizing: border-box;
  min-height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 12px;
  border: 1px solid #fee2e2;
  border-radius: 9px;
  background: #fff;
  color: #dc4545;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.btn-limpar:hover {
  background: #fff5f5;
  border-color: #fecaca;
}

@keyframes panel-enter {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1200px) {
  .top-row {
    align-items: stretch;
    flex-direction: column;
  }

  .search-input-wrapper {
    max-width: none;
    flex-basis: auto;
  }

  .action-buttons {
    justify-content: flex-start;
  }

  .filters-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filter-period {
    grid-column: 1 / -1;
  }

  .btn-limpar {
    justify-self: start;
  }
}

@media (max-width: 640px) {
  .action-panel {
    padding: 16px;
    gap: 18px;
    border-radius: 13px;
  }

  .action-buttons {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 12px;
  }

  .control-group {
    width: 100%;
  }

  .view-toggle {
    width: 100%;
  }

  .btn-view {
    flex: 1 1 0;
    padding-inline: 7px;
  }

  .btn-view span {
    font-size: 11px;
  }

  .period-toggle .period-button {
    min-width: 0;
  }

  .btn-novo {
    grid-column: 1 / -1;
    width: 100%;
    margin-top: 2px;
  }

  .filters-row {
    grid-template-columns: minmax(0, 1fr);
    gap: 15px;
  }

  .filter-period {
    grid-column: auto;
  }

  .filters-heading {
    gap: 6px;
  }

  .filters-description {
    width: 100%;
  }

  .date-range-inputs {
    gap: 7px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>