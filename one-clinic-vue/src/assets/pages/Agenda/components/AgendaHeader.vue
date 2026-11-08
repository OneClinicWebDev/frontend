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
          <div class="view-toggle" role="group" aria-label="Período do calendário">
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
    <div class="filters-divider"></div>
    <div class="filters-heading">
      <div class="filters-heading-title">
        <i class="pi pi-sliders-h"></i>
        <span>Filtros da agenda</span>
      </div>
      <span class="filters-description">Refine os agendamentos exibidos</span>
    </div>
    <div class="filters-row">
      <div class="filter-group">
        <label for="filtro-profissional" class="filter-label">
          <i class="pi pi-user"></i>
          Profissional
        </label>
        <div class="select-wrapper">
          <i class="pi pi-id-card select-icon"></i>
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
      </div>
      <div class="filter-group">
        <label for="filtro-status" class="filter-label">
          <i class="pi pi-check-circle"></i>
          Status
        </label>
        <div class="select-wrapper">
          <i class="pi pi-flag select-icon"></i>
          <select id="filtro-status" v-model="filters.status" class="filter-select">
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
      </div>
      <div class="filter-group filter-period">
        <label for="filtro-data-inicio" class="filter-label">
          <i class="pi pi-calendar"></i>
          Período
        </label>
        <div class="date-range-inputs">
          <div class="select-wrapper">
            <i class="pi pi-calendar select-icon"></i>
            <input
              id="filtro-data-inicio"
              v-model="filters.dataInicio"
              type="date"
              class="filter-select date-input"
              aria-label="Data inicial"
            />
          </div>
          <span class="date-separator">até</span>
          <div class="select-wrapper">
            <i class="pi pi-calendar select-icon"></i>
            <input
              v-model="filters.dataFim"
              type="date"
              class="filter-select date-input"
              aria-label="Data final"
            />
          </div>
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

defineEmits(["update:displayMode", "changeView", "openCreateModal", "clearFilters"]);

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
  gap: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #fdfdfe 100%);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02);
}
.top-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  min-width: 0;
}
.search-input-wrapper {
  position: relative;
  flex: 1 1 340px;
  min-width: 0;
  max-width: 480px;
}
.search-icon {
  position: absolute;
  top: 50%;
  left: 16px;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 16px;
  pointer-events: none;
}
.search-input {
  box-sizing: border-box;
  width: 100%;
  height: 48px;
  padding: 0 44px 0 46px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  outline: none;
  color: #0f172a;
  background: #f8fafc;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.search-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}
.search-input:hover {
  border-color: #94a3b8;
  background: #ffffff;
}
.search-input:focus {
  background: #ffffff;
  border-color: var(--cor-primaria, #1ca4a7);
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.12);
}
.clear-search {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  color: #64748b;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}
.clear-search:hover {
  color: #0f172a;
  background: #f1f5f9;
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
  gap: 6px;
  min-width: 0;
}
.control-caption {
  padding-left: 2px;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.view-toggle {
  box-sizing: border-box;
  display: inline-flex;
  align-items: stretch;
  gap: 4px;
  min-width: 0;
  padding: 4px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #f1f5f9;
}
.btn-view {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 38px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 9px;
  background: transparent;
  color: #475569;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-view i {
  font-size: 14px;
}
.btn-view:hover:not(.active) {
  color: #0f172a;
  background: rgba(255, 255, 255, 0.7);
}
.btn-view.active {
  color: var(--cor-primaria, #168f92);
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
}
.period-button {
  min-width: 52px;
  padding: 0 12px;
}
.btn-view:focus-visible,
.btn-novo:focus-visible,
.btn-limpar:focus-visible {
  outline: 3px solid rgba(28, 164, 167, 0.3);
  outline-offset: 2px;
}
.btn-novo {
  box-sizing: border-box;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 22px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: var(--cor-primaria, #1ca4a7);
  color: #ffffff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.25);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-novo:hover {
  background: #158a8d;
  box-shadow: 0 6px 16px rgba(28, 164, 167, 0.35);
  transform: translateY(-2px);
}
.filters-divider {
  width: 100%;
  height: 1px;
  background: #e2e8f0;
}
.filters-heading {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
}
.filters-heading-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
}
.filters-heading-title i {
  color: var(--cor-primaria, #1ca4a7);
  font-size: 15px;
}
.filters-description {
  color: #64748b;
  font-size: 12px;
}
.filters-row {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) minmax(300px, 1.5fr) auto;
  align-items: end;
  gap: 16px;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}
.filter-label {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.filter-label i {
  color: #94a3b8;
  font-size: 13px;
}
.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1 1 0;
  min-width: 0;
}
.select-icon {
  position: absolute;
  left: 14px;
  z-index: 1;
  color: #94a3b8;
  font-size: 13px;
  pointer-events: none;
}
.filter-select {
  box-sizing: border-box;
  width: 100%;
  height: 44px;
  min-width: 0;
  padding: 0 14px 0 38px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  outline: none;
  color: #0f172a;
  background-color: #f8fafc;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.25s ease;
}
select.filter-select {
  appearance: none;
  padding-right: 38px;
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
}
.filter-select:hover {
  border-color: #94a3b8;
  background-color: #ffffff;
}
.filter-select:focus {
  border-color: var(--cor-primaria, #1ca4a7);
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.12);
}
.date-range-inputs {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.date-separator {
  flex: 0 0 auto;
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
}
.btn-limpar {
  box-sizing: border-box;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 0 16px;
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #ffffff;
  color: #dc2626;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-limpar:hover {
  background: #fef2f2;
  border-color: #fca5a5;
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
    padding: 18px;
  }
  .action-buttons {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }
  .control-group,
  .view-toggle {
    width: 100%;
  }
  .btn-view {
    flex: 1 1 0;
    padding: 0 8px;
  }
  .btn-novo {
    width: 100%;
  }
  .filters-row {
    grid-template-columns: minmax(0, 1fr);
  }
  .filter-period {
    grid-column: auto;
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
