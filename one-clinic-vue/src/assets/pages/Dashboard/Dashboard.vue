<template>
  <div class="dashboard-container">
    <div v-if="erroCarregamento" class="status-banner erro" role="alert">
      <i class="pi pi-exclamation-triangle"></i>
      <span>{{ erroCarregamento }}</span>
      <button type="button" class="banner-acao" @click="carregarPainel">
        Tentar novamente
      </button>
    </div>

    <DashboardStats
      :agendamentos-hoje="agendamentosHoje.length"
      :em-andamento="emAndamento"
      :clientes-ativos="clientesAtivos"
      :taxa-comparecimento="taxaComparecimento"
      :atendimentos-considerados="atendimentosConsiderados"
      :carregando="carregando"
    />

    <div class="content-grid">
      <DashboardAgenda
        :itens="agendamentosHoje"
        :carregando="carregando"
        :erro="Boolean(erroCarregamento)"
      />
      <DashboardRecentClients
        :clientes="clientesRecentes"
        :carregando="carregando"
        :pode-ver-clientes="podeGerenciar"
      />
    </div>

    <DashboardActions
      :pode-agendar="podeEditarAgenda"
      :pode-cadastrar-cliente="podeGerenciar"
      @novo-cliente="abrirModalCliente"
      @novo-agendamento="abrirModalAgendamento"
    />

    <ClientModal
      :isOpen="isModalOpen"
      mode="criar"
      :clienteEdicao="null"
      @close="fecharModal"
      @save="salvarCliente"
      @notify="receberNotificacao"
    />

    <AgendaFormModal
      :isOpen="isModalAgendamentoOpen"
      :editing="false"
      :form="formAgendamento"
      :clientesBD="clientesBD"
      :servicosBD="servicosBD"
      :profissionaisBD="profissionaisBD"
      :isValid="formAgendamentoValido"
      :salvando="salvando"
      :alerta="alertaForm"
      :avisosAcesso="avisosAcesso"
      :somenteLeitura="!podeEditarAgenda"
      mensagemSomenteLeitura="Seu perfil não permite criar agendamentos."
      @close="fecharModalAgendamento"
      @save="salvarNovoAgendamento"
      @limpar-alerta="alertaForm = null"
      @notify="receberNotificacao"
    />

    <Transition name="toast">
      <div v-if="toast.show" :class="['toast-notification', toast.type]">
        <i
          :class="
            toast.type === 'error' ? 'pi pi-exclamation-circle' : 'pi pi-check-circle'
          "
        ></i>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

import DashboardStats from './components/DashboardStats.vue'
import DashboardAgenda from './components/DashboardAgenda.vue'
import DashboardRecentClients from './components/DashboardRecentClients.vue'
import DashboardActions from './components/DashboardActions.vue'
import ClientModal from '../Clientes/components/ClientModal.vue'
import AgendaFormModal from '../Agenda/components/AgendaFormModal.vue'
import { useAgendamentos } from '@/composables/useAgendamentos'
import { criarCliente } from '@/services/agendamentos'
import { hojeNoFuso, somarDias, formatarDataBR } from '@/utils/agendamentos'

const {
  agora,
  agendamentos,
  carregando,
  erroCarregamento,
  salvando,
  clientesBD,
  profissionaisBD,
  servicosBD,
  avisosAcesso,
  acessoNegado,
  colaboradorId,
  profissionalComAutonomia,
  podeGerenciar,
  podeEditarAgenda,
  carregarCadastros,
  carregarAgendamentos,
  salvarAgendamento,
} = useAgendamentos()

const JANELA_DIAS = 30

const isModalOpen = ref(false)
const isModalAgendamentoOpen = ref(false)
const alertaForm = ref(null)
const toast = ref({ show: false, message: '', type: 'success' })

let toastTimer

const hoje = computed(() => hojeNoFuso(agora.value))

const profissionalPadrao = () => {
  if (!profissionalComAutonomia.value) return { nome: '', id: '' }

  const proprio = profissionaisBD.value.find(
    (item) => String(item.id) === colaboradorId.value
  )

  return proprio ? { nome: proprio.nome, id: proprio.id } : { nome: '', id: '' }
}

const preencherFormVazio = () => ({
  cliente: '',
  cliente_id: '',
  servico: '',
  servico_id: '',
  servicoPreco: null,
  servicoDuracao: null,
  profissional: profissionalPadrao().nome,
  profissional_id: profissionalPadrao().id,
  pacote_id: '',
  pacoteNome: '',
  dataInicio: '',
  horaInicio: '',
  dataFim: '',
  horaFim: '',
  observacoes: '',
  precoAcordado: '',
})

const formAgendamento = ref(preencherFormVazio())

const formAgendamentoValido = computed(
  () =>
    Boolean(formAgendamento.value.cliente_id) &&
    Boolean(formAgendamento.value.servico_id) &&
    Boolean(formAgendamento.value.profissional_id) &&
    Boolean(formAgendamento.value.dataInicio) &&
    Boolean(formAgendamento.value.horaInicio) &&
    Boolean(formAgendamento.value.horaFim)
)

const agendamentosHoje = computed(() =>
  agendamentos.value
    .filter((item) => item.dataInicio === hoje.value && item.status !== 'cancelado')
    .sort((a, b) =>
      a.horaInicio === b.horaInicio
        ? String(a.id).localeCompare(String(b.id))
        : a.horaInicio < b.horaInicio
        ? -1
        : 1
    )
)

const emAndamento = computed(
  () => agendamentosHoje.value.filter((item) => item.status === 'em_andamento').length
)

const clientesAtivos = computed(() =>
  acessoNegado.value.clientes ? null : clientesBD.value.length
)

const resultadosJanela = computed(() => {
  const realizados = agendamentos.value.filter((item) => item.status === 'concluido').length
  const faltas = agendamentos.value.filter((item) => item.status === 'falta').length

  return { realizados, faltas }
})

const atendimentosConsiderados = computed(
  () => resultadosJanela.value.realizados + resultadosJanela.value.faltas
)

const taxaComparecimento = computed(() =>
  atendimentosConsiderados.value
    ? Math.round((resultadosJanela.value.realizados / atendimentosConsiderados.value) * 100)
    : null
)

const diasEntre = (inicio, fim) => {
  const [a1, m1, d1] = inicio.split('-').map(Number)
  const [a2, m2, d2] = fim.split('-').map(Number)

  return Math.round((Date.UTC(a2, m2 - 1, d2) - Date.UTC(a1, m1 - 1, d1)) / 86400000)
}

const rotuloUltimaVisita = (data) => {
  const dias = diasEntre(data, hoje.value)

  if (dias <= 0) return 'Hoje'
  if (dias === 1) return 'Ontem'
  if (dias <= 14) return `Há ${dias} dias`

  return formatarDataBR(data)
}

const clientesRecentes = computed(() => {
  const mapa = new Map()

  agendamentos.value
    .filter((item) => item.status === 'concluido')
    .forEach((item) => {
      const atual = mapa.get(item.cliente_id) || {
        id: item.cliente_id,
        nome: item.cliente,
        ultimaData: item.dataInicio,
        visitas: 0,
      }

      atual.visitas += 1

      if (item.dataInicio > atual.ultimaData) atual.ultimaData = item.dataInicio

      mapa.set(item.cliente_id, atual)
    })

  return [...mapa.values()]
    .sort((a, b) => (a.ultimaData < b.ultimaData ? 1 : a.ultimaData > b.ultimaData ? -1 : 0))
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      nome: item.nome,
      ultimaVisita: rotuloUltimaVisita(item.ultimaData),
      visitas: item.visitas,
    }))
})

const carregarPainel = () =>
  carregarAgendamentos({
    data_inicio: somarDias(hoje.value, -JANELA_DIAS),
    data_fim: hoje.value,
  })

const dispararToast = (mensagem, tipo = 'success') => {
  clearTimeout(toastTimer)

  toast.value = { show: true, message: mensagem, type: tipo }

  toastTimer = setTimeout(() => {
    toast.value.show = false
  }, 3500)
}

const receberNotificacao = ({ message, type }) => dispararToast(message, type)

const abrirModalCliente = () => {
  isModalOpen.value = true
}

const fecharModal = () => {
  isModalOpen.value = false
}

const salvarCliente = async (dados) => {
  const payload = {
    nome_completo: dados.nome,
    cpf: String(dados.cpf || '').replace(/\D/g, ''),
    telefone: String(dados.telefone || '').replace(/\D/g, ''),
    cep: String(dados.cep || '').replace(/\D/g, ''),
    numero_endereco: dados.numero,
    status_cadastro: dados.status_cadastro,
  }

  try {
    await criarCliente(payload)
    dispararToast('Cliente cadastrado com sucesso!')
    fecharModal()
    await carregarCadastros()
  } catch (erro) {
    const dadosErro = erro.response?.data
    const mensagem = dadosErro
      ? Object.values(dadosErro).flat(Infinity).find((valor) => typeof valor === 'string')
      : ''

    dispararToast(mensagem || 'Erro ao processar solicitação.', 'error')
  }
}

const abrirModalAgendamento = () => {
  alertaForm.value = null
  formAgendamento.value = {
    ...preencherFormVazio(),
    dataInicio: hoje.value,
    dataFim: hoje.value,
  }
  isModalAgendamentoOpen.value = true
}

const fecharModalAgendamento = () => {
  isModalAgendamentoOpen.value = false
  alertaForm.value = null
}

const salvarNovoAgendamento = async () => {
  alertaForm.value = null

  const resultado = await salvarAgendamento(formAgendamento.value, null)

  if (!resultado.ok) {
    alertaForm.value = resultado.erro
    return
  }

  dispararToast('Atendimento agendado com sucesso!')
  fecharModalAgendamento()
  await carregarPainel()
}

watch(hoje, (atual, anterior) => {
  if (atual !== anterior) carregarPainel()
})

onMounted(() => {
  carregarCadastros()
  carregarPainel()
})

onBeforeUnmount(() => {
  clearTimeout(toastTimer)
})
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  min-width: 0;
}

.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(340px, 1fr);
  gap: 1.5rem;
}

.status-banner {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  color: #4b5563;
  font-size: 0.85rem;
}

.status-banner.erro {
  border-color: #fecaca;
  background: #fef2f2;
  color: #991b1b;
}

.banner-acao {
  margin-left: auto;
  padding: 0.45rem 0.85rem;
  border: 1px solid currentColor;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.toast-notification {
  position: fixed;
  right: 2rem;
  bottom: 2rem;
  z-index: 3000;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-left: 4px solid #1ca4a7;
  border-radius: 10px;
  background: #1f2937;
  color: #ffffff;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
}

.toast-notification.error {
  border-left-color: #ef4444;
}

.toast-notification i {
  color: #1ca4a7;
  font-size: 1.2rem;
}

.toast-notification.error i {
  color: #ef4444;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    gap: 1rem;
  }

  .content-grid {
    gap: 1rem;
  }

  .toast-notification {
    right: 1rem;
    bottom: 1rem;
  }
}
</style>