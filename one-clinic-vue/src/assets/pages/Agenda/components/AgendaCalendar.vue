<template>
  <div class="calendar-wrapper action-panel">
    <FullCalendar ref="calendarRef" :options="options" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import FullCalendar from "@fullcalendar/vue3";

defineProps({
  options: {
    type: Object,
    required: true,
  },
});

const calendarRef = ref(null);

const changeView = (view) => {
  if (calendarRef.value) {
    calendarRef.value.getApi().changeView(view);
  }
};

defineExpose({ changeView });
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

:deep(.fc) {
  font-family: inherit;
}
:deep(.fc-toolbar-title) {
  font-size: 1.15rem !important;
  font-weight: 600 !important;
  color: var(--cor-escura);
}
:deep(.fc-button) {
  background: var(--cor-fundo) !important;
  border: 1px solid var(--cor-clara) !important;
  color: var(--cor-secundaria) !important;
  box-shadow: none !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  text-transform: capitalize;
  transition: all 0.2s ease;
}
:deep(.fc-button:hover) {
  background: var(--branco) !important;
  color: var(--cor-escura) !important;
  border-color: var(--cor-secundaria) !important;
}
:deep(.fc-button-active) {
  background: var(--cor-primaria) !important;
  color: var(--branco) !important;
  border-color: var(--cor-primaria) !important;
}
:deep(.fc-scrollgrid) {
  border-color: var(--cor-clara) !important;
  border-radius: 10px;
  overflow: hidden;
}
:deep(.fc-theme-standard td, .fc-theme-standard th) {
  border-color: var(--cor-clara) !important;
}
:deep(.fc-col-header-cell) {
  background-color: var(--cor-fundo);
  padding: 0.5rem 0;
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--cor-secundaria);
}
:deep(.fc-timegrid-slot-label) {
  font-size: 0.8rem;
  color: var(--cor-secundaria);
}
:deep(.fc-v-event) {
  border-radius: 6px !important;
  padding: 3px 5px !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
  border-left-width: 3px !important;
}
:deep(.fc-v-event:hover) {
  transform: scale(1.01);
  z-index: 5 !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}
:deep(.fc-event-main) {
  font-weight: 500;
  font-size: 0.8rem;
}
:deep(.fc-day-today) {
  background-color: rgba(28, 164, 167, 0.02) !important;
}

@media (max-width: 768px) {
  :deep(.fc-toolbar) {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>