<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useAuthStore } from '@/store'

const emit = defineEmits(['close'])

const router = useRouter()
const authStore = useAuthStore()

const step = ref(1)
const visible = ref(false)
const isLoading = ref(false)
const erroLogin = ref('')
const mensagemSucesso = ref('')
const cadastroConcluido = ref(false)
const cpf = ref('')
const senha = ref('')
const mostrarSenha = ref(false)
const clinicaSelecionadaId = ref('')

const novaClinica = ref({
  nome_completo: '',
  data_nascimento: '',
  cnpj: '',
  razao_social: '',
  nome_fantasia: '',
  telefone: '',
  profissionais_podem_editar_agenda: false,
})

const vinculos = computed(() => authStore.vinculos || [])

const dataMaximaNascimento = computed(() => {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
})

const cpfFormatado = computed({
  get: () => formatarCPF(cpf.value),
  set: (valor) => {
    cpf.value = String(valor || '').replace(/\D/g, '').slice(0, 11)
  },
})

const cnpjFormatado = computed({
  get: () => formatarCNPJ(novaClinica.value.cnpj),
  set: (valor) => {
    novaClinica.value.cnpj = String(valor || '').replace(/\D/g, '').slice(0, 14)
  },
})

const telefoneFormatado = computed({
  get: () => formatarTelefone(novaClinica.value.telefone),
  set: (valor) => {
    novaClinica.value.telefone = String(valor || '').replace(/\D/g, '').slice(0, 11)
  },
})

