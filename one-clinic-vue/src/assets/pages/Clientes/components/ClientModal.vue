<template>
  <Transition name="fade">
    <div class="modal-overlay" v-if="isOpen" @click.self="fechar">
      <Transition name="scale">
        <div class="modal-container" v-if="isOpen">
          <header class="modal-header">
            <div class="header-titles">
              <h3>{{ tituloModal }}</h3>
              <p class="subtitle" v-if="isDetalhes">{{ form.nome }}</p>
            </div>
            <button class="btn-close" @click="fechar">
              <i class="pi pi-times"></i>
            </button>
          </header>

          <div class="modal-tabs" v-if="isDetalhes">
            <button
              :class="['tab-btn', { active: activeTab === 'cadastro' }]"
              @click="activeTab = 'cadastro'"
            >
              <i class="pi pi-user"></i> Cadastro
            </button>
            <button
              :class="['tab-btn', { active: activeTab === 'historico' }]"
              @click="activeTab = 'historico'"
            >
              <i class="pi pi-calendar"></i> Histórico
            </button>
            <button
              :class="['tab-btn', { active: activeTab === 'pacotes' }]"
              @click="activeTab = 'pacotes'"
            >
              <i class="pi pi-box"></i> Pacotes
            </button>
          </div>

          <form
            ref="formRef"
            @submit.prevent="salvar"
            novalidate
            :class="['modal-form', { 'was-validated': foiValidado }]"
          >
            <div class="form-content">
              <Transition name="fade-slide" mode="out-in">
                <div v-if="activeTab === 'cadastro'" class="tab-pane" key="cadastro">
                  <div class="form-row">
                    <div class="form-group flex-1">
                      <label
                        >Nome Completo <span class="required-asterisk">*</span></label
                      >
                      <input
                        type="text"
                        v-model="form.nome"
                        required
                        minlength="3"
                        pattern=".{3,}"
                        :disabled="isDetalhes"
                        placeholder="Ex: João da Silva"
                      />
                      <span class="error-feedback"
                        >Preencha o nome completo (mínimo 3 letras).</span
                      >
                    </div>

                    <div class="form-group flex-1">
                      <label>CPF <span class="required-asterisk">*</span></label>
                      <input
                        type="text"
                        v-model="exibicaoCpf"
                        @input="processarCpf"
                        required
                        pattern=".{14,14}"
                        maxlength="14"
                        :disabled="isDetalhes"
                        placeholder="000.000.000-00"
                      />
                      <span class="error-feedback">O CPF deve conter os 11 números.</span>
                    </div>
                  </div>

                  <div class="form-row mt-3">
                    <div class="form-group flex-1">
                      <label>E-mail <span class="required-asterisk">*</span></label>
                      <input
                        type="email"
                        v-model="form.email"
                        required
                        pattern="[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
                        :disabled="isDetalhes"
                        placeholder="Ex: joao@email.com"
                      />
                      <span class="error-feedback"
                        >Insira um e-mail com @ e domínio (ex: .com).</span
                      >
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
                      <span class="error-feedback"
                        >O telefone deve conter o DDD e número válido.</span
                      >
                    </div>
                  </div>

                  <div class="form-row mt-3">
                    <div class="form-group flex-1">
                      <label>CEP <span class="required-asterisk">*</span></label>
                      <input
                        type="text"
                        v-model="exibicaoCep"
                        @input="processarCep"
                        required
                        pattern=".{9,9}"
                        maxlength="9"
                        :disabled="isDetalhes"
                        placeholder="00000-000"
                      />
                      <span class="error-feedback"
                        >O CEP deve conter os 8 números corretos.</span
                      >
                    </div>
                    <div class="form-group flex-1">
                      <label>Número <span class="required-asterisk">*</span></label>
                      <input
                        type="text"
                        :value="form.numero"
                        @input="processarNumero"
                        required
                        pattern="\d{1,4}"
                        maxlength="4"
                        :disabled="isDetalhes"
                        placeholder="Apenas números"
                      />
                      <span class="error-feedback"
                        >Campo obrigatório. Máximo 4 dígitos.</span
                      >
                    </div>
                  </div>

                  <div class="form-row mt-3">
                    <div class="form-group flex-1">
                      <label
                        >Status do Cadastro
                        <span class="required-asterisk">*</span></label
                      >
                      <div class="status-toggle" :class="{ disabled: isDetalhes }">
                        <label
                          :class="[
                            'toggle-option',
                            { active: form.status_cadastro === 'ATIVO' },
                          ]"
                        >
                          <input
                            type="radio"
                            v-model="form.status_cadastro"
                            value="ATIVO"
                            :disabled="isDetalhes"
                          />
                          ATIVO
                        </label>
                        <label
                          :class="[
                            'toggle-option',
                            { active: form.status_cadastro === 'INATIVO' },
                          ]"
                        >
                          <input
                            type="radio"
                            v-model="form.status_cadastro"
                            value="INATIVO"
                            :disabled="isDetalhes"
                          />
                          INATIVO
                        </label>
                        <div
                          class="toggle-slider"
                          :class="form.status_cadastro.toLowerCase()"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-else-if="activeTab === 'historico'"
                  class="tab-pane mock-section"
                  key="historico"
                >
                  <div class="mock-list scroller">
                    <div class="mock-item" v-for="i in 8" :key="'hist' + i">
                      <div class="mock-icon"><i class="pi pi-calendar-clock"></i></div>
                      <div class="mock-info">
                        <h4>Sessão Estética Avançada {{ i }}</h4>
                        <p>Com Profissional - 1{{ i }}/10/2026</p>
                      </div>
                      <span class="mock-badge badge-concluido">Concluído</span>
                    </div>
                  </div>
                </div>

                <div
                  v-else-if="activeTab === 'pacotes'"
                  class="tab-pane mock-section"
                  key="pacotes"
                >
                  <div class="mock-list scroller">
                    <div class="mock-item" v-for="i in 5" :key="'pac' + i">
                      <div class="mock-icon"><i class="pi pi-box"></i></div>
                      <div class="mock-info">
                        <h4>Pacote Personalizado {{ i }}</h4>
                        <p>Sessões restantes: {{ i }}/10</p>
                      </div>
                      <span class="mock-badge badge-ativo">Ativo</span>
                    </div>
                  </div>
                </div>
              </Transition>
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
  clienteEdicao: Object,
});

