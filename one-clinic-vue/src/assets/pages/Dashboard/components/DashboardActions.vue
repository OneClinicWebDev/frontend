<template>
  <div class="panel actions-panel">
    <h3>Ações Rápidas</h3>

    <div class="actions-buttons">
      <button class="btn-action">
        <i class="pi pi-calendar-plus"></i>
        Novo Agendamento
      </button>

      <button
        class="btn-action"
        @click="$emit('novo-cliente')"
      >
        <i class="pi pi-user-plus"></i>
        Cadastrar Cliente
      </button>

      <button class="btn-action">
        <i class="pi pi-file-edit"></i>
        Registrar Atendimento
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['novo-cliente'])
</script>

<style scoped>
.panel {
  background: var(--branco, #ffffff);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.actions-panel h3 {
  margin-bottom: 1rem;
  color: var(--cor-escura);
}

.actions-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  padding: 0.85rem 1.25rem;

  border-radius: 8px;
  border: 1px solid var(--cor-primaria);

  background: var(--branco);
  color: var(--cor-primaria);

  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-action:hover {
  background: var(--cor-primaria);
  color: white;
}

@media (max-width: 768px) {
  .panel {
    padding: 1rem;
  }

  .actions-buttons {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }
}
</style>    