function formatarCPF(valor) {
  const numeros = String(valor || '').replace(/\D/g, '').slice(0, 11)
  return numeros
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

function formatarCNPJ(valor) {
  const numeros = String(valor || '').replace(/\D/g, '').slice(0, 14)
  return numeros
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function formatarTelefone(valor) {
  const numeros = String(valor || '').replace(/\D/g, '').slice(0, 11)

  if (numeros.length <= 10) {
    return numeros
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
  }

  return numeros
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

function limparMensagens() {
  erroLogin.value = ''
  mensagemSucesso.value = ''
}

function fecharModal() {
  if (isLoading.value) return

  visible.value = false
  window.setTimeout(() => emit('close'), 180)
}

function tratarTeclaEscape(event) {
  if (event.key === 'Escape' && !isLoading.value) {
    fecharModal()
  }
}

function validarCPF(valor) {
  const numeros = String(valor || '').replace(/\D/g, '')

  if (numeros.length !== 11 || /^(\d)\1{10}$/.test(numeros)) {
    return false
  }

  let soma = 0

  for (let i = 0; i < 9; i++) {
    soma += Number(numeros[i]) * (10 - i)
  }

  let digito = (soma * 10) % 11
  if (digito === 10) digito = 0
  if (digito !== Number(numeros[9])) return false

  soma = 0

  for (let i = 0; i < 10; i++) {
    soma += Number(numeros[i]) * (11 - i)
  }

  digito = (soma * 10) % 11
  if (digito === 10) digito = 0

  return digito === Number(numeros[10])
}

function validarCNPJ(valor) {
  const numeros = String(valor || '').replace(/\D/g, '')

  if (numeros.length !== 14 || /^(\d)\1{13}$/.test(numeros)) {
    return false
  }

  const calcularDigito = (base, pesos) => {
    const soma = base
      .split('')
      .reduce(
        (total, numero, indice) => total + Number(numero) * pesos[indice],
        0,
      )

    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }

  const primeiro = calcularDigito(
    numeros.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  )

  const segundo = calcularDigito(
    numeros.slice(0, 12) + primeiro,
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2],
  )

  return numeros.endsWith(`${primeiro}${segundo}`)
}

async function handleLogin() {
  limparMensagens()

  if (!validarCPF(cpf.value)) {
    erroLogin.value = 'Informe um CPF válido.'
    return
  }

  if (!senha.value) {
    erroLogin.value = 'Informe sua senha.'
    return
  }

  isLoading.value = true

  try {
    await authStore.login(cpf.value, senha.value)

    if (vinculos.value.length === 1) {
      await abrirSistema(vinculos.value[0].clinica_id)
      return
    }

    clinicaSelecionadaId.value = authStore.clinicaAtivaId || ''

    step.value = 2

    if (!vinculos.value.length) {
      mensagemSucesso.value =
        'Seu acesso foi validado. Você pode cadastrar uma clínica para começar.'
    }
  } catch (error) {
    erroLogin.value =
      error.message || 'Não foi possível entrar. Verifique suas credenciais.'
  } finally {
    isLoading.value = false
  }
}

async function abrirSistema(clinicaId) {
  limparMensagens()

  try {
    await authStore.setClinicaAtiva(clinicaId)
    visible.value = false
    await router.replace('/app/dashboard')
    window.setTimeout(() => emit('close'), 180)
  } catch (error) {
    erroLogin.value =
      error.message || 'Não foi possível acessar essa clínica.'
    visible.value = true
  }
}

async function selecionarClinica() {
  if (!clinicaSelecionadaId.value) {
    erroLogin.value = 'Selecione uma clínica para continuar.'
    return
  }

  await abrirSistema(clinicaSelecionadaId.value)
}

function abrirCadastroClinica() {
  limparMensagens()
  cadastroConcluido.value = false
  step.value = 3
}

function voltarParaLogin() {
  limparMensagens()
  step.value = 1
}

function voltarParaClinicas() {
  limparMensagens()
  step.value = 2
}

async function handleCriarClinica() {
  limparMensagens()

  const dados = novaClinica.value
  const cpfLimpo = String(cpf.value || '').replace(/\D/g, '')
  const cnpjLimpo = String(dados.cnpj || '').replace(/\D/g, '')
  const telefoneLimpo = String(dados.telefone || '').replace(/\D/g, '')

  if (!validarCPF(cpfLimpo)) {
    erroLogin.value = 'Informe um CPF válido no campo de login.'
    return
  }

  if (!dados.nome_completo.trim()) {
    erroLogin.value = 'Informe seu nome completo.'
    return
  }

  if (!dados.data_nascimento) {
    erroLogin.value = 'Informe sua data de nascimento.'
    return
  }

  if (dados.data_nascimento > dataMaximaNascimento.value) {
    erroLogin.value = 'A data de nascimento não pode ser futura.'
    return
  }

  if (!senha.value) {
    erroLogin.value = 'Informe a senha que será usada para entrar.'
    return
  }

  if (!validarCNPJ(cnpjLimpo)) {
    erroLogin.value = 'Informe um CNPJ válido.'
    return
  }

  if (!dados.razao_social.trim()) {
    erroLogin.value = 'Informe a razão social.'
    return
  }

  if (!dados.nome_fantasia.trim()) {
    erroLogin.value = 'Informe o nome fantasia.'
    return
  }

  if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
    erroLogin.value = 'Informe um telefone válido com DDD.'
    return
  }

  isLoading.value = true

  try {
    const cadastro = await authStore.criarClinica({
      cpf: cpfLimpo,
      password: senha.value,
      nome_completo: dados.nome_completo.trim(),
      data_nascimento: dados.data_nascimento,
      cnpj: cnpjLimpo,
      razao_social: dados.razao_social.trim(),
      nome_fantasia: dados.nome_fantasia.trim(),
      telefone: telefoneLimpo,
      profissionais_podem_editar_agenda: Boolean(
        dados.profissionais_podem_editar_agenda,
      ),
    })

    cadastroConcluido.value = true
    mensagemSucesso.value =
      'Clínica criada com sucesso. Estamos entrando na sua conta.'

    try {
      await authStore.login(cpfLimpo, senha.value)

      const novoVinculo = authStore.vinculos.find(
        (vinculo) =>
          String(vinculo.clinica_id) === String(cadastro.clinica_id),
      )

      if (novoVinculo) {
        await abrirSistema(novoVinculo.clinica_id)
        return
      }

      step.value = 2
      mensagemSucesso.value =
        'Clínica criada. Se ela não aparecer na lista, entre novamente ou contate o suporte.'
    } catch {
      step.value = 1
      mensagemSucesso.value =
        'A clínica foi criada, mas não foi possível entrar automaticamente. Faça login com seu CPF e senha; não é necessário cadastrar a clínica novamente.'
    }
  } catch (error) {
    erroLogin.value =
      error.message ||
      'Não foi possível criar a clínica. Verifique os dados informados.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  window.setTimeout(() => {
    visible.value = true
  }, 20)

  window.addEventListener('keydown', tratarTeclaEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', tratarTeclaEscape)
})
</script>

