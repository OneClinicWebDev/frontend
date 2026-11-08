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
  box-sizing: border-box;
  background-color: #ffffff;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
:deep(.fc) {
  font-family: inherit;
}
:deep(.fc-toolbar-title) {
  font-size: 1.1rem !important;
  font-weight: 600 !important;
  color: #0f172a;
}
:deep(.fc-button) {
  background: #f8fafc !important;
  border: 1px solid #cbd5e1 !important;
  color: #475569 !important;
  box-shadow: none !important;
  font-weight: 600 !important;
  font-size: 0.8rem !important;
  border-radius: 10px !important;
  padding: 7px 14px !important;
  text-transform: capitalize;
  transition: all 0.2s ease;
}
:deep(.fc-button:hover) {
  background: #ffffff !important;
  color: #0f172a !important;
  border-color: #94a3b8 !important;
}
:deep(.fc-button-active) {
  background: var(--cor-primaria, #1ca4a7) !important;
  color: #ffffff !important;
  border-color: var(--cor-primaria, #1ca4a7) !important;
}
:deep(.fc-button-group > .fc-button) {
  border-radius: 10px !important;
  margin-right: 4px;
}
:deep(.fc-scrollgrid) {
  border-color: #e2e8f0 !important;
  border-radius: 14px;
  overflow: hidden;
}
:deep(.fc-theme-standard td),
:deep(.fc-theme-standard th) {
  border-color: #e2e8f0 !important;
}
:deep(.fc-col-header-cell) {
  background-color: #f8fafc;
  padding: 8px 0;
  font-weight: 600;
  font-size: 0.8rem;
  color: #64748b;
}
:deep(.fc-timegrid-slot-label) {
  font-size: 0.75rem;
  color: #64748b;
}
:deep(.fc-v-event),
:deep(.fc-daygrid-event) {
  border-radius: 8px !important;
  padding: 3px 6px !important;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
  transition: transform 0.2s ease;
  border-left-width: 3px !important;
}
:deep(.fc-v-event:hover) {
  transform: scale(1.01);
  z-index: 5 !important;
  box-shadow: 0 4px 8px rgba(15, 23, 42, 0.08);
}
:deep(.fc-event-main) {
  font-weight: 600;
  font-size: 0.75rem;
}
:deep(.fc-day-today) {
  background-color: rgba(28, 164, 167, 0.04) !important;
}
@media (max-width: 768px) {
  .action-panel {
    padding: 14px;
    border-radius: 16px;
  }
  :deep(.fc-toolbar) {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
