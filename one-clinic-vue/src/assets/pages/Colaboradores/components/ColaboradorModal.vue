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
                <label>Função</label>
                <select v-model="form.funcao" required :disabled="isDetalhes">
                  <option value="" disabled>Selecione uma função</option>
                  <option value="Admin">Administrador</option>
                  <option value="Secretário">Secretário(a)</option>
                  <option value="Profissional">Profissional Especializado</option>
                </select>
              </div>

              <div class="form-group flex-1" v-if="form.funcao === 'Profissional'">
                <label>Especialidade</label>
                <select v-model="especialidadeSelecionada" required :disabled="isDetalhes">
                  <option value="" disabled>Selecione...</option>
                  <option v-for="esp in especialidadesDisponiveis" :key="esp" :value="esp">
                    {{ esp }}
                  </option>
                  <option value="Outra">Nova Especialidade...</option>
                </select>
              </div>
            </div>

            <div class="form-row" v-if="form.funcao === 'Profissional' && especialidadeSelecionada === 'Outra'">
              <div class="form-group flex-1">
                <label>Nova Especialidade</label>
                <input 
                  type="text" 
                  v-model="novaEspecialidade" 
                  required 
                  :disabled="isDetalhes"
                  placeholder="Digite a nova especialidade" 
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Status</label>
                <select v-model="form.status" :disabled="isDetalhes">
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="ferias">Em Férias</option>
                </select>
              </div>
            </div>

            <div class="form-row" v-if="form.status === 'ferias'">
              <div class="form-group flex-1">
                <label>Início das Férias</label>
                <input 
                  type="date" 
                  v-model="form.inicioFerias" 
                  required 
                  :disabled="isDetalhes"
                />
              </div>
              <div class="form-group flex-1">
                <label>Fim das Férias</label>
                <input 
                  type="date" 
                  v-model="form.fimFerias" 
                  required 
                  :disabled="isDetalhes"
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
                <label>Data de Demissão (Opcional)</label>
                <input 
                  type="date" 
                  v-model="form.demissao" 
                  :disabled="isDetalhes || form.status === 'ativo'"
                />
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

const especialidadesDisponiveis = ref(['Massoterapeuta', 'Podólogo', 'Esteticista', 'Fisioterapeuta'])

const form = ref({
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  funcao: '',
  especialidade: '',
  admissao: '',
  demissao: '',
  status: 'ativo',
  inicioFerias: '',
  fimFerias: '',
  criadoEm: ''
})

const exibicaoCpf = ref('')
const exibicaoTelefone = ref('')
const especialidadeSelecionada = ref('')
const novaEspecialidade = ref('')

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
      form.value = { 
        ...props.colaboradorEdicao, 
        admissao: formatarDataInput(props.colaboradorEdicao.admissao),
        demissao: formatarDataInput(props.colaboradorEdicao.demissao),
        inicioFerias: formatarDataInput(props.colaboradorEdicao.inicioFerias),
        fimFerias: formatarDataInput(props.colaboradorEdicao.fimFerias)
      }
      exibicaoCpf.value = props.colaboradorEdicao.cpf
      exibicaoTelefone.value = props.colaboradorEdicao.telefone

      if (form.value.funcao === 'Profissional') {
        if (especialidadesDisponiveis.value.includes(form.value.especialidade)) {
          especialidadeSelecionada.value = form.value.especialidade
        } else if (form.value.especialidade) {
          especialidadeSelecionada.value = 'Outra'
          novaEspecialidade.value = form.value.especialidade
        } else {
          especialidadeSelecionada.value = ''
        }
      }
    } else {
      form.value = { nome: '', cpf: '', email: '', telefone: '', funcao: '', especialidade: '', admissao: '', demissao: '', status: 'ativo', inicioFerias: '', fimFerias: '', criadoEm: '' }
      exibicaoCpf.value = ''
      exibicaoTelefone.value = ''
      especialidadeSelecionada.value = ''
      novaEspecialidade.value = ''
    }
  }
})

const fechar = () => {
  emit('close')
}

const salvar = () => {
  if (isDetalhes.value) return

  let especialidadeFinal = ''
  if (form.value.funcao === 'Profissional') {
    if (especialidadeSelecionada.value === 'Outra') {
      especialidadeFinal = novaEspecialidade.value
      if (!especialidadesDisponiveis.value.includes(especialidadeFinal)) {
        especialidadesDisponiveis.value.push(especialidadeFinal)
      }
    } else {
      especialidadeFinal = especialidadeSelecionada.value
    }
  }

  const dadosSalvos = {
    ...form.value,
    especialidade: especialidadeFinal,
    admissao: formatarDataVisualizacao(form.value.admissao),
    demissao: formatarDataVisualizacao(form.value.demissao),
    inicioFerias: form.value.status === 'ferias' ? formatarDataVisualizacao(form.value.inicioFerias) : '',
    fimFerias: form.value.status === 'ferias' ? formatarDataVisualizacao(form.value.fimFerias) : ''
  }
  emit('save', dadosSalvos)
  fechar()
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  font-family: 'Inter', sans-serif;
}

.modal-container {
  background-color: #FFFFFF;
  border-radius: 16px;
  width: 100%;
  max-width: 650px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
  background-color: #F8FAFC;
  color: #334155;
  border-bottom: 1px solid #E2E8F0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.btn-close {
  background: #E2E8F0;
  border: none;
  color: #64748B;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-close:hover {
  background: #CBD5E1;
  color: #0F172A;
}

.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
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
  color: #64748B;
}

.form-group input,
.form-group select {
  padding: 0.85rem 1rem;
  border: 1px solid #E2E8F0;
  border-radius: 10px;
  outline: none;
  font-size: 0.95rem;
  color: #334155;
  transition: all 0.2s ease;
  background-color: #F8FAFC;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #1CA4A7;
  background-color: #FFFFFF;
  box-shadow: 0 0 0 3px rgba(28, 164, 167, 0.1);
}

.form-group input:disabled,
.form-group select:disabled,
.bg-gray {
  background-color: #F1F5F9;
  color: #94A3B8;
  cursor: not-allowed;
  border-color: #E2E8F0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #E2E8F0;
}

.btn-cancelar {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  color: #64748B;
  padding: 0.85rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-cancelar:hover {
  background-color: #F8FAFC;
  color: #334155;
  border-color: #CBD5E1;
}

.btn-salvar {
  background-color: #1CA4A7;
  color: #FFFFFF;
  border: none;
  padding: 0.85rem 2rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
  font-family: inherit;
}

.btn-salvar:hover {
  background-color: #158A8D;
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