<template>
  <div
    class="login-modal-overlay"
    @mousedown.self="!isLoading && fecharModal()"
  >
    <Transition name="modal">
      <section
        v-if="visible"
        class="login-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <button
          class="modal-close"
          type="button"
          aria-label="Fechar"
          :disabled="isLoading"
          @click="fecharModal"
        >
          <i class="pi pi-times" />
        </button>

        <div class="modal-brand">
          <div class="brand-mark">
            <i class="pi pi-building" />
          </div>
          <span>OneClinic</span>
        </div>

        <div class="modal-heading">
          <span class="eyebrow">
            {{
              step === 1
                ? 'BEM-VINDO DE VOLTA'
                : step === 2
                  ? 'SEU ESPAÇO DE TRABALHO'
                  : 'COMECE SUA JORNADA'
            }}
          </span>

          <h2 id="login-modal-title">
            {{
              step === 1
                ? 'Acesse sua conta'
                : step === 2
                  ? 'Escolha sua clínica'
                  : 'Cadastre sua clínica'
            }}
          </h2>

          <p>
            {{
              step === 1
                ? 'Entre para gerenciar sua rotina com mais tranquilidade.'
                : step === 2
                  ? 'Selecione onde deseja continuar ou crie uma nova clínica.'
                  : 'Preencha os dados para configurar seu espaço de trabalho.'
            }}
          </p>
        </div>

        <div class="step-indicator" aria-label="Etapas do acesso">
          <span :class="{ active: step >= 1, current: step === 1 }" />
          <span :class="{ active: step >= 2, current: step === 2 }" />
          <span :class="{ active: step >= 3, current: step === 3 }" />
        </div>

        <Transition name="step" mode="out-in">
          <form
            v-if="step === 1"
            key="login"
            class="modal-form"
            @submit.prevent="handleLogin"
          >
            <label class="field-label" for="login-cpf">CPF</label>

            <div class="input-wrap">
              <i class="pi pi-id-card" />
              <input
                id="login-cpf"
                v-model="cpfFormatado"
                type="text"
                inputmode="numeric"
                autocomplete="username"
                placeholder="000.000.000-00"
                maxlength="14"
                :disabled="isLoading"
              >
            </div>

            <label class="field-label" for="login-password">Senha</label>

            <div class="input-wrap">
              <i class="pi pi-lock" />
              <input
                id="login-password"
                v-model="senha"
                :type="mostrarSenha ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Digite sua senha"
                :disabled="isLoading"
              >

              <button
                class="password-toggle"
                type="button"
                :aria-label="mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'"
                @click="mostrarSenha = !mostrarSenha"
              >
                <i :class="mostrarSenha ? 'pi pi-eye-slash' : 'pi pi-eye'" />
              </button>
            </div>

            <p v-if="erroLogin" class="feedback error" role="alert">
              <i class="pi pi-exclamation-circle" />
              {{ erroLogin }}
            </p>

            <p v-if="mensagemSucesso" class="feedback success" role="status">
              <i class="pi pi-check-circle" />
              {{ mensagemSucesso }}
            </p>

            <Button
              type="submit"
              class="primary-action"
              :loading="isLoading"
              :disabled="isLoading"
              label="Entrar na plataforma"
              icon="pi pi-arrow-right"
              icon-pos="right"
            />

            <div class="form-divider"><span>ou</span></div>

            <button
              class="text-action"
              type="button"
              :disabled="isLoading"
              @click="abrirCadastroClinica"
            >
              Criar uma clínica
              <i class="pi pi-arrow-up-right" />
            </button>
          </form>

          <form
            v-else-if="step === 2"
            key="clinicas"
            class="modal-form"
            @submit.prevent="selecionarClinica"
          >
            <div v-if="vinculos.length" class="clinic-list">
              <button
                v-for="vinculo in vinculos"
                :key="vinculo.clinica_id"
                class="clinic-option"
                :class="{
                  selected:
                    String(clinicaSelecionadaId) ===
                    String(vinculo.clinica_id),
                }"
                type="button"
                @click="
                  clinicaSelecionadaId = String(vinculo.clinica_id);
                  limparMensagens()
                "
              >
                <span class="clinic-icon">
                  <i class="pi pi-building" />
                </span>

                <span class="clinic-info">
                  <strong>{{ vinculo.clinica_nome }}</strong>
                  <small>{{ vinculo.role }}</small>
                </span>

                <i class="pi pi-check-circle clinic-check" />
              </button>
            </div>

            <div v-else class="empty-clinics">
              <div class="empty-icon">
                <i class="pi pi-building" />
              </div>

              <strong>Nenhuma clínica vinculada</strong>

              <p>
                Você pode cadastrar uma clínica para começar a usar a
                plataforma.
              </p>
            </div>

            <p v-if="erroLogin" class="feedback error" role="alert">
              <i class="pi pi-exclamation-circle" />
              {{ erroLogin }}
            </p>

            <p v-if="mensagemSucesso" class="feedback success" role="status">
              <i class="pi pi-check-circle" />
              {{ mensagemSucesso }}
            </p>

            <Button
              v-if="vinculos.length"
              type="submit"
              class="primary-action"
              :loading="isLoading"
              :disabled="isLoading || !clinicaSelecionadaId"
              label="Continuar"
              icon="pi pi-arrow-right"
              icon-pos="right"
            />

            <button
              class="secondary-action"
              type="button"
              :disabled="isLoading"
              @click="abrirCadastroClinica"
            >
              <i class="pi pi-plus" />
              Cadastrar nova clínica
            </button>

            <button
              class="text-action back-action"
              type="button"
              :disabled="isLoading"
              @click="voltarParaLogin"
            >
              <i class="pi pi-arrow-left" />
              Voltar para o login
            </button>
          </form>

          <form
            v-else
            key="cadastro"
            class="modal-form registration-form"
            @submit.prevent="handleCriarClinica"
          >
            <div class="registration-section">
              <span class="section-title">Seus dados</span>

              <label class="field-label" for="cadastro-cpf">CPF</label>

              <div class="input-wrap">
                <i class="pi pi-id-card" />
                <input
                  id="cadastro-cpf"
                  v-model="cpfFormatado"
                  type="text"
                  inputmode="numeric"
                  autocomplete="username"
                  placeholder="000.000.000-00"
                  maxlength="14"
                  :disabled="isLoading || cadastroConcluido"
                >
              </div>

              <label class="field-label" for="cadastro-nome">
                Nome completo
              </label>

              <div class="input-wrap">
                <i class="pi pi-user" />
                <input
                  id="cadastro-nome"
                  v-model="novaClinica.nome_completo"
                  type="text"
                  autocomplete="name"
                  placeholder="Seu nome completo"
                  :disabled="isLoading || cadastroConcluido"
                >
              </div>

              <label class="field-label" for="cadastro-nascimento">
                Data de nascimento
              </label>

              <div class="input-wrap">
                <i class="pi pi-calendar" />
                <input
                  id="cadastro-nascimento"
                  v-model="novaClinica.data_nascimento"
                  type="date"
                  :max="dataMaximaNascimento"
                  :disabled="isLoading || cadastroConcluido"
                >
              </div>

              <label class="field-label" for="cadastro-senha">
                Senha de acesso
              </label>

              <div class="input-wrap">
                <i class="pi pi-lock" />
                <input
                  id="cadastro-senha"
                  v-model="senha"
                  type="password"
                  autocomplete="new-password"
                  placeholder="Crie sua senha"
                  :disabled="isLoading || cadastroConcluido"
                >
              </div>
            </div>

            <div class="registration-section">
              <span class="section-title">Dados da clínica</span>

              <label class="field-label" for="cadastro-cnpj">CNPJ</label>

              <div class="input-wrap">
                <i class="pi pi-briefcase" />
                <input
                  id="cadastro-cnpj"
                  v-model="cnpjFormatado"
                  type="text"
                  inputmode="numeric"
                  placeholder="00.000.000/0000-00"
                  maxlength="18"
                  :disabled="isLoading || cadastroConcluido"
                >
              </div>

              <label class="field-label" for="cadastro-razao">
                Razão social
              </label>

              <div class="input-wrap">
                <i class="pi pi-building" />
                <input
                  id="cadastro-razao"
                  v-model="novaClinica.razao_social"
                  type="text"
                  placeholder="Razão social da empresa"
                  :disabled="isLoading || cadastroConcluido"
                >
              </div>

              <label class="field-label" for="cadastro-fantasia">
                Nome fantasia
              </label>

              <div class="input-wrap">
                <i class="pi pi-shop" />
                <input
                  id="cadastro-fantasia"
                  v-model="novaClinica.nome_fantasia"
                  type="text"
                  placeholder="Nome da sua clínica"
                  :disabled="isLoading || cadastroConcluido"
                >
              </div>

              <label class="field-label" for="cadastro-telefone">
                Telefone
              </label>

              <div class="input-wrap">
                <i class="pi pi-phone" />
                <input
                  id="cadastro-telefone"
                  v-model="telefoneFormatado"
                  type="tel"
                  inputmode="tel"
                  autocomplete="tel"
                  placeholder="(00) 00000-0000"
                  maxlength="15"
                  :disabled="isLoading || cadastroConcluido"
                >
              </div>
            </div>

            <label
              class="autonomy-option"
              :class="{ disabled: isLoading || cadastroConcluido }"
            >
              <input
                v-model="novaClinica.profissionais_podem_editar_agenda"
                type="checkbox"
                :disabled="isLoading || cadastroConcluido"
              >

              <span class="autonomy-copy">
                <strong>Permitir autonomia na agenda</strong>
                <small>
                  Profissionais poderão editar a própria agenda quando também
                  tiverem essa permissão individual.
                </small>
              </span>
            </label>

            <p v-if="erroLogin" class="feedback error" role="alert">
              <i class="pi pi-exclamation-circle" />
              {{ erroLogin }}
            </p>

            <p v-if="mensagemSucesso" class="feedback success" role="status">
              <i class="pi pi-check-circle" />
              {{ mensagemSucesso }}
            </p>

            <Button
              type="submit"
              class="primary-action"
              :loading="isLoading"
              :disabled="isLoading || cadastroConcluido"
              label="Criar clínica e continuar"
              icon="pi pi-arrow-right"
              icon-pos="right"
            />

            <button
              v-if="cadastroConcluido"
              class="secondary-action"
              type="button"
              :disabled="isLoading"
              @click="voltarParaLogin"
            >
              Ir para o login
            </button>

            <button
              v-else
              class="text-action back-action"
              type="button"
              :disabled="isLoading"
              @click="voltarParaClinicas"
            >
              <i class="pi pi-arrow-left" />
              Voltar
            </button>
          </form>
        </Transition>

        <div class="modal-security">
          <i class="pi pi-shield" />
          <span>Seus dados são tratados com segurança.</span>
        </div>
      </section>
    </Transition>
  </div>
