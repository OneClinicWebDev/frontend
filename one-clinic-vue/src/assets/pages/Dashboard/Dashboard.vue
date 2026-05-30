<template>
  <div class="dashboard-container">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <i class="pi pi-calendar stat-icon"></i>
          <span class="trend positive">+2 ↗</span>
        </div>
        <div class="stat-value">12</div>
        <div class="stat-label">Agendamentos Hoje</div>
      </div>
      <div class="stat-card">
        <div class="stat-header">
          <i class="pi pi-users stat-icon"></i>
          <span class="trend positive">+18 ↗</span>
        </div>
        <div class="stat-value">248</div>
        <div class="stat-label">Clientes Ativos</div>
      </div>
      <div class="stat-card">
        <div class="stat-header">
          <i class="pi pi-dollar stat-icon"></i>
          <span class="trend positive">+12% ↗</span>
        </div>
        <div class="stat-value">R$ 24.500</div>
        <div class="stat-label">Receita do Mês</div>
      </div>
      <div class="stat-card">
        <div class="stat-header">
          <i class="pi pi-chart-line stat-icon"></i>
          <span class="trend negative">-3% ↘</span>
        </div>
        <div class="stat-value">78%</div>
        <div class="stat-label">Taxa de Retorno</div>
      </div>
    </div>

    <div class="content-grid">
      <div class="panel agenda-panel">
        <div class="panel-header">
          <h3>Agenda de Hoje</h3>
          <a href="#" class="link-ver-tudo">Ver tudo</a>
        </div>
        <div class="agenda-list">
          <div class="agenda-item">
            <span class="time"><i class="pi pi-clock"></i> 09:00</span>
            <div class="client-info">
              <span class="client-name">Ana Silva</span>
              <span class="procedure">Limpeza de Pele</span>
            </div>
            <span class="professional">Dra. Maria</span>
          </div>
          <div class="agenda-item">
            <span class="time"><i class="pi pi-clock"></i> 10:30</span>
            <div class="client-info">
              <span class="client-name">Carla Santos</span>
              <span class="procedure">Botox</span>
            </div>
            <span class="professional">Dr. Paulo</span>
          </div>
          <div class="agenda-item">
            <span class="time"><i class="pi pi-clock"></i> 11:00</span>
            <div class="client-info">
              <span class="client-name">Julia Lima</span>
              <span class="procedure">Peeling</span>
            </div>
            <span class="professional">Dra. Maria</span>
          </div>
        </div>
      </div>

      <div class="panel clientes-panel">
        <div class="panel-header">
          <h3>Clientes Recentes</h3>
          <a href="#" class="link-ver-tudo">Ver todos</a>
        </div>
        <div class="clientes-list">
          <div class="cliente-item">
            <div class="avatar">BO</div>
            <div class="cliente-info">
              <span class="cliente-name">Beatriz Oliveira</span>
              <span class="cliente-visit">Última visita: Hoje</span>
            </div>
            <div class="cliente-count">
              <span class="count-num">8</span>
              <span class="count-label">visitas</span>
            </div>
          </div>
          <div class="cliente-item">
            <div class="avatar">MS</div>
            <div class="cliente-info">
              <span class="cliente-name">Mariana Souza</span>
              <span class="cliente-visit">Última visita: Ontem</span>
            </div>
            <div class="cliente-count">
              <span class="count-num">15</span>
              <span class="count-label">visitas</span>
            </div>
          </div>
          <div class="cliente-item">
            <div class="avatar">CF</div>
            <div class="cliente-info">
              <span class="cliente-name">Camila Ferreira</span>
              <span class="cliente-visit">Última visita: 2 dias</span>
            </div>
            <div class="cliente-count">
              <span class="count-num">4</span>
              <span class="count-label">visitas</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="panel actions-panel">
      <h3>Ações Rápidas</h3>
      <div class="actions-buttons">
        <button class="btn-action"><i class="pi pi-calendar-plus"></i> Novo Agendamento</button>
        <button class="btn-action"><i class="pi pi-user-plus"></i> Cadastrar Cliente</button>
        <button class="btn-action"><i class="pi pi-file-edit"></i> Registrar Atendimento</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel {
  background: var(--branco, #FFFFFF);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #E5E7EB;
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
  font-size: 0.85rem;
  color: var(--cor-primaria, #1CA4A7);
  text-decoration: none;
  font-weight: 500;
}

.link-ver-tudo:hover {
  text-decoration: underline;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.stat-card {
  background: var(--branco, #FFFFFF);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #E5E7EB;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.stat-icon {
  color: var(--cor-secundaria, #6B7280);
  font-size: 1.2rem;
}

.trend {
  font-size: 0.85rem;
  font-weight: 600;
}

.trend.positive {
  color: #10B981;
}

.trend.negative {
  color: #EF4444;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--cor-escura, #111827);
  margin-bottom: 0.2rem;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--cor-secundaria, #6B7280);
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.agenda-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.agenda-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: var(--cor-clara, #F9FAFB);
  border-radius: 8px;
  gap: 1.5rem;
  transition: transform 0.2s ease, background 0.2s ease;
}

.agenda-item:hover {
  transform: translateX(4px);
  background: #F3F4F6;
}

.agenda-item .time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cor-secundaria, #4B5563);
  font-weight: 500;
  font-size: 0.9rem;
  width: 80px;
}

.client-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.client-name {
  font-weight: 600;
  color: var(--cor-escura, #111827);
}

.procedure {
  font-size: 0.85rem;
  color: var(--cor-secundaria, #6B7280);
}

.professional {
  font-size: 0.9rem;
  color: var(--cor-secundaria, #4B5563);
}

.clientes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cliente-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cliente-item .avatar {
  width: 40px;
  height: 40px;
  background: var(--cor-clara, #F3F4F6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: var(--cor-secundaria, #4B5563);
}

.cliente-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.cliente-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--cor-escura, #111827);
}

.cliente-visit {
  font-size: 0.8rem;
  color: var(--cor-secundaria, #6B7280);
}

.cliente-count {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.count-num {
  font-weight: 600;
  color: var(--cor-escura, #111827);
}

.count-label {
  font-size: 0.75rem;
  color: var(--cor-secundaria, #6B7280);
}

.actions-panel h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--cor-escura, #111827);
}

.actions-buttons {
  display: flex;
  gap: 1rem;
}

.btn-action {
  padding: 0.75rem 1.25rem;
  background: var(--branco, #FFFFFF);
  border: 1px solid var(--cor-primaria, #1CA4A7);
  border-radius: 8px;
  font-weight: 500;
  color: var(--cor-primaria, #1CA4A7);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.2s ease, color 0.2s ease;
}

.btn-action:hover {
  background: var(--cor-primaria, #1CA4A7);
  color: var(--branco, #FFFFFF);
}
</style>