<template>
  <div class="page-container">
    <main class="page-content">
      <section class="cards-section-container">
        <form class="settings-form" novalidate @submit.prevent="salvarClinica">
          <p v-if="carregandoClinica" class="load-note" role="status">
            <i class="pi pi-spin pi-spinner"></i> Carregando dados da clínica...
          </p>

          <div class="form-section">
            <div class="section-header">
              <div class="icon-circle">
                <i class="pi pi-briefcase"></i>
              </div>
              <div class="section-titles">
                <h2>Identificação da clínica</h2>
                <p>Informações cadastrais e identificação do estabelecimento.</p>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group full-width">
                <label for="razao_social" class="form-label">
                  Razão social <span class="required">*</span>
                </label>
                <input
                  id="razao_social"
                  v-model="form.razao_social"
                  class="form-control"
                  :class="{ 'has-error': erros.razao_social }"
                  type="text"
                  maxlength="255"
                  autocomplete="organization"
                  placeholder="Razão social cadastrada"
                  @input="erros.razao_social = ''"
                />
                <small v-if="erros.razao_social" class="error-message">
                  {{ erros.razao_social }}
                </small>
              </div>

              <div class="form-group">
                <label for="nome_fantasia" class="form-label">
                  Nome fantasia <span class="required">*</span>
                </label>
                <input
                  id="nome_fantasia"
                  v-model="form.nome_fantasia"
                  class="form-control"
                  :class="{ 'has-error': erros.nome_fantasia }"
                  type="text"
                  maxlength="255"
                  placeholder="Nome comercial da clínica"
                  @input="erros.nome_fantasia = ''"
                />
                <small v-if="erros.nome_fantasia" class="error-message">
                  {{ erros.nome_fantasia }}
                </small>
              </div>

              <div class="form-group">
                <label for="cnpj" class="form-label">
                  CNPJ <span class="required">*</span>
                </label>
                <input
                  id="cnpj"
                  v-model="form.cnpj"
                  class="form-control"
                  :class="{ 'has-error': erros.cnpj }"
                  type="text"
                  inputmode="numeric"
                  autocomplete="off"
                  maxlength="18"
                  placeholder="00.000.000/0000-00"
                  @input="formatarCNPJ"
                />
                <small v-if="erros.cnpj" class="error-message">
                  {{ erros.cnpj }}
                </small>
              </div>

              <div class="form-group">
                <label for="telefone" class="form-label">
                  Telefone principal <span class="required">*</span>
                </label>
                <input
                  id="telefone"
                  v-model="form.telefone"
                  class="form-control"
                  :class="{ 'has-error': erros.telefone }"
                  type="tel"
                  inputmode="numeric"
                  autocomplete="tel"
                  maxlength="15"
                  placeholder="(00) 00000-0000"
                  @input="formatarTelefone"
                />
                <small v-if="erros.telefone" class="error-message">
                  {{ erros.telefone }}
                </small>
              </div>
            </div>
          </div>

          <hr class="section-divider" />

          <div class="form-section">
            <div class="section-header">
              <div class="icon-circle">
                <i class="pi pi-map-marker"></i>
              </div>
              <div class="section-titles">
                <h2>Endereço do estabelecimento</h2>
                <p>Informe o endereço completo da clínica em um único campo.</p>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group full-width">
                <label for="endereco" class="form-label">Endereço</label>
                <textarea
                  id="endereco"
                  v-model="form.endereco"
                  class="form-control form-textarea"
                  :class="{ 'has-error': erros.endereco }"
                  maxlength="255"
                  rows="3"
                  placeholder="Rua, número, complemento, bairro, cidade e UF"
                  @input="erros.endereco = ''"
                ></textarea>
                <div class="textarea-footer">
                  <small v-if="erros.endereco" class="error-message">
                    {{ erros.endereco }}
                  </small>
                  <small v-else class="field-hint">
                    Campo opcional, limitado a 255 caracteres.
                  </small>
                  <span class="character-count">{{ form.endereco.length }}/255</span>
                </div>
              </div>
            </div>
          </div>

          <hr class="section-divider" />

          <div class="form-section agenda-info-section">
            <div class="agenda-info">
              <div class="agenda-info-icon">
                <i class="pi pi-calendar"></i>
              </div>
              <div>
                <h3>Permissões da agenda</h3>
                <p>
                  A permissão individual de cada profissional é configurada na gestão
                  de colaboradores e só tem efeito quando a autonomia abaixo estiver
                  ativada. Administradores e secretários seguem as regras do sistema.
                </p>

                <label class="autonomia-toggle" for="autonomia_agenda">
                  <input
                    id="autonomia_agenda"
                    v-model="form.profissionais_podem_editar_agenda"
                    type="checkbox"
                  />
                  <span>
                    Permitir que profissionais com permissão individual editem a
                    própria agenda
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <span class="required-note"><span>*</span> Campos obrigatórios</span>
            <button class="btn-salvar" type="submit" :disabled="loading">
              <i :class="loading ? 'pi pi-spin pi-spinner' : 'pi pi-save'"></i>
              <span>{{ loading ? "Salvando..." : "Salvar configurações" }}</span>
            </button>
          </div>
        </form>
      </section>
    </main>

    <Transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <i
          :class="
            toast.type === 'error' ? 'pi pi-exclamation-circle' : 'pi pi-check-circle'
          "
        ></i>
        <span>{{ toast.message }}</span>
        <button type="button" aria-label="Fechar notificação" @click="toast.show = false">
          <i class="pi pi-times"></i>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useAuthStore } from "@/store/auth";
import {
  atualizarAutonomiaAgenda,
  atualizarClinicaAtual,
  obterClinicaAtual,
} from "@/services/conta";

const authStore = useAuthStore();

const loading = ref(false);
const carregandoClinica = ref(false);
const autonomiaOriginal = ref(false);

const form = reactive({
  razao_social: "",
  nome_fantasia: "",
  cnpj: "",
  telefone: "",
  endereco: "",
  profissionais_podem_editar_agenda: false,
});

const erros = reactive({
  razao_social: "",
  nome_fantasia: "",
  cnpj: "",
  telefone: "",
  endereco: "",
});

const toast = reactive({
  show: false,
  message: "",
  type: "success",
});

let toastTimer = null;

const cnpjNumeros = computed(() => form.cnpj.replace(/\D/g, ""));
const telefoneNumeros = computed(() => form.telefone.replace(/\D/g, ""));

function dispararToast(message, type = "success") {
  clearTimeout(toastTimer);
  toast.message = message;
  toast.type = type;
  toast.show = true;

  toastTimer = setTimeout(() => {
    toast.show = false;
  }, 3500);
}

function formatarCNPJ() {
  const numeros = form.cnpj.replace(/\D/g, "").slice(0, 14);

  let valor = numeros;

  if (numeros.length > 2) {
    valor = `${numeros.slice(0, 2)}.${numeros.slice(2)}`;
  }

  if (numeros.length > 5) {
    valor = `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5)}`;
  }

  if (numeros.length > 8) {
    valor = `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(
      5,
      8
    )}/${numeros.slice(8)}`;
  }

  if (numeros.length > 12) {
    valor = `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(
      5,
      8
    )}/${numeros.slice(8, 12)}-${numeros.slice(12)}`;
  }

  form.cnpj = valor;
  erros.cnpj = "";
}

function formatarTelefone() {
  const numeros = form.telefone.replace(/\D/g, "").slice(0, 11);

  if (numeros.length <= 2) {
    form.telefone = numeros ? `(${numeros}` : "";
  } else if (numeros.length <= 6) {
    form.telefone = `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  } else if (numeros.length <= 10) {
    form.telefone = `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  } else {
    form.telefone = `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
  }

  erros.telefone = "";
}

function cnpjValido(valor) {
  const cnpj = valor.replace(/\D/g, "");

  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) {
    return false;
  }

  const calcularDigito = (base, pesos) => {
    const soma = base
      .split("")
      .reduce((total, digito, index) => total + Number(digito) * pesos[index], 0);

    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const primeiroDigito = calcularDigito(cnpj.slice(0, 12), [
    5,
    4,
    3,
    2,
    9,
    8,
    7,
    6,
    5,
    4,
    3,
    2,
  ]);

  const segundoDigito = calcularDigito(cnpj.slice(0, 12) + primeiroDigito, [
    6,
    5,
    4,
    3,
    2,
    9,
    8,
    7,
    6,
    5,
    4,
    3,
    2,
  ]);

  return Number(cnpj[12]) === primeiroDigito && Number(cnpj[13]) === segundoDigito;
}

function validarFormulario() {
  Object.keys(erros).forEach((campo) => {
    erros[campo] = "";
  });

  if (form.razao_social.trim().length < 3) {
    erros.razao_social = "Informe uma razão social com pelo menos 3 caracteres.";
  }

  if (form.nome_fantasia.trim().length < 2) {
    erros.nome_fantasia = "Informe um nome fantasia válido.";
  }

  if (!cnpjValido(form.cnpj)) {
    erros.cnpj = "Informe um CNPJ válido.";
  }

  const telefone = telefoneNumeros.value;

  if ((telefone.length !== 10 && telefone.length !== 11) || /^(\d)\1+$/.test(telefone)) {
    erros.telefone = "Informe um telefone válido com DDD.";
  }

  if (form.endereco.trim().length > 255) {
    erros.endereco = "O endereço deve ter no máximo 255 caracteres.";
  }

  return !Object.values(erros).some(Boolean);
}

function preencherFormulario(dados) {
  form.razao_social = dados.razao_social || "";
  form.nome_fantasia = dados.nome_fantasia || "";
  form.cnpj = dados.cnpj || "";
  form.telefone = dados.telefone || "";
  form.endereco = dados.endereco || "";
  form.profissionais_podem_editar_agenda = Boolean(
    dados.profissionais_podem_editar_agenda
  );
  autonomiaOriginal.value = form.profissionais_podem_editar_agenda;

  formatarCNPJ();
  formatarTelefone();
}

function primeiroErro(valor) {
  if (Array.isArray(valor)) return String(valor[0] || "");

  return typeof valor === "string" ? valor : "";
}

function mensagemDaApi(erro, padrao) {
  if (!erro?.response) {
    return "Não foi possível falar com o servidor. Tente novamente.";
  }

  if (erro.response.status === 403) {
    return "Somente administradores podem alterar as configurações da clínica.";
  }

  if (typeof erro.response.data?.detail === "string") {
    return erro.response.data.detail;
  }

  return padrao;
}

async function carregarClinica() {
  carregandoClinica.value = true;

  try {
    preencherFormulario(await obterClinicaAtual());
  } catch (erro) {
    dispararToast(
      mensagemDaApi(erro, "Não foi possível carregar os dados da clínica."),
      "error"
    );
  } finally {
    carregandoClinica.value = false;
  }
}

async function salvarClinica() {
  if (!validarFormulario()) {
    dispararToast("Revise os campos destacados antes de continuar.", "error");
    return;
  }

  loading.value = true;

  try {
    const atualizada = await atualizarClinicaAtual({
      razao_social: form.razao_social.trim(),
      nome_fantasia: form.nome_fantasia.trim(),
      cnpj: cnpjNumeros.value,
      telefone: telefoneNumeros.value,
      endereco: form.endereco.trim(),
    });

    let autonomia = autonomiaOriginal.value;

    if (form.profissionais_podem_editar_agenda !== autonomiaOriginal.value) {
      const resposta = await atualizarAutonomiaAgenda(
        form.profissionais_podem_editar_agenda
      );

      autonomia = Boolean(resposta.profissionais_podem_editar_agenda);
    }

    const dadosFinais = {
      ...atualizada,
      profissionais_podem_editar_agenda: autonomia,
    };

    preencherFormulario(dadosFinais);
    authStore.atualizarClinicaAtiva(dadosFinais);
    dispararToast("Configurações da clínica salvas com sucesso.");
  } catch (erro) {
    const dados = erro?.response?.data || {};

    Object.keys(erros).forEach((campo) => {
      erros[campo] = primeiroErro(dados[campo]);
    });

    dispararToast(
      mensagemDaApi(erro, "Não foi possível salvar. Revise os campos."),
      "error"
    );
  } finally {
    loading.value = false;
  }
}

onMounted(carregarClinica);

onBeforeUnmount(() => {
  clearTimeout(toastTimer);
});
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.page-content {
  width: min(100%, 1200px);
  padding: 0 24px;
}

.icon-circle {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  color: var(--cor-primaria, #1ca4a7);
  background: rgba(28, 164, 167, 0.1);
}

.cards-section-container {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 17px;
  background: #fff;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.035);
  animation: enter-up 0.5s 0.06s ease both;
}

.settings-form {
  display: flex;
  flex-direction: column;
}

.form-section {
  padding: 27px 30px;
}

.section-divider {
  height: 1px;
  margin: 0;
  border: 0;
  background: #edf1f5;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.icon-circle {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  font-size: 19px;
}

.section-titles h2 {
  margin: 0 0 5px;
  color: #0f172a;
  font-size: 16px;
  font-weight: 750;
}

.section-titles p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.form-group {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
}

.full-width {
  grid-column: 1 / -1;
}

.form-label {
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

.required {
  color: #ef4444;
}

.form-control {
  width: 100%;
  min-width: 0;
  height: 45px;
  padding: 0 14px;
  border: 1px solid #d8e0e9;
  border-radius: 10px;
  outline: none;
  background: #f8fafc;
  color: #0f172a;
  font-family: inherit;
  font-size: 14px;
  transition: border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
}

.form-control:hover {
  border-color: #aebfcb;
}

.form-control:focus {
  border-color: var(--cor-primaria, #1ca4a7);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.11);
}

.form-control.has-error {
  border-color: #ef4444;
  background: #fffafa;
}

.form-control.has-error:focus {
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.09);
}

.form-textarea {
  height: auto;
  min-height: 100px;
  padding: 13px 14px;
  line-height: 1.6;
  resize: vertical;
}

.textarea-footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.field-hint,
.error-message {
  font-size: 11px;
  line-height: 1.5;
}

.field-hint {
  color: #94a3b8;
}

.error-message {
  color: #dc2626;
  animation: enter-up 0.18s ease both;
}

.character-count {
  flex-shrink: 0;
  color: #94a3b8;
  font-size: 11px;
}

.agenda-info-section {
  padding-top: 22px;
  padding-bottom: 22px;
}

.agenda-info {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 17px 18px;
  border: 1px solid #dceff0;
  border-radius: 12px;
  background: #f7fcfc;
}

.agenda-info-icon {
  display: grid;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 11px;
  background: rgba(28, 164, 167, 0.1);
  color: var(--cor-primaria, #1ca4a7);
  font-size: 17px;
}

.agenda-info h3 {
  margin: 1px 0 6px;
  color: #164e52;
  font-size: 13px;
  font-weight: 750;
}

.agenda-info p {
  margin: 0;
  color: #537477;
  font-size: 12px;
  line-height: 1.7;
}

.autonomia-toggle {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 14px;
  color: #164e52;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
  cursor: pointer;
}

.autonomia-toggle input {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  flex-shrink: 0;
  accent-color: var(--cor-primaria, #1ca4a7);
  cursor: pointer;
}

.load-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 18px 30px 0;
  color: #64748b;
  font-size: 12px;
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 20px 30px;
  border-top: 1px solid #edf1f5;
  background: #fcfdfe;
}

.required-note {
  color: #64748b;
  font-size: 11px;
}

.required-note span {
  color: #ef4444;
}

.btn-salvar {
  display: inline-flex;
  min-height: 43px;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 0 19px;
  border: 0;
  border-radius: 10px;
  background: var(--cor-primaria, #1ca4a7);
  color: #fff;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.16);
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.btn-salvar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 7px 18px rgba(28, 164, 167, 0.24);
}

.btn-salvar:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.btn-salvar:disabled {
  opacity: 0.7;
  cursor: wait;
}

.toast-notification {
  position: fixed;
  z-index: 1000;
  right: 24px;
  bottom: 24px;
  display: flex;
  max-width: min(440px, calc(100vw - 32px));
  align-items: center;
  gap: 12px;
  padding: 15px 17px;
  border: 1px solid #dbe7e8;
  border-radius: 13px;
  background: #fff;
  color: #334155;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.13);
  font-size: 13px;
}

.toast-notification > i {
  color: #16a3a5;
  font-size: 18px;
}

.toast-notification.error > i {
  color: #dc2626;
}

.toast-notification button {
  margin-left: 8px;
  padding: 4px;
  border: 0;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@keyframes enter-up {
  from {
    opacity: 0;
    transform: translateY(9px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 640px) {
  .page-content {
    padding: 0 14px;
  }

  .form-section {
    padding: 22px 18px;
  }

  .form-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }

  .full-width {
    grid-column: auto;
  }

  .form-actions {
    align-items: stretch;
    flex-direction: column;
    padding: 18px;
  }

  .btn-salvar {
    width: 100%;
  }

  .agenda-info {
    padding: 14px;
  }

  .toast-notification {
    right: 12px;
    bottom: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>  