const emit = defineEmits(["close", "save", "notify"]);

const activeTab = ref("cadastro");
const formRef = ref(null);
const foiValidado = ref(false);

const form = ref({
  nome: "",
  cpf: "",
  email: "",
  telefone: "",
  cep: "",
  numero: "",
  status_cadastro: "ATIVO",
});

const exibicaoCpf = ref("");
const exibicaoTelefone = ref("");
const exibicaoCep = ref("");

const tituloModal = computed(() => {
  if (props.mode === "detalhes") return "Perfil do Cliente";
  if (props.mode === "editar") return "Editar Cliente";
  return "Novo Cliente";
});

const isDetalhes = computed(() => props.mode === "detalhes");

const aplicarMascaraCpf = (v) => {
  v = v.replace(/\D/g, "");
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d)/, "$1.$2");
    v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return v;
};

const aplicarMascaraTelefone = (v) => {
  v = v.replace(/\D/g, "");
  if (v.length <= 11) {
    v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
    v = v.replace(/(\d)(\d{4})$/, "$1-$2");
  }
  return v;
};

const aplicarMascaraCep = (v) => {
  v = v.replace(/\D/g, "");
  if (v.length <= 8) {
    v = v.replace(/^(\d{5})(\d)/, "$1-$2");
  }
  return v;
};

const processarCpf = (event) => {
  let num = event.target.value.replace(/\D/g, "").slice(0, 11);
  exibicaoCpf.value = aplicarMascaraCpf(num);
  form.value.cpf = exibicaoCpf.value;
};

const processarTelefone = (event) => {
  let num = event.target.value.replace(/\D/g, "").slice(0, 11);
  exibicaoTelefone.value = aplicarMascaraTelefone(num);
  form.value.telefone = exibicaoTelefone.value;
};

const processarCep = (event) => {
  let num = event.target.value.replace(/\D/g, "").slice(0, 8);
  exibicaoCep.value = aplicarMascaraCep(num);
  form.value.cep = exibicaoCep.value;
};

const processarNumero = (event) => {
  let num = event.target.value.replace(/\D/g, "").slice(0, 4);
  form.value.numero = num;
  event.target.value = num;
};

watch(
  () => props.isOpen,
  (aberto) => {
    if (aberto) {
      activeTab.value = "cadastro";
      foiValidado.value = false;

      if (props.clienteEdicao && props.mode !== "criar") {
        form.value = { ...props.clienteEdicao };
        exibicaoCpf.value = props.clienteEdicao.cpf || "";
        exibicaoTelefone.value = props.clienteEdicao.telefone || "";
        exibicaoCep.value = props.clienteEdicao.cep || "";
      } else {
        form.value = {
          nome: "",
          cpf: "",
          email: "",
          telefone: "",
          cep: "",
          numero: "",
          status_cadastro: "ATIVO",
        };
        exibicaoCpf.value = "";
        exibicaoTelefone.value = "";
        exibicaoCep.value = "";
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
      message: "Por favor, corrija os campos em vermelho para prosseguir.",
      type: "error",
    });
    const firstInvalid = formRef.value.querySelector(":invalid");
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  emit("save", { ...form.value });
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

.modal-tabs {
  display: flex;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 1.5rem;
}

.tab-btn {
  background: none;
  border: none;
  padding: 1rem 1.2rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-btn:hover {
  color: #1f2937;
  background-color: rgba(0, 0, 0, 0.02);
}

.tab-btn.active {
  color: #1ca4a7;
  border-bottom-color: #1ca4a7;
}

.modal-form {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

.form-content {
  position: relative;
  overflow: hidden;
}

.tab-pane {
  width: 100%;
}

.mt-3 {
  margin-top: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
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

.form-group input {
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

.form-group input:hover:not(:disabled) {
  border-color: #cbd5e1;
}

.form-group input:focus {
  border-color: #1ca4a7;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.1);
  transform: translateY(-1px);
}

.form-group input:disabled {
  background-color: #f9fafb;
  color: #9ca3af;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

.status-toggle {
  position: relative;
  display: flex;
  background: #f1f5f9;
  border-radius: 10px;
  height: 44px;
  padding: 4px;
  overflow: hidden;
}

.status-toggle.disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
}

.toggle-option {
  flex: 1;
  text-align: center;
  z-index: 2;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.status-toggle.disabled .toggle-option {
  cursor: not-allowed;
}

.toggle-option input {
  display: none;
}

.toggle-option.active {
  color: #ffffff;
}

.toggle-slider {
  position: absolute;
  top: 4px;
  bottom: 4px;
  width: calc(50% - 4px);
  border-radius: 8px;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.4s ease;
  z-index: 1;
}

.toggle-slider.ativo {
  transform: translateX(0);
  background-color: #1ca4a7;
}

.toggle-slider.inativo {
  transform: translateX(100%);
  background-color: #4b5563;
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

.was-validated input:invalid {
  border-color: #ef4444;
  background-color: #fef2f2;
  animation: shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.was-validated input:invalid:focus {
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.was-validated .form-group:has(:invalid) label {
  color: #ef4444;
}

.was-validated input:invalid ~ .error-feedback {
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

.mock-section {
  padding: 0.5rem 0;
}

.scroller {
  max-height: 350px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.scroller::-webkit-scrollbar {
  width: 6px;
}
.scroller::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 10px;
}
.scroller::-webkit-scrollbar-track {
  background-color: transparent;
}

.mock-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mock-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #f9fafb;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.mock-item:hover {
  transform: translateX(4px);
  border-color: #1ca4a7;
}

.mock-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #e0f2f1;
  color: #00796b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-right: 1rem;
}

.mock-info {
  flex: 1;
}

.mock-info h4 {
  margin: 0 0 0.2rem 0;
  color: #1f2937;
  font-size: 0.95rem;
}

.mock-info p {
  margin: 0;
  color: #6b7280;
  font-size: 0.8rem;
}

.mock-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  text-transform: uppercase;
}

.badge-concluido {
  background-color: #def7ec;
  color: #03543f;
}
.badge-ativo {
  background-color: #e0f2fe;
  color: #0369a1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
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

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(15px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-15px);
}
</style>