</template>

<style scoped>
.login-modal-overlay {
  --clinic-primary: #1ca4a7;
  --clinic-primary-hover: #16898c;
  --clinic-primary-soft: #eaf7f7;
  --clinic-text: #1f2937;
  --clinic-muted: #64748b;
  --clinic-border: #e2e8f0;
  --clinic-background: #f8fafc;

  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  overflow-y: auto;
  padding: 24px;
  background: rgba(15, 23, 42, 0.58);
  backdrop-filter: blur(9px);
  -webkit-backdrop-filter: blur(9px);
}

.login-modal {
  position: relative;
  width: min(100%, 460px);
  max-height: min(92vh, 900px);
  overflow-y: auto;
  padding: 34px;
  border: 1px solid rgba(255, 255, 255, 0.72);
  border-radius: 24px;
  color: var(--clinic-text, #1f2937);
  background: #fff;
  box-shadow: 0 28px 90px rgba(15, 23, 42, 0.24);
  font-family: inherit;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.modal-close {
  position: absolute;
  top: 18px;
  right: 18px;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 0;
  border-radius: 10px;
  color: #64748b;
  background: #f1f5f9;
  cursor: pointer;
  transition:
    color 180ms ease,
    background 180ms ease,
    transform 180ms ease;
}

.modal-close:hover:not(:disabled) {
  color: #1f2937;
  background: #e2e8f0;
  transform: rotate(5deg);
}

.modal-close:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.modal-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
  color: #1f2937;
  font-size: 19px;
  font-weight: 750;
  letter-spacing: -0.6px;
}

.brand-mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 11px;
  color: #fff;
  background: #1ca4a7;
  box-shadow: 0 5px 13px rgba(28, 164, 167, 0.2);
}

