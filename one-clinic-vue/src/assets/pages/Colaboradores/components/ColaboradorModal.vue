<template>
  <Transition name="fade">
    <div class="modal-overlay" v-if="isOpen" @click.self="fechar">
      <Transition name="scale">
        <div class="modal-container">
          <header class="modal-header">
            <h3>{{ tituloModal }}</h3>
            <button class="btn-close" @click="fechar">
              <i class="pi pi-times"></i>
            </button>
          </header>

          <form @submit.prevent="salvar" class="modal-form">    
            <div class="form-row">
              <div class="form-group flex-2">
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  v-model="form.nome" 
                  required 
                  minlength="3"
                  :disabled="isDetalhes"
                  placeholder="Ex: Dra. Maria Santos" 
                />
              </div>

              <div class="form-group flex-1">
                <label>CPF</label>
                <input 
                  type="text" 
                  v-model="exibicaoCpf" 
                  @input="processarCpf"
                  required 
                  maxlength="14"
                  :disabled="isDetalhes"
                  placeholder="000.000.000-00" 
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>E-mail</label>
                <input 
                  type="email" 
                  v-model="form.email" 
                  required 
                  :disabled="isDetalhes"
                  placeholder="exemplo@oneclinic.com" 
                />
              </div>

              <div class="form-group flex-1">
                <label>Telefone</label>
                <input 
                  type="text" 
                  v-model="exibicaoTelefone"
                  @input="processarTelefone"
                  required 
                  maxlength="15"
                  :disabled="isDetalhes"
                  placeholder="(00) 00000-0000" 
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Função</label>
                <select v-model="form.funcao" :disabled="isDetalhes">
                  <option value="Profissional">Profissional</option>
                  <option value="Admin">Admin</option>
                  <option value="Secretário">Secretário</option>
                </select>
              </div>

              <div class="form-group flex-1" v-if="form.funcao === 'Profissional'">
                <label>Especialidade</label>
                <input 
                  type="text" 
                  v-model="form.especialidade" 
                  required
                  :disabled="isDetalhes"
                  placeholder="Ex: Dermatologista" 
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-2">
                <label>Horário de Trabalho</label>
                <input 
                  type="text" 
                  v-model="form.horario" 
                  required
                  :disabled="isDetalhes"
                  placeholder="Ex: Segunda a Sexta, 8h-18h" 
                />
              </div>

              <div class="form-group flex-1">
                <label>Status</label>
                <select v-model="form.status" :disabled="isDetalhes">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>

            <div class="form-group" v-if="mode !== 'criar'">
              <label>Criado em</label>
              <input 
                type="text" 
                v-model="form.criadoEm" 
                disabled 
              />
            </div>

            <footer class="modal-footer">
              <button type="button" class="btn-cancelar" @click="fechar">
                {{ isDetalhes ? 'Fechar' : 'Cancelar' }}
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
import { ref, watch, computed } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  mode: String,
  colaboradorEdicao: Object
})

const emit = defineEmits(['close', 'save'])

const form = ref({
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  funcao: 'Profissional',
  especialidade: '',
  horario: '',
  status: 'ativo',
  criadoEm: ''
})

const exibicaoCpf = ref('')
const exibicaoTelefone = ref('')

const tituloModal = computed(() => {
  if (props.mode === 'detalhes') return 'Detalhes do Colaborador'
  if (props.mode === 'editar') return 'Editar Colaborador'
  return 'Novo Colaborador'
})

const isDetalhes = computed(() => props.mode === 'detalhes')

const aplicarMascaraCpf = (v) => {
  v = v.replace(/\D/g, '')
  if (v.length <= 11) {
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d)/, '$1.$2')
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  return v
}

const aplicarMascaraTelefone = (v) => {
  v = v.replace(/\D/g, '')
  if (v.length <= 11) {
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2')
    v = v.replace(/(\d)(\d{4})$/, '$1-$2')
  }
  return v
}

const processarCpf = (event) => {
  let num = event.target.value.replace(/\D/g, '').slice(0, 11)
  exibicaoCpf.value = aplicarMascaraCpf(num)
  form.value.cpf = exibicaoCpf.value
}

const processarTelefone = (event) => {
  let num = event.target.value.replace(/\D/g, '').slice(0, 11)
  exibicaoTelefone.value = aplicarMascaraTelefone(num)
  form.value.telefone = exibicaoTelefone.value
}

watch(() => props.isOpen, (aberto) => {
  if (aberto) {
    if (props.colaboradorEdicao && props.mode !== 'criar') {
      form.value = { ...props.colaboradorEdicao }
      exibicaoCpf.value = props.colaboradorEdicao.cpf
      exibicaoTelefone.value = props.colaboradorEdicao.telefone
    } else {
      form.value = { 
        nome: '', cpf: '', email: '', telefone: '', 
        funcao: 'Profissional', especialidade: '', horario: '', 
        status: 'ativo', criadoEm: '' 
      }
      exibicaoCpf.value = ''
      exibicaoTelefone.value = ''
    }
  }
})

watch(() => form.value.funcao, (novaFuncao) => {
  if (novaFuncao !== 'Profissional') {
    form.value.especialidade = ''
  }
})

const fechar = () => {
  emit('close')
}

const salvar = () => {
  if (isDetalhes.value) return
  emit('save', { ...form.value })
  fechar()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(31, 41, 55, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-container {
  background-color: var(--branco, #FFFFFF);
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background-color: var(--cor-escura, #1F2937);
  color: var(--branco, #FFFFFF);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  color: var(--branco, #FFFFFF);
  opacity: 0.7;
  cursor: pointer;
  font-size: 1.1rem;
  transition: opacity 0.2s ease;
}

.btn-close:hover {
  opacity: 1;
}

.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  overflow-y: auto;
}

.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.flex-1 {
  flex: 1;
  min-width: 200px;
}

.flex-2 {
  flex: 2;
  min-width: 250px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cor-secundaria, #6B7280);
}

.form-group input,
.form-group select {
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--cor-clara, #E5E7EB);
  border-radius: 6px;
  outline: none;
  font-size: 0.95rem;
  color: var(--cor-escura, #1F2937);
  background-color: var(--branco, #FFFFFF);
  transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-group input:focus,
.form-group select:focus {
  border-color: var(--cor-primaria, #1CA4A7);
  box-shadow: 0 0 0 3px rgba(28, 164, 167, 0.1);
}

.form-group input:disabled,
.form-group select:disabled {
  background-color: var(--cor-fundo, #F9FAFB);
  color: var(--cor-secundaria, #6B7280);
  cursor: not-allowed;
  border-color: rgba(0, 0, 0, 0.05);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--cor-clara, #E5E7EB);
}

.btn-cancelar {
  background: none;
  border: 1px solid var(--cor-clara, #E5E7EB);
  color: var(--cor-secundaria, #6B7280);
  padding: 0.6rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.btn-cancelar:hover {
  background-color: var(--cor-fundo, #F9FAFB);
}

.btn-salvar {
  background-color: var(--cor-escura, #1F2937);
  color: var(--branco, #FFFFFF);
  border: none;
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.btn-salvar:hover {
  background-color: var(--cor-primaria, #1CA4A7);
  transform: translateY(-1px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
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