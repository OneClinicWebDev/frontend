<template>
  <div class="panel actions-panel">
    <h3>Ações Rápidas</h3>
    <div class="actions-buttons">
      <button v-if="podeAgendar" class="btn-action" @click="$emit('novo-agendamento')">
        <i class="pi pi-calendar-plus"></i>
        Novo Agendamento
      </button>
      <button
        v-if="podeCadastrarCliente"
        class="btn-action"
        @click="$emit('novo-cliente')"
      >
        <i class="pi pi-user-plus"></i>
        Cadastrar Cliente
      </button>
      <button class="btn-action" @click="irParaAtendimentos">
        <i class="pi pi-list"></i>
        Ver Atendimentos
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
defineProps({
  podeAgendar: Boolean,
  podeCadastrarCliente: Boolean,
});
defineEmits(["novo-cliente", "novo-agendamento"]);
const router = useRouter();
const irParaAtendimentos = () => {
  router.push("/app/atendimentos");
};
</script>

<style scoped>
.panel {
  background: linear-gradient(180deg, #ffffff 0%, #fcfdff 100%);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05);
  font-family: "Inter", sans-serif;
}
.actions-panel h3 {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}
.actions-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.btn-action {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 46px;
  padding: 0 20px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #334155;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-action i {
  color: var(--cor-primaria, #1ca4a7);
  transition: color 0.25s ease;
}
.btn-action:hover {
  background: var(--cor-primaria, #1ca4a7);
  border-color: var(--cor-primaria, #1ca4a7);
  color: #ffffff;
}
.btn-action:hover i {
  color: #ffffff;
}
.btn-action:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.12);
}
@media (max-width: 768px) {
  .panel {
    padding: 16px;
  }
  .actions-buttons {
    flex-direction: column;
  }
  .btn-action {
    width: 100%;
  }
}
</style>