.brand-mark i {
  font-size: 17px;
}

.modal-heading {
  margin-bottom: 22px;
}

.eyebrow {
  color: #168f92;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1.35px;
}

.modal-heading h2 {
  margin: 9px 0 8px;
  color: #1f2937;
  font-size: clamp(24px, 4vw, 29px);
  font-weight: 750;
  letter-spacing: -0.8px;
  line-height: 1.2;
}

.modal-heading p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.65;
}

.step-indicator {
  display: flex;
  gap: 6px;
  margin-bottom: 24px;
}

.step-indicator span {
  height: 4px;
  flex: 1;
  border-radius: 10px;
  background: #e9eef3;
  transition:
    background 240ms ease,
    transform 240ms ease;
}

.step-indicator span.active {
  background: #1ca4a7;
}

.step-indicator span.current {
  transform: scaleY(1.35);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.field-label {
  margin-top: 5px;
  color: #374151;
  font-size: 12px;
  font-weight: 700;
}

.input-wrap {
  display: flex;
  min-height: 48px;
  align-items: center;
  gap: 11px;
  padding: 0 14px;
  border: 1px solid #dbe3eb;
  border-radius: 11px;
  color: #8290a3;
  background: #fff;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.input-wrap:focus-within {
  border-color: #1ca4a7;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(28, 164, 167, 0.12);
}

.input-wrap > i {
  flex-shrink: 0;
  font-size: 15px;
}

.input-wrap input {
  width: 100%;
  min-width: 0;
  height: 46px;
  border: 0;
  outline: 0;
  color: #1f2937;
  background: transparent;
  font: inherit;
  font-size: 13px;
}

.input-wrap input::placeholder {
  color: #9aa6b5;
}

.input-wrap input:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.password-toggle {
  display: grid;
  width: 30px;
  height: 34px;
  flex-shrink: 0;
  place-items: center;
  border: 0;
  border-radius: 8px;
  color: #64748b;
  background: transparent;
  cursor: pointer;
  transition: background 180ms ease;
}

.password-toggle:hover {
  background: #f1f5f9;
}

.primary-action {
  display: flex;
  width: 100%;
  min-height: 48px;
  justify-content: center;
  margin-top: 10px;
  border: 0;
  border-radius: 11px;
  color: #fff;
  background: #1ca4a7;
  box-shadow: 0 5px 14px rgba(28, 164, 167, 0.18);
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.primary-action:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #16898c;
  box-shadow: 0 8px 18px rgba(28, 164, 167, 0.23);
}

.primary-action:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.form-divider {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 7px 0 0;
  color: #94a3b8;
  font-size: 11px;
}

.form-divider::before,
.form-divider::after {
  height: 1px;
  flex: 1;
  background: #e9eef3;
  content: '';
}

.text-action,
.secondary-action {
  display: flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 10px;
  color: #168f92;
  background: transparent;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    color 180ms ease,
    background 180ms ease;
}

.text-action:hover:not(:disabled) {
  color: #11777a;
  background: #effafa;
}

.text-action:disabled,
.secondary-action:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.secondary-action {
  width: 100%;
  border: 1px solid #dbe3eb;
  color: #168f92;
  background: #fff;
}

.secondary-action:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #b9dfe0;
}

