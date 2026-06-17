<template>
  <div class="panel agenda-panel">
    <div class="panel-header">
      <h3>Agenda de Hoje</h3>
      <a href="#" class="link-ver-tudo">Ver tudo</a>
    </div>

    <div class="agenda-list">
      <div class="agenda-item">
        <span class="time">
          <i class="pi pi-clock"></i>
          09:00
        </span>

        <div class="client-info">
          <span class="client-name">Ana Silva</span>
          <span class="procedure">Limpeza de Pele</span>
        </div>

        <span class="professional">Dra. Maria</span>
      </div>

      <div class="agenda-item">
        <span class="time">
          <i class="pi pi-clock"></i>
          10:30
        </span>

        <div class="client-info">
          <span class="client-name">Carla Santos</span>
          <span class="procedure">Botox</span>
        </div>

        <span class="professional">Dr. Paulo</span>
      </div>

      <div class="agenda-item">
        <span class="time">
          <i class="pi pi-clock"></i>
          11:00
        </span>

        <div class="client-info">
          <span class="client-name">Julia Lima</span>
          <span class="procedure">Peeling</span>
        </div>

        <span class="professional">Dra. Maria</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.panel {
  background: var(--branco, #ffffff);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.panel-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cor-escura, #111827);
}

.link-ver-tudo {
  color: var(--cor-primaria, #1ca4a7);
  text-decoration: none;
  font-size: 0.875rem;
}

.agenda-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.agenda-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--cor-clara, #f9fafb);
  border-radius: 10px;
  transition: all 0.25s ease;
}

.agenda-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 90px;
  flex-shrink: 0;
  color: var(--cor-secundaria, #4b5563);
}

.client-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.client-name {
  font-weight: 600;
  color: var(--cor-escura, #111827);
}

.procedure {
  font-size: 0.85rem;
  color: var(--cor-secundaria, #6b7280);
}

.professional {
  color: var(--cor-secundaria, #4b5563);
  white-space: nowrap;
}

@media (max-width: 768px) {
  .panel {
    padding: 1rem;
  }

  .agenda-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .time {
    width: auto;
  }
}
</style>