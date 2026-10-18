<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { Button } from "../Home.js"

const emit = defineEmits(["close"])
const router = useRouter()
const step = ref(1)
const isLoading = ref(false)
const cpf = ref("")
const senha = ref("")
const erroLogin = ref(false)

const clinicasVinculadas = ref([
  { id: 1, nome: "Estética Avançada Centro", papel: "Administrador" },
  { id: 2, nome: "OneClinic Filial Sul", papel: "Profissional" },
  { id: 3, nome: "Clínica Harmonize", papel: "Administrador" },
  { id: 4, nome: "Pele & Arte Spa", papel: "Secretário" }
])

const novaClinica = ref({
  nome: "",
  cnpj: "",
  telefone: "",
  email: ""
})

const formatCpf = (event) => {
  let value = event.target.value.replace(/\D/g, "")
  value = value.replace(/^(\d{3})(\d)/, "$1.$2")
  value = value.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
  value = value.replace(/\.(\d{3})(\d)/, ".$1-$2")
  cpf.value = value.slice(0, 14)
}

const formatCnpj = (event) => {
  let value = event.target.value.replace(/\D/g, "")
  value = value.replace(/^(\d{2})(\d)/, "$1.$2")
  value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
  value = value.replace(/\.(\d{3})(\d)/, ".$1/$2")
  value = value.replace(/(\d{4})(\d)/, "$1-$2")
  novaClinica.value.cnpj = value.slice(0, 18)
}

const formatTelefone = (event) => {
  let value = event.target.value.replace(/\D/g, "")
  value = value.replace(/^(\d{2})(\d)/g, "($1) $2")
  value = value.replace(/(\d)(\d{4})$/, "$1-$2")
  novaClinica.value.telefone = value.slice(0, 15)
}

const handleLogin = () => {
  const cpfLimpo = cpf.value.replace(/\D/g, "")
  erroLogin.value = false

  if (cpfLimpo.length !== 11 || !senha.value.trim()) {
    erroLogin.value = true
    return
  }

  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    step.value = 2
  }, 1000)
}

const selecionarClinica = (clinica) => {
  localStorage.setItem(
    "oneclinic_user",
    JSON.stringify({
      nome: "Colaborador",
      role: clinica.papel,
      clinica_id: clinica.id,
      clinica_nome: clinica.nome,
    })
  )
  emit("close")
  router.push("/app/dashboard")
}

const irParaCriacao = () => {
  step.value = 3
}

const voltarParaLista = () => {
  step.value = 2
}

const handleCriarClinica = () => {
  const cnpjLimpo = novaClinica.value.cnpj.replace(/\D/g, "")
  
  if (cnpjLimpo.length !== 14 || !novaClinica.value.nome) {
    return
  }

  isLoading.value = true
  
  setTimeout(() => {
    isLoading.value = false
    const clinicaCriada = {
      id: Date.now(),
      nome: novaClinica.value.nome,
      papel: "Administrador"
    }
    clinicasVinculadas.value.push(clinicaCriada)
    selecionarClinica(clinicaCriada)
  }, 1500)
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card">
      <button class="close-btn" @click="$emit('close')">
        <i class="pi pi-times"></i>
      </button>

      <div v-if="step === 1" class="step-container">
        <div class="modal-header">
          <h2>Acesso do Colaborador</h2>
          <p>Preencha seus dados para entrar no sistema</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="input-group">
            <label for="cpf">CPF</label>
            <input
              type="text"
              id="cpf"
              :value="cpf"
              @input="formatCpf"
              placeholder="000.000.000-00"
              maxlength="14"
              inputmode="numeric"
              :disabled="isLoading"
              required
            />
          </div>

          <div class="input-group">
            <label for="senha">Senha</label>
            <input
              type="password"
              id="senha"
              v-model="senha"
              placeholder="Sua senha"
              :disabled="isLoading"
              required
            />
          </div>

          <div v-if="erroLogin" class="error-msg">
            Dados inválidos. Verifique seu CPF e senha.
          </div>

          <div class="modal-actions">
            <Button
              type="submit"
              :label="isLoading ? 'Validando...' : 'Entrar'"
              :disabled="isLoading"
              class="btn-primary w-full"
            />
          </div>
        </form>
      </div>

      <div v-else-if="step === 2" class="step-container">
        <div class="modal-header">
          <h2>Selecione a Clínica</h2>
          <p>Escolha o ambiente de trabalho para acessar</p>
        </div>

        <div class="clinicas-list">
          <div
            v-for="clinica in clinicasVinculadas"
            :key="clinica.id"
            class="clinica-card"
            @click="selecionarClinica(clinica)"
          >
            <div class="clinica-icon">
              <i class="pi pi-building"></i>
            </div>
            <div class="clinica-info">
              <h4>{{ clinica.nome }}</h4>
              <span>Perfil: {{ clinica.papel }}</span>
            </div>
            <div class="clinica-arrow">
              <i class="pi pi-chevron-right"></i>
            </div>
          </div>
        </div>

        <div class="modal-actions mt-4">
          <div class="divider">ou</div>
          <Button
            label="Criar nova clínica"
            icon="pi pi-plus"
            outlined
            class="btn-outline w-full mt-2 btn-icon-spaced"
            @click="irParaCriacao"
          />
        </div>
      </div>

      <div v-else-if="step === 3" class="step-container">
        <div class="modal-header">
          <h2>Nova Clínica</h2>
          <p>Cadastre os dados para criar seu ambiente</p>
        </div>

        <form @submit.prevent="handleCriarClinica" class="login-form">
          <div class="input-group">
            <label for="nomeClinica">Nome da Clínica</label>
            <input
              type="text"
              id="nomeClinica"
              v-model="novaClinica.nome"
              placeholder="Ex: Estética Avançada"
              :disabled="isLoading"
              required
            />
          </div>

          <div class="input-group">
            <label for="cnpj">CNPJ</label>
            <input
              type="text"
              id="cnpj"
              :value="novaClinica.cnpj"
              @input="formatCnpj"
              placeholder="00.000.000/0000-00"
              maxlength="18"
              inputmode="numeric"
              :disabled="isLoading"
              required
            />
          </div>

          <div class="form-row">
            <div class="input-group flex-1">
              <label for="telefone">Telefone</label>
              <input
                type="text"
                id="telefone"
                :value="novaClinica.telefone"
                @input="formatTelefone"
                placeholder="(00) 00000-0000"
                maxlength="15"
                inputmode="numeric"
                :disabled="isLoading"
                required
              />
            </div>

            <div class="input-group flex-1">
              <label for="email">E-mail</label>
              <input
                type="email"
                id="email"
                v-model="novaClinica.email"
                placeholder="contato@clinica.com"
                :disabled="isLoading"
                required
              />
            </div>
          </div>

          <div class="modal-actions action-buttons-row">
            <Button
              type="button"
              label="Voltar"
              outlined
              class="btn-outline flex-1"
              :disabled="isLoading"
              @click="voltarParaLista"
            />
            <Button
              type="submit"
              :label="isLoading ? 'Criando...' : 'Criar Clínica'"
              :disabled="isLoading"
              class="btn-primary flex-1"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(4, 31, 46, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal-card {
  background: var(--branco);
  border-radius: 1.5rem;
  padding: 2.5rem;
  width: 100%;
  max-width: 480px;
  position: relative;
  box-shadow: 0 25px 50px rgba(11, 48, 66, 0.3);
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.close-btn {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  background: none;
  border: none;
  color: var(--cor-secundaria);
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: var(--cor-primaria);
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.modal-header h2 {
  color: var(--cor-escura);
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
}

.modal-header p {
  color: var(--cor-secundaria);
  font-size: 0.95rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.flex-1 {
  flex: 1;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-group label {
  font-weight: 600;
  color: var(--cor-secundaria);
  font-size: 0.9rem;
}

.input-group input {
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  font-family: inherit;
  width: 100%;
}

.input-group input:focus {
  border-color: var(--cor-primaria);
  box-shadow: 0 0 0 3px rgba(28, 164, 167, 0.15);
}

.error-msg {
  color: #dc2626;
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  margin-top: -0.5rem;
}

.w-full {
  width: 100%;
}

.clinicas-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.clinicas-list::-webkit-scrollbar {
  width: 6px;
}

.clinicas-list::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 10px;
}

.clinica-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.clinica-card:hover {
  border-color: var(--cor-primaria);
  background: rgba(28, 164, 167, 0.05);
  transform: translateY(-2px);
}

.clinica-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--cor-clara);
  color: var(--cor-secundaria);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-right: 1rem;
  flex-shrink: 0;
}

.clinica-info {
  flex: 1;
}

.clinica-info h4 {
  color: var(--cor-escura);
  margin: 0 0 0.2rem 0;
  font-size: 1rem;
}

.clinica-info span {
  color: #6b7280;
  font-size: 0.8rem;
}

.clinica-arrow {
  color: #9ca3af;
  font-size: 1rem;
  transition: transform 0.2s ease;
}

.clinica-card:hover .clinica-arrow {
  color: var(--cor-primaria);
  transform: translateX(3px);
}

.mt-4 {
  margin-top: 1.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.divider::before,
.divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px solid #e5e7eb;
}

.divider::before {
  margin-right: 0.5em;
}

.divider::after {
  margin-left: 0.5em;
}

.action-buttons-row {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

:deep(.btn-icon-spaced .p-button-icon) {
  margin-right: 0.75rem !important;
}
</style>