.back-action {
  margin-top: 1px;
  color: #64748b;
}

.feedback {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 5px 0;
  padding: 11px 12px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.5;
}

.feedback i {
  margin-top: 2px;
  flex-shrink: 0;
}

.feedback.error {
  color: #b42318;
  background: #fff1f0;
}

.feedback.success {
  color: #067647;
  background: #ecfdf3;
}

.clinic-list {
  display: flex;
  flex-direction: column;
  gap: 9px;
  max-height: 270px;
  overflow-y: auto;
  padding: 2px;
}

.clinic-option {
  display: flex;
  min-height: 72px;
  align-items: center;
  gap: 12px;
  padding: 13px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  text-align: left;
  background: #fff;
  cursor: pointer;
  transition:
    border-color 180ms ease,
    background 180ms ease,
    transform 180ms ease,
    box-shadow 180ms ease;
}

.clinic-option:hover {
  transform: translateY(-1px);
  border-color: #b9dfe0;
  background: #f8fdfd;
}

.clinic-option.selected {
  border-color: #1ca4a7;
  background: #effafa;
  box-shadow: 0 0 0 3px rgba(28, 164, 167, 0.08);
}

.clinic-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  place-items: center;
  border-radius: 11px;
  color: #168f92;
  background: #e7f6f6;
  font-size: 16px;
}

.clinic-info {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 5px;
}

.clinic-info strong {
  overflow-wrap: anywhere;
  color: #263445;
  font-size: 13px;
}

.clinic-info small {
  color: #64748b;
  font-size: 11px;
}

.clinic-check {
  color: #cbd5e1;
  font-size: 18px;
  transition: color 180ms ease;
}

.clinic-option.selected .clinic-check {
  color: #1ca4a7;
}

.empty-clinics {
  padding: 23px 18px;
  border: 1px dashed #cbd5e1;
  border-radius: 13px;
  text-align: center;
  background: #f8fafc;
}

.empty-icon {
  display: grid;
  width: 48px;
  height: 48px;
  place-items: center;
  margin: 0 auto 12px;
  border-radius: 13px;
  color: #168f92;
  background: #e7f6f6;
  font-size: 19px;
}

.empty-clinics strong {
  color: #374151;
  font-size: 13px;
}

.empty-clinics p {
  margin: 7px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.registration-form {
  gap: 9px;
}

.registration-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 9px;
}

.section-title {
  margin: 5px 0 2px;
  color: #263445;
  font-size: 12px;
  font-weight: 800;
}

.registration-form .input-wrap {
  min-height: 44px;
}

.registration-form .input-wrap input {
  height: 42px;
  font-size: 12px;
}

.registration-form .field-label {
  margin-top: 2px;
}

.autonomy-option {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: 13px;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  background: #f8fafc;
  cursor: pointer;
  transition:
    border-color 180ms ease,
    background 180ms ease;
}

.autonomy-option:has(input:checked) {
  border-color: #b9dfe0;
  background: #effafa;
}

.autonomy-option.disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.autonomy-option input {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  margin: 2px 0 0;
  accent-color: #1ca4a7;
}

.autonomy-copy {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.autonomy-copy strong {
  color: #374151;
  font-size: 12px;
}

.autonomy-copy small {
  color: #64748b;
  font-size: 11px;
  line-height: 1.55;
}

.modal-security {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  margin-top: 25px;
  padding-top: 17px;
  border-top: 1px solid #e9eef3;
  color: #94a3b8;
  font-size: 10px;
}

.modal-security i {
  color: #1ca4a7;
  font-size: 12px;
}

.modal-enter-active,
.modal-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.985);
}

.step-enter-active,
.step-leave-active {
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}

.step-enter-from {
  opacity: 0;
  transform: translateY(7px);
}

.step-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@media (max-width: 520px) {
  .login-modal-overlay {
    align-items: center;
    padding: 12px;
  }

  .login-modal {
    max-height: 94vh;
    padding: 25px 20px;
    border-radius: 20px;
  }

  .modal-brand {
    margin-bottom: 25px;
  }

  .modal-heading h2 {
    font-size: 25px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
  }
}
</style>