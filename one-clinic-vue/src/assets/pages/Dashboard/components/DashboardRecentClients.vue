<template>
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
  margin-bottom: 1.5rem;
}

.link-ver-tudo {
  color: var(--cor-primaria, #1ca4a7);
  text-decoration: none;
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

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.cliente-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.cliente-name {
  font-weight: 600;
}

.cliente-visit {
  font-size: 0.8rem;
  color: var(--cor-secundaria);
}

.cliente-count {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.count-num {
  font-weight: 700;
}

.count-label {
  font-size: 0.75rem;
  color: var(--cor-secundaria);
}

@media (max-width: 768px) {
  .panel {
    padding: 1rem;
  }
}
</style>