<template>
  <Transition name="fade">
    <div class="modal-overlay" v-if="isOpen" @click.self="fechar">
      <Transition name="scale">
        <div class="modal-container" v-if="isOpen">
          <header class="modal-header">
            <h3>{{ tituloModal }}</h3>
            <button class="btn-close" @click="fechar">
              <i class="pi pi-times"></i>
            </button>
          </header>

          <form @submit.prevent="salvar" class="modal-form">
            <div class="form-row">
              <div class="form-group flex-1">
                <label>Nome Completo</label>
                <input 
                  type="text" 
                  v-model="form.nome" 
                  required 
                  minlength="3"
                  :disabled="isDetalhes"
                  placeholder="Ex: Carlos Mendes" 
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
                <label>E-mail Corporativo</label>
                <input 
                  type="email" 
                  v-model="form.email" 
                  required 
                  :disabled="isDetalhes"
                  placeholder="Ex: carlos@empresa.com" 
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
                <label>Cargo</label>
                <input 
                  type="text" 
                  v-model="form.cargo" 
                  required 
                  :disabled="isDetalhes"
                  placeholder="Ex: Desenvolvedor Senior" 
                />
              </div>
              
              <div class="form-group flex-1">
                <label>Departamento</label>
                <input 
                  type="text" 
                  v-model="form.departamento" 
                  required 
                  :disabled="isDetalhes"
                  placeholder="Ex: TI" 
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Data de Admissão</label>
                <input 
                  type="date" 
                  v-model="form.admissao" 
                  required 
                  :disabled="isDetalhes"
                />
              </div>

              <div class="form-group flex-1">
                <label>Status</label>
                <select v-model="form.status" :disabled="isDetalhes">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="ferias">Em Férias</option>
                </select>
              </div>
            </div>

            <div class="form-group" v-if="mode !== 'criar'">
              <label>Registro no Sistema</label>
              <input 
                type="text" 
                v-model="form.criadoEm" 
                disabled 
                class="bg-gray"
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
  cargo: '',
  departamento: '',
  admissao: '',
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

const formatarDataInput = (dataStr) => {
  if (!dataStr) return ''
  if (dataStr.includes('/')) {
    const [dia, mes, ano] = dataStr.split('/')
    return `${ano}-${mes}-${dia}`
  }
  return dataStr
}

const formatarDataVisualizacao = (dataStr) => {
  if (!dataStr) return ''
  if (dataStr.includes('-')) {
    const [ano, mes, dia] = dataStr.split('-')
    return `${dia}/${mes}/${ano}`
  }
  return dataStr
}

watch(() => props.isOpen, (aberto) => {
  if (aberto) {
    if (props.colaboradorEdicao && props.mode !== 'criar') {
      form.value = { ...props.colaboradorEdicao, admissao: formatarDataInput(props.colaboradorEdicao.admissao) }
      exibicaoCpf.value = props.colaboradorEdicao.cpf
      exibicaoTelefone.value = props.colaboradorEdicao.telefone
    } else {
      form.value = { nome: '', cpf: '', email: '', telefone: '', cargo: '', departamento: '', admissao: '', status: 'ativo', criadoEm: '' }
      exibicaoCpf.value = ''
      exibicaoTelefone.value = ''
    }
  }
})

const fechar = () => {
  emit('close')
}

const salvar = () => {
  if (isDetalhes.value) return
  const dadosSalvos = {
    ...form.value,
    admissao: formatarDataVisualizacao(form.value.admissao)
  }
  emit('save', dadosSalvos)
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
  background-color: rgba(31, 41, 55, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-container {
  background-color: #FFFFFF;
  border-radius: 16px;
  width: 100%;
  max-width: 600px; /* Aumentado para acomodar duas colunas */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background-color: #1F2937;
  color: #FFFFFF;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  color: #FFFFFF;
  opacity: 0.7;
  cursor: pointer;
  transition: opacity 0.2s ease;
  font-size: 1.2rem;
}

.btn-close:hover {
  opacity: 1;
}

.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6B7280;
}

.form-group input,
.form-group select {
  padding: 0.75rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  outline: none;
  font-size: 0.95rem;
  color: #1F2937;
  transition: all 0.2s ease;
  background-color: #FFFFFF;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #1CA4A7;
  box-shadow: 0 0 0 3px rgba(28, 164, 167, 0.1);
}

.form-group input:disabled,
.form-group select:disabled,
.bg-gray {
  background-color: #F9FAFB;
  color: #9CA3AF;
  cursor: not-allowed;
  border-color: #E5E7EB;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.5rem;
}

.btn-cancelar {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  color: #6B7280;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-cancelar:hover {
  background-color: #F9FAFB;
  color: #1F2937;
}

.btn-salvar {
  background-color: #1CA4A7;
  color: #FFFFFF;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-salvar:hover {
  background-color: #158a8d;
  transform: translateY(-1px);
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