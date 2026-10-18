<template>
  <Transition name="fade">
    <div class="modal-overlay" v-if="isOpen" @click.self="fechar">
      <Transition name="scale">
        <div class="modal-container" v-if="isOpen">
          <header class="modal-header">
            <div class="header-titles">
              <h3>{{ tituloModal }}</h3>
              <p class="subtitle" v-if="isDetalhes">{{ form.cliente }}</p>
            </div>
            <button class="btn-close" @click="fechar">
              <i class="pi pi-times"></i>
            </button>
          </header>

          <form
            ref="formRef"
            @submit.prevent="salvar"
            novalidate
            :class="['modal-form', { 'was-validated': foiValidado }]"
          >
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Nome do Cliente <span class="required-asterisk">*</span></label>
                <input
                  type="text"
                  v-model="form.cliente"
                  required
                  minlength="3"
                  pattern=".{3,}"
                  :disabled="isDetalhes"
                  placeholder="Ex: Maria Oliveira"
                />
                <span class="error-feedback">Preencha o nome completo do cliente.</span>
              </div>
              <div class="form-group flex-1">
                <label>Telefone <span class="required-asterisk">*</span></label>
                <input
                  type="text"
                  v-model="exibicaoTelefone"
                  @input="processarTelefone"
                  required
                  pattern=".{14,15}"
                  maxlength="15"
                  :disabled="isDetalhes"
                  placeholder="(00) 00000-0000"
                />
                <span class="error-feedback">Insira um telefone válido com DDD.</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Procedimento <span class="required-asterisk">*</span></label>
                <input
                  type="text"
                  v-model="form.procedimento"
                  required
                  pattern=".{3,}"
                  :disabled="isDetalhes"
                  placeholder="Ex: Limpeza de Pele"
                />
                <span class="error-feedback"
                  >Informe o procedimento (mín. 3 caracteres).</span
                >
              </div>
              <div class="form-group flex-1">
                <label
                  >Profissional Responsável
                  <span class="required-asterisk">*</span></label
                >
                <input
                  type="text"
                  v-model="form.profissional"
                  required
                  pattern=".{3,}"
                  :disabled="isDetalhes"
                  placeholder="Ex: Dra. Ana"
                />
                <span class="error-feedback">Informe o nome do profissional.</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Data <span class="required-asterisk">*</span></label>
                <input type="date" v-model="form.data" required :disabled="isDetalhes" />
                <span class="error-feedback">A data é obrigatória.</span>
              </div>
              <div class="form-group flex-1">
                <label>Horário <span class="required-asterisk">*</span></label>
                <input type="time" v-model="form.hora" required :disabled="isDetalhes" />
                <span class="error-feedback">O horário é obrigatório.</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Valor Estimado (R$)</label>
                <input
                  type="text"
                  :value="form.valor"
                  @input="processarValor"
                  :disabled="isDetalhes"
                  placeholder="0,00"
                />
              </div>
              <div class="form-group flex-1">
                <label>Status <span class="required-asterisk">*</span></label>
                <select v-model="form.status" :disabled="isDetalhes" required>
                  <option value="agendado">Agendado</option>
                  <option value="andamento">Em Andamento</option>
                  <option value="concluido">Concluído</option>
                  <option value="cancelado">Cancelado</option>
                </select>
                <span class="error-feedback">Selecione o status do atendimento.</span>
              </div>
            </div>

            <div class="form-group">
              <label>Observações</label>
              <textarea
                v-model="form.observacao"
                :disabled="isDetalhes"
                placeholder="Detalhes adicionais sobre o atendimento..."
                rows="3"
                class="textarea-custom"
              ></textarea>
            </div>

            <div class="form-group" v-if="modalMode !== 'criar'">
              <label>Registro no Sistema</label>
              <input type="text" v-model="form.criadoEm" disabled class="bg-gray" />
            </div>

            <footer class="modal-footer">
              <button type="button" class="btn-cancelar" @click="fechar">
                {{ isDetalhes ? "Fechar" : "Cancelar" }}
              </button>
              <button type="submit" class="btn-salvar" v-if="!isDetalhes">
                Confirmar
              </button>
            </footer>
          </form>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  isOpen: Boolean,
  mode: String,
  atendimentoEdicao: Object,
});

const emit = defineEmits(["close", "save", "notify"]);

const formRef = ref(null);
const foiValidado = ref(false);

const form = ref({
  cliente: "",
  telefone: "",
  procedimento: "",
  profissional: "",
  data: "",
  hora: "",
  valor: "",
  status: "agendado",
  observacao: "",
  criadoEm: "",
});

const exibicaoTelefone = ref("");

const tituloModal = computed(() => {
  if (props.mode === "detalhes") return "Detalhes do Atendimento";
  if (props.mode === "editar") return "Editar Atendimento";
  return "Novo Agendamento";
});

const isDetalhes = computed(() => props.mode === "detalhes");
const modalMode = computed(() => props.mode);

const aplicarMascaraTelefone = (v) => {
  v = v.replace(/\D/g, "");
  if (v.length <= 11) {
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
  }
  return v;
};

const processarTelefone = (event) => {
  let num = event.target.value.replace(/\D/g, "").slice(0, 11);
  exibicaoTelefone.value = aplicarMascaraTelefone(num);
  form.value.telefone = exibicaoTelefone.value;
};

const processarValor = (event) => {
  let v = event.target.value.replace(/\D/g, "");
  if (v) {
    v = (v / 100).toFixed(2) + "";
    v = v.replace(".", ",");
    v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  }
  form.value.valor = v;
  event.target.value = v;
};

const formatarDataInput = (dataStr) => {
  if (!dataStr) return "";
  if (dataStr.includes("/")) {
    const [dia, mes, ano] = dataStr.split("/");
    return `${ano}-${mes}-${dia}`;
  }
  return dataStr;
};

const formatarDataVisualizacao = (dataStr) => {
  if (!dataStr) return "";
  if (dataStr.includes("-")) {
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  }
  return dataStr;
};

watch(
  () => props.isOpen,
  (aberto) => {
    if (aberto) {
      foiValidado.value = false;
      if (props.atendimentoEdicao && props.mode !== "criar") {
        form.value = {
          ...props.atendimentoEdicao,
          data: formatarDataInput(props.atendimentoEdicao.data),
        };
        exibicaoTelefone.value = props.atendimentoEdicao.telefone || "";
      } else {
        form.value = {
          cliente: "",
          telefone: "",
          procedimento: "",
          profissional: "",
          data: "",
          hora: "",
          valor: "",
          status: "agendado",
          observacao: "",
          criadoEm: "",
        };
        exibicaoTelefone.value = "";
      }
    }
  }
);

const fechar = () => {
  emit("close");
};

const salvar = () => {
  if (isDetalhes.value) return;

  if (formRef.value && !formRef.value.checkValidity()) {
    foiValidado.value = true;
    emit("notify", {
      message: "Por favor, preencha os campos corretamente.",
      type: "error",
    });
    const firstInvalid = formRef.value.querySelector(":invalid");
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const dadosSalvos = {
    ...form.value,
    data: formatarDataVisualizacao(form.value.data),
  };

  emit("save", dadosSalvos);
  fechar();
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(31, 41, 55, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  font-family: "Inter", sans-serif;
}
.modal-container {
  background-color: #ffffff;
  border-radius: 16px;
  width: 90%;
  max-width: 650px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background-color: #1f2937;
  color: #ffffff;
}
.header-titles h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
}
.subtitle {
  margin: 0.2rem 0 0 0;
  font-size: 0.85rem;
  color: #9ca3af;
}
.btn-close {
  background: none;
  border: none;
  color: #ffffff;
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
  font-size: 1.2rem;
}
.btn-close:hover {
  opacity: 1;
  transform: scale(1.1);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
  max-height: 80vh;
  overflow-y: auto;
}
.form-row {
  display: flex;
  gap: 1rem;
}
@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 1.25rem;
  }
}
.flex-1 {
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  position: relative;
}
.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  transition: color 0.3s ease;
}
.required-asterisk {
  color: #ef4444;
}

.form-group input,
.form-group select,
.textarea-custom {
  padding: 0.8rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  font-size: 0.95rem;
  color: #1f2937;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background-color: #ffffff;
  font-family: inherit;
}
.form-group input:hover:not(:disabled),
.form-group select:hover:not(:disabled),
.textarea-custom:hover:not(:disabled) {
  border-color: #cbd5e1;
}
.form-group input:focus,
.form-group select:focus,
.textarea-custom:focus {
  border-color: #1ca4a7;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.1);
  transform: translateY(-1px);
}
.form-group input:disabled,
.form-group select:disabled,
.textarea-custom:disabled,
.bg-gray {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
}
.textarea-custom {
  resize: vertical;
}

.error-feedback {
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 0.2rem;
  opacity: 0;
  height: 0;
  overflow: hidden;
  transition: opacity 0.3s ease, height 0.3s ease;
}

.was-validated input:invalid,
.was-validated select:invalid {
  border-color: #ef4444;
  background-color: #fef2f2;
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
.was-validated input:invalid:focus,
.was-validated select:invalid:focus {
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}
.was-validated .form-group:has(:invalid) label {
  color: #ef4444;
}
.was-validated input:invalid ~ .error-feedback,
.was-validated select:invalid ~ .error-feedback {
  opacity: 1;
  height: 16px;
}

@keyframes shake {
  10%,
  90% {
    transform: translate3d(-1px, 0, 0);
  }
  20%,
  80% {
    transform: translate3d(2px, 0, 0);
  }
  30%,
  50%,
  70% {
    transform: translate3d(-3px, 0, 0);
  }
  40%,
  60% {
    transform: translate3d(3px, 0, 0);
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 1rem;
}
.btn-cancelar {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}
.btn-cancelar:hover {
  background-color: #f9fafb;
  color: #1f2937;
}
.btn-salvar {
  background-color: #1ca4a7;
  color: #ffffff;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-salvar:hover {
  background-color: #158a8d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.2);
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
</style>
