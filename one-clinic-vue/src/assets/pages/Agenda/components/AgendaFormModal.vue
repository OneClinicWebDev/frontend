<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
      <Transition name="scale">
        <div class="modal-container" v-if="isOpen">
          <header class="modal-header">
            <h3>{{ editing ? "Editar Agendamento" : "Novo Agendamento" }}</h3>
            <button class="btn-close" @click="$emit('close')">
              <i class="pi pi-times"></i>
            </button>
          </header>

          <div class="modal-body">
            <div class="form-group">
              <label>Cliente</label>
              <select v-model="form.cliente" class="form-control">
                <option value="" disabled>Selecione o cliente...</option>
                <option v-for="c in clientesBD" :key="c.cpf" :value="c.nome">
                  {{ c.nome }} ({{ c.cpf }})
                </option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Serviço</label>
                <select v-model="form.servico" class="form-control">
                  <option value="" disabled>Selecione...</option>
                  <option v-for="s in servicosBD" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>Profissional</label>
                <select v-model="form.profissional" class="form-control">
                  <option value="" disabled>Selecione...</option>
                  <option v-for="p in profissionaisBD" :key="p" :value="p">
                    {{ p }}
                  </option>
                </select>
              </div>
            </div>

            <div class="dates-box">
              <div class="form-row">
                <div class="form-group">
                  <label>Data Inicial</label>
                  <input v-model="form.dataInicio" type="date" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Hora Inicial</label>
                  <input v-model="form.horaInicio" type="time" class="form-control" />
                </div>
              </div>
              <div class="form-row mt-3">
                <div class="form-group">
                  <label>Data Final</label>
                  <input v-model="form.dataFim" type="date" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Hora Final</label>
                  <input v-model="form.horaFim" type="time" class="form-control" />
                </div>
              </div>
            </div>

            <div class="form-group mt-3">
              <label>Status do Agendamento</label>
              <select v-model="form.status" class="form-control">
                <option value="confirmado">Confirmado</option>
                <option value="pendente">Pendente</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>

          <footer class="modal-footer">
            <button
              v-if="editing"
              type="button"
              class="btn-excluir"
              @click="$emit('delete')"
            >
              Excluir
            </button>
            <div class="footer-actions">
              <button type="button" class="btn-cancelar" @click="$emit('close')">
                Cancelar
              </button>
              <button
                type="button"
                class="btn-salvar"
                @click="$emit('save')"
                :disabled="!isValid"
              >
                Salvar
              </button>
            </div>
          </footer>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  editing: Boolean,
  form: Object,
  clientesBD: Array,
  servicosBD: Array,
  profissionaisBD: Array,
  isValid: Boolean,
});

defineEmits(["close", "save", "delete"]);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(4, 31, 46, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-container {
  background-color: var(--branco);
  border-radius: 12px;
  width: 100%;
  max-width: 550px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  margin: 1rem;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background-color: var(--branco);
  border-bottom: 1px solid var(--cor-clara);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--cor-escura);
}

.btn-close {
  background: var(--cor-fundo);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--cor-secundaria);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-close:hover {
  background-color: #fef2f2;
  color: #ef4444;
}

.modal-body {
  padding: 1.5rem;
  max-height: 70vh;
  overflow-y: auto;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cor-secundaria);
}

.form-control {
  padding: 0.75rem;
  border: 1px solid var(--cor-clara);
  border-radius: 8px;
  outline: none;
  font-size: 0.95rem;
  color: var(--cor-escura);
  background-color: var(--branco);
  transition: all 0.2s;
}

.form-control:focus {
  border-color: var(--cor-primaria);
  box-shadow: 0 0 0 3px rgba(28, 164, 167, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.dates-box {
  background-color: var(--cor-fundo);
  padding: 1rem;
  border-radius: 10px;
  border: 1px dashed var(--cor-clara);
  margin-top: 0.5rem;
}

.mt-3 {
  margin-top: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--cor-clara);
  background-color: var(--cor-fundo);
}

.footer-actions {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
}

.btn-cancelar {
  background: var(--branco);
  border: 1px solid var(--cor-clara);
  color: var(--cor-secundaria);
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-cancelar:hover {
  background-color: var(--cor-fundo);
}

.btn-salvar {
  background-color: var(--cor-primaria);
  color: var(--branco);
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-salvar:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-salvar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-excluir {
  background: transparent;
  border: 1px solid #fecaca;
  color: #ef4444;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-excluir:hover {
  background-color: #fef2f2;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  .modal-footer {
    flex-wrap: wrap;
    flex-direction: column-reverse;
    gap: 1rem;
  }
  .footer-actions {
    width: 100%;
    display: flex;
  }
  .footer-actions button {
    flex: 1;
  }
  .btn-excluir {
    width: 100%;
  }
}
</style>