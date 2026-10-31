<template>
  <div class="page-container">
    <main class="page-content">
      <section class="profile-card">
        <div class="card-heading">
          <div class="section-icon">
            <i class="pi pi-id-card"></i>
          </div>
          <div>
            <h2>Dados pessoais</h2>
            <p>Mantenha seus dados cadastrais atualizados.</p>
          </div>
        </div>

        <form class="profile-form" novalidate @submit.prevent="validarFormulario">
          <p v-if="carregandoPerfil" class="load-note" role="status">
            <i class="pi pi-spin pi-spinner"></i> Carregando seus dados...
          </p>

          <div class="form-grid">
            <div class="form-group full-width">
              <label for="nome_completo">Nome completo <span>*</span></label>
              <input
                id="nome_completo"
                v-model="form.nome_completo"
                class="form-control"
                :class="{ 'has-error': erros.nome_completo }"
                type="text"
                maxlength="255"
                autocomplete="name"
                placeholder="Digite seu nome completo"
                @input="erros.nome_completo = ''"
              />
              <small v-if="erros.nome_completo" class="error-message">
                {{ erros.nome_completo }}
              </small>
            </div>

            <div class="form-group">
              <label for="cpf">CPF</label>
              <div class="input-with-icon">
                <i class="pi pi-lock"></i>
                <input
                  id="cpf"
                  class="form-control readonly-control"
                  type="text"
                  :value="cpfExibicao"
                  readonly
                  placeholder="CPF não informado"
                />
              </div>
              <small class="field-hint">O CPF não pode ser alterado nesta tela.</small>
            </div>

            <div class="form-group">
              <label for="data_nascimento">Data de nascimento <span>*</span></label>
              <input
                id="data_nascimento"
                v-model="form.data_nascimento"
                class="form-control"
                :class="{ 'has-error': erros.data_nascimento }"
                type="date"
                min="1900-01-01"
                :max="dataHoje"
                @change="validarDataNascimento"
                @blur="validarDataNascimento"
              />
              <small v-if="erros.data_nascimento" class="error-message">
                {{ erros.data_nascimento }}
              </small>
              <small v-else class="field-hint">Informe uma data válida, sem datas futuras.</small>
            </div>

            <div class="form-group full-width">
              <label for="telefone">Telefone</label>
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
                @input="atualizarTelefone"
              />
              <small v-if="erros.telefone" class="error-message">
                {{ erros.telefone }}
              </small>
              <small v-else class="field-hint">Informe um telefone com DDD.</small>
            </div>
          </div>

          <div class="form-footer">
            <span class="required-note"><span>*</span> Campos obrigatórios</span>
            <button class="btn-save" type="submit" :disabled="loading">
              <i :class="loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'"></i>
              {{ loading ? "Salvando..." : "Salvar alterações" }}
            </button>
          </div>
        </form>
      </section>

      <section class="profile-card security-card">
        <div class="card-heading">
          <div class="section-icon">
            <i class="pi pi-shield"></i>
          </div>
          <div>
            <h2>Segurança</h2>
            <p>Altere sua senha de acesso. As demais sessões abertas serão encerradas.</p>
          </div>
        </div>

        <form class="profile-form" novalidate @submit.prevent="alterarSenhaUsuario">
          <div class="form-grid">
            <div class="form-group full-width">
              <label for="senha_atual">Senha atual <span>*</span></label>
              <input
                id="senha_atual"
                v-model="senhas.atual"
                class="form-control"
                :class="{ 'has-error': errosSenha.atual }"
                type="password"
                autocomplete="current-password"
                @input="errosSenha.atual = ''"
              />
              <small v-if="errosSenha.atual" class="error-message">
                {{ errosSenha.atual }}
              </small>
            </div>

            <div class="form-group">
              <label for="nova_senha">Nova senha <span>*</span></label>
              <input
                id="nova_senha"
                v-model="senhas.nova"
                class="form-control"
                :class="{ 'has-error': errosSenha.nova }"
                type="password"
                autocomplete="new-password"
                @input="errosSenha.nova = ''"
              />
              <small v-if="errosSenha.nova" class="error-message">
                {{ errosSenha.nova }}
              </small>
              <small v-else class="field-hint">Mínimo de 8 caracteres.</small>
            </div>

            <div class="form-group">
              <label for="confirmar_senha">Confirmar nova senha <span>*</span></label>
              <input
                id="confirmar_senha"
                v-model="senhas.confirmacao"
                class="form-control"
                :class="{ 'has-error': errosSenha.confirmacao }"
                type="password"
                autocomplete="new-password"
                @input="errosSenha.confirmacao = ''"
              />
              <small v-if="errosSenha.confirmacao" class="error-message">
                {{ errosSenha.confirmacao }}
              </small>
            </div>
          </div>

          <div class="form-footer">
            <span class="required-note"><span>*</span> Campos obrigatórios</span>
            <button class="btn-save" type="submit" :disabled="salvandoSenha">
              <i :class="salvandoSenha ? 'pi pi-spin pi-spinner' : 'pi pi-key'"></i>
              {{ salvandoSenha ? "Alterando..." : "Alterar senha" }}
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
import { alterarSenha, atualizarPerfil, obterPerfil } from "@/services/conta";

const authStore = useAuthStore();

const loading = ref(false);
const carregandoPerfil = ref(false);
const salvandoSenha = ref(false);
const cpfExibicao = ref("");
const erros = reactive({
  nome_completo: "",
  data_nascimento: "",
  telefone: "",
});

const form = reactive({
  nome_completo: "",
  cpf: "",
  data_nascimento: "",
  telefone: "",
});

const senhas = reactive({
  atual: "",
  nova: "",
  confirmacao: "",
});

const errosSenha = reactive({
  atual: "",
  nova: "",
  confirmacao: "",
});

const toast = reactive({
  show: false,
  message: "",
  type: "success",
});

let toastTimer = null;

const dataHoje = computed(() => {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
});

function dispararToast(message, type = "success") {
  clearTimeout(toastTimer);
  toast.message = message;
  toast.type = type;
  toast.show = true;

  toastTimer = setTimeout(() => {
    toast.show = false;
  }, 3500);
}

function formatarCpf(valor) {
  const numeros = String(valor || "").replace(/\D/g, "").slice(0, 11);

  if (numeros.length !== 11) return numeros;

  return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`;
}

function formatarTelefone(valor) {
  const numeros = String(valor || "").replace(/\D/g, "").slice(0, 11);

  if (!numeros) return "";

  if (numeros.length <= 2) return `(${numeros}`;
  if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }

  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

function preencherFormulario(dados) {
  form.nome_completo = dados.nome_completo || "";
  form.cpf = dados.cpf || "";
  form.data_nascimento = dados.data_nascimento || "";
  form.telefone = formatarTelefone(dados.telefone);
  cpfExibicao.value = formatarCpf(dados.cpf);
}

function mensagemDaApi(erro, padrao) {
  const dados = erro?.response?.data;

  if (!erro?.response) {
    return "Não foi possível falar com o servidor. Tente novamente.";
  }

  if (typeof dados?.detail === "string") return dados.detail;

  return padrao;
}

function primeiroErro(valor) {
  if (Array.isArray(valor)) return String(valor[0] || "");

  return typeof valor === "string" ? valor : "";
}

async function carregarPerfil() {
  carregandoPerfil.value = true;

  try {
    preencherFormulario(await obterPerfil());
  } catch (erro) {
    dispararToast(
      mensagemDaApi(erro, "Não foi possível carregar seus dados."),
      "error"
    );
  } finally {
    carregandoPerfil.value = false;
  }
}

function validarDataReal(valor) {
  if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }

  const [ano, mes, dia] = valor.split("-").map(Number);

  if (ano < 1900 || ano > new Date().getFullYear()) {
    return false;
  }

  const data = new Date(Date.UTC(ano, mes - 1, dia));

  return (
    data.getUTCFullYear() === ano &&
    data.getUTCMonth() === mes - 1 &&
    data.getUTCDate() === dia &&
    valor < dataHoje.value
  );
}

function validarDataNascimento() {
  if (!form.data_nascimento) {
    erros.data_nascimento = "Informe sua data de nascimento.";
    return false;
  }

  if (!validarDataReal(form.data_nascimento)) {
    erros.data_nascimento = "Informe uma data real entre 01/01/1900 e ontem.";
    form.data_nascimento = "";
    return false;
  }

  erros.data_nascimento = "";
  return true;
}

function atualizarTelefone() {
  form.telefone = formatarTelefone(form.telefone);
  erros.telefone = "";
}

async function validarFormulario() {
  erros.nome_completo = "";
  erros.telefone = "";

  const nome = form.nome_completo.trim();
  const nomeValido = /^[\p{L}\p{M}\s'.-]+$/u.test(nome) && nome.length >= 3;

  if (!nomeValido) {
    erros.nome_completo = "Informe um nome válido com pelo menos 3 caracteres.";
  }

  const dataValida = validarDataNascimento();
  const telefoneNumeros = form.telefone.replace(/\D/g, "");
  let telefoneValido = true;

  if (telefoneNumeros && (telefoneNumeros.length < 10 || telefoneNumeros.length > 11)) {
    erros.telefone = "Informe um telefone com DDD e número válido.";
    telefoneValido = false;
  } else if (telefoneNumeros && /^(\d)\1+$/.test(telefoneNumeros)) {
    erros.telefone = "Informe um telefone válido.";
    telefoneValido = false;
  }

  if (!nomeValido || !dataValida || !telefoneValido) {
    dispararToast("Revise os campos destacados antes de continuar.", "error");
    return;
  }

  loading.value = true;

  try {
    const atualizado = await atualizarPerfil({
      nome_completo: nome,
      data_nascimento: form.data_nascimento,
      telefone: telefoneNumeros,
    });

    preencherFormulario(atualizado);
    authStore.atualizarUsuario(atualizado);
    dispararToast("Dados atualizados com sucesso.");
  } catch (erro) {
    const dados = erro?.response?.data || {};

    erros.nome_completo = primeiroErro(dados.nome_completo);
    erros.data_nascimento = primeiroErro(dados.data_nascimento);
    erros.telefone = primeiroErro(dados.telefone);

    dispararToast(
      mensagemDaApi(erro, "Não foi possível salvar os dados. Revise os campos."),
      "error"
    );
  } finally {
    loading.value = false;
  }
}

async function alterarSenhaUsuario() {
  errosSenha.atual = "";
  errosSenha.nova = "";
  errosSenha.confirmacao = "";

  if (!senhas.atual) {
    errosSenha.atual = "Informe sua senha atual.";
  }

  if (senhas.nova.length < 8) {
    errosSenha.nova = "A nova senha deve ter pelo menos 8 caracteres.";
  } else if (senhas.nova === senhas.atual) {
    errosSenha.nova = "A nova senha deve ser diferente da atual.";
  }

  if (senhas.confirmacao !== senhas.nova) {
    errosSenha.confirmacao = "A confirmação não confere com a nova senha.";
  }

  if (errosSenha.atual || errosSenha.nova || errosSenha.confirmacao) {
    dispararToast("Revise os campos destacados antes de continuar.", "error");
    return;
  }

  salvandoSenha.value = true;

  try {
    const resposta = await alterarSenha({
      senha_atual: senhas.atual,
      nova_senha: senhas.nova,
    });

    authStore.salvarTokens(resposta.access, resposta.refresh);

    senhas.atual = "";
    senhas.nova = "";
    senhas.confirmacao = "";

    dispararToast("Senha alterada com sucesso.");
  } catch (erro) {
    const dados = erro?.response?.data || {};

    errosSenha.atual = primeiroErro(dados.senha_atual);
    errosSenha.nova = primeiroErro(dados.nova_senha);

    dispararToast(
      mensagemDaApi(erro, "Não foi possível alterar a senha. Revise os campos."),
      "error"
    );
  } finally {
    salvandoSenha.value = false;
  }
}

onMounted(carregarPerfil);

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
  width: min(100%, 1100px);
  padding: 0 24px;
}

.section-icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  color: var(--cor-primaria, #1ca4a7);
  background: rgba(28, 164, 167, 0.1);
}

.profile-card {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 17px;
  background: #fff;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.035);
  animation: enter-up 0.5s 0.06s ease both;
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 25px 30px;
  border-bottom: 1px solid #edf1f5;
}

.section-icon {
  width: 44px;
  height: 44px;
  border-radius: 13px;
  font-size: 19px;
}

.card-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: 16px;
  font-weight: 750;
}

.card-heading p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.security-card {
  margin-top: 24px;
}

.load-note {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 18px;
  color: #64748b;
  font-size: 12px;
}

.profile-form {
  padding: 28px 30px 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 23px 22px;
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

.form-group label {
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

.form-group label span,
.required-note span {
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
  transition: border-color 0.22s ease, box-shadow 0.22s ease, background 0.22s ease,
    transform 0.22s ease;
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

.readonly-control {
  padding-left: 39px;
  background: #f1f5f9;
  color: #64748b;
  cursor: not-allowed;
}

.input-with-icon {
  position: relative;
}

.input-with-icon > i {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 14px;
  color: #94a3b8;
  font-size: 13px;
  transform: translateY(-50%);
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

.form-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin: 30px -30px 0;
  padding: 20px 30px;
  border-top: 1px solid #edf1f5;
  background: #fcfdfe;
}

.required-note {
  color: #64748b;
  font-size: 11px;
}

.btn-save {
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
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease,
    background 0.2s ease;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 7px 18px rgba(28, 164, 167, 0.24);
}

.btn-save:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.btn-save:disabled {
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

  .card-heading {
    padding: 21px 18px;
  }

  .profile-form {
    padding: 23px 18px 0;
  }

  .form-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }

  .full-width {
    grid-column: auto;
  }

  .form-footer {
    align-items: stretch;
    flex-direction: column;
    margin: 25px -18px 0;
    padding: 18px;
  }

  .btn-save {
    width: 100%;
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