<template>
  <div class="page-container">
    <main class="page-content">
      <div class="action-panel">
        <div class="top-row">
          <div class="search-input-wrapper">
            <i class="pi pi-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              :placeholder="placeholderBusca"
              class="search-input"
            />
          </div>
          <button class="btn-novo" @click="abrirModalCriacao">
            <i class="pi pi-plus"></i> Novo Atendimento
          </button>
        </div>

        <div class="filters-row">
          <div class="filter-group">
            <span class="filter-label"><i class="pi pi-filter"></i> Buscar em:</span>
            <div class="chips-container">
              <button
                v-for="campo in camposBusca"
                :key="campo.value"
                :class="['chip', { active: camposAtivos.includes(campo.value) }]"
                @click="toggleCampo(campo.value)"
              >
                {{ campo.label }}
              </button>
            </div>
          </div>
          <div class="divider"></div>
          <div class="filter-group">
            <span class="filter-label"><i class="pi pi-check-circle"></i> Status:</span>
            <div class="chips-container">
              <button
                v-for="status in statusBusca"
                :key="status.value"
                :class="['chip chip-status', { active: filtroStatus === status.value }]"
                @click="filtroStatus = status.value"
              >
                {{ status.label }}
              </button>
            </div>
          </div>
          <button class="btn-limpar" @click="limparFiltros" v-if="temFiltroAtivo">
            <i class="pi pi-filter-slash"></i> Limpar
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-number">{{ totalFiltrados }}</span>
          <span class="stat-label">Atendimentos na Seleção</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ atendimentosHoje }}</span>
          <span class="stat-label">Agendados para Hoje</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ atendimentosAndamento }}</span>
          <span class="stat-label">Em Andamento</span>
        </div>
      </div>

      <TransitionGroup name="list" tag="div" class="atendimentos-grid">
        <div 
          v-for="atendimento in atendimentosFiltrados" 
          :key="atendimento.id" 
          class="atendimento-card"
          @dblclick="abrirModalDetalhes(atendimento)"
        >
          <div class="card-header">
            <div class="header-datetime">
              <i class="pi pi-calendar"></i>
              <span class="date">{{ atendimento.data }}</span>
              <span class="time-badge">
                <i class="pi pi-clock"></i> {{ atendimento.hora }}
              </span>
            </div>
            
            <div class="menu-container">
              <button class="btn-dots" @click.stop="toggleMenu(atendimento.id)">
                <i class="pi pi-ellipsis-v"></i>
              </button>
              
              <div class="dropdown-menu" v-if="activeMenuId === atendimento.id">
                <button class="dropdown-item" @click.stop="abrirModalDetalhes(atendimento)">
                  <i class="pi pi-eye"></i> Ver detalhes
                </button>
                <button class="dropdown-item" @click.stop="abrirModalEdicao(atendimento)">
                  <i class="pi pi-pencil"></i> Editar
                </button>
                <div class="dropdown-divider"></div>
                
                <button class="dropdown-item" v-if="atendimento.status === 'agendado'" @click.stop="alterarStatusAtendimento(atendimento, 'andamento')">
                  <i class="pi pi-play" style="color: #0369A1"></i> Iniciar
                </button>
                <button class="dropdown-item" v-if="atendimento.status === 'andamento'" @click.stop="alterarStatusAtendimento(atendimento, 'concluido')">
                  <i class="pi pi-check" style="color: #047857"></i> Finalizar
                </button>
                <button class="dropdown-item" v-if="['agendado', 'andamento'].includes(atendimento.status)" @click.stop="alterarStatusAtendimento(atendimento, 'cancelado')">
                  <i class="pi pi-times" style="color: #BE123C"></i> Cancelar
                </button>
              </div>
            </div>
          </div>

          <div class="client-info">
            <div class="client-avatar">{{ atendimento.iniciais }}</div>
            <div class="client-details">
              <h3 class="client-name">{{ atendimento.cliente }}</h3>
              <span class="client-phone"><i class="pi pi-phone"></i> {{ atendimento.telefone }}</span>
            </div>
          </div>

          <div class="service-details">
            <div class="detail-row">
              <i class="pi pi-file"></i>
              <span class="font-semibold">{{ atendimento.procedimento }}</span>
            </div>
            <div class="detail-row">
              <i class="pi pi-user-plus"></i>
              <span>{{ atendimento.profissional }}</span>
            </div>
          </div>

          <hr class="card-divider" />

          <div class="card-footer">
            <div class="footer-info">
              <span :class="['status-badge', getBadgeClass(atendimento.status)]">
                {{ formatStatus(atendimento.status) }}
              </span>
            </div>
            <div class="footer-info text-right" v-if="atendimento.valor">
              <span class="info-label">Valor Estimado</span>
              <span class="info-value text-sm">R$ {{ atendimento.valor }}</span>
            </div>
          </div>
        </div>
      </TransitionGroup>

      <div v-if="atendimentosFiltrados.length === 0" class="empty-state">
        <i class="pi pi-calendar-times"></i>
        <p>Nenhum atendimento encontrado com os filtros atuais.</p>
      </div>
    </main>

    <Transition name="fade">
      <div class="modal-overlay" v-if="isModalOpen" @click.self="fecharModal">
        <Transition name="scale">
          <div class="modal-container" v-if="isModalOpen">
            <header class="modal-header">
              <h3>{{ tituloModal }}</h3>
              <button class="btn-close" @click="fecharModal">
                <i class="pi pi-times"></i>
              </button>
            </header>

            <form @submit.prevent="salvarAtendimento" class="modal-form">
              <div class="form-row">
                <div class="form-group flex-1">
                  <label>Nome do Cliente</label>
                  <input 
                    type="text" 
                    v-model="form.cliente" 
                    required 
                    minlength="3"
                    :disabled="isDetalhes"
                    placeholder="Ex: Maria Oliveira" 
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
                  <label>Procedimento</label>
                  <input 
                    type="text" 
                    v-model="form.procedimento" 
                    required 
                    :disabled="isDetalhes"
                    placeholder="Ex: Limpeza de Pele" 
                  />
                </div>
                <div class="form-group flex-1">
                  <label>Profissional Responsável</label>
                  <input 
                    type="text" 
                    v-model="form.profissional" 
                    required 
                    :disabled="isDetalhes"
                    placeholder="Ex: Dra. Ana" 
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label>Data</label>
                  <input 
                    type="date" 
                    v-model="form.data" 
                    required 
                    :disabled="isDetalhes"
                  />
                </div>
                <div class="form-group flex-1">
                  <label>Horário</label>
                  <input 
                    type="time" 
                    v-model="form.hora" 
                    required 
                    :disabled="isDetalhes"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group flex-1">
                  <label>Valor (R$)</label>
                  <input 
                    type="text" 
                    v-model="form.valor" 
                    :disabled="isDetalhes"
                    placeholder="0,00" 
                  />
                </div>
                <div class="form-group flex-1">
                  <label>Status</label>
                  <select v-model="form.status" :disabled="isDetalhes">
                    <option value="agendado">Agendado</option>
                    <option value="andamento">Em Andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
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
                <input 
                  type="text" 
                  v-model="form.criadoEm" 
                  disabled 
                  class="bg-gray"
                />
              </div>

              <footer class="modal-footer">
                <button type="button" class="btn-cancelar" @click="fecharModal">
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

    <Transition name="toast">
      <div v-if="toast.show" class="toast-notification">
        <i class="pi pi-check-circle"></i>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

const searchQuery = ref("");
const camposAtivos = ref(["cliente", "procedimento"]);
const filtroStatus = ref("todos");
const toast = ref({ show: false, message: "" });
const activeMenuId = ref(null);

const isModalOpen = ref(false);
const modalMode = ref("criar");
const atendimentoEdicaoId = ref(null);
const exibicaoTelefone = ref('');
const form = ref({
  cliente: '', telefone: '', procedimento: '', profissional: '', 
  data: '', hora: '', valor: '', status: 'agendado', observacao: '', criadoEm: ''
});

const camposBusca = [
  { label: "Cliente", value: "cliente" },
  { label: "Procedimento", value: "procedimento" },
  { label: "Profissional", value: "profissional" },
];

const statusBusca = [
  { label: "Todos", value: "todos" },
  { label: "Agendados", value: "agendado" },
  { label: "Em Andamento", value: "andamento" },
  { label: "Concluídos", value: "concluido" },
  { label: "Cancelados", value: "cancelado" },
];

const atendimentos = ref([
  {
    id: 1,
    iniciais: "AS",
    cliente: "Ana Silva",
    telefone: "(11) 98765-4321",
    procedimento: "Limpeza de Pele",
    profissional: "Dra. Maria",
    data: new Date().toLocaleDateString('pt-BR'),
    hora: "09:00",
    status: "concluido",
    observacao: "Recomendado retorno em 30 dias.",
    valor: "150,00",
    criadoEm: "10/01/2026 14:22 GMT-3",
  },
  {
    id: 2,
    iniciais: "CS",
    cliente: "Carla Santos",
    telefone: "(11) 97654-3210",
    procedimento: "Aplicação de Botox",
    profissional: "Dr. Paulo",
    data: new Date().toLocaleDateString('pt-BR'),
    hora: "10:30",
    status: "andamento",
    observacao: "Região frontal e periorbital.",
    valor: "850,00",
    criadoEm: "01/03/2026 09:15 GMT-3",
  },
  {
    id: 3,
    iniciais: "JL",
    cliente: "Julia Lima",
    telefone: "(11) 96543-2109",
    procedimento: "Peeling Químico",
    profissional: "Dra. Maria",
    data: "15/06/2026",
    hora: "14:00",
    status: "agendado",
    observacao: "Segunda sessão.",
    valor: "200,00",
    criadoEm: "15/02/2026 17:40 GMT-3",
  },
  {
    id: 4,
    iniciais: "RA",
    cliente: "Rafael Almeida",
    telefone: "(11) 91234-5678",
    procedimento: "Microagulhamento",
    profissional: "Dra. Ana",
    data: "20/06/2026",
    hora: "16:00",
    status: "agendado",
    observacao: "Tratamento para cicatrizes de acne.",
    valor: "300,00",
    criadoEm: "10/05/2026 10:10 GMT-3",
  }
]);

const hojeFormatoBR = new Date().toLocaleDateString('pt-BR');

const totalFiltrados = computed(() => atendimentosFiltrados.value.length);
const atendimentosHoje = computed(() => atendimentos.value.filter((a) => a.data === hojeFormatoBR && a.status !== 'cancelado').length);
const atendimentosAndamento = computed(() => atendimentos.value.filter((a) => a.status === "andamento").length);

const placeholderBusca = computed(() => {
  const campos = camposBusca.filter((c) => camposAtivos.value.includes(c.value)).map((c) => c.label);
  return `Buscar por ${campos.join(", ")}...`;
});

const temFiltroAtivo = computed(() => {
  return searchQuery.value.length > 0 || camposAtivos.value.length !== 2 || filtroStatus.value !== "todos";
});

const atendimentosFiltrados = computed(() => {
  let resultado = atendimentos.value;
  if (filtroStatus.value !== "todos") resultado = resultado.filter((a) => a.status === filtroStatus.value);
  if (!searchQuery.value || camposAtivos.value.length === 0) return resultado;
  const queryNormal = searchQuery.value.toLowerCase();
  
  return resultado.filter((a) => {
    return camposAtivos.value.some((campo) => String(a[campo]).toLowerCase().includes(queryNormal));
  });
});

const tituloModal = computed(() => {
  if (modalMode.value === 'detalhes') return 'Detalhes do Atendimento';
  if (modalMode.value === 'editar') return 'Editar Atendimento';
  return 'Novo Agendamento';
});

const isDetalhes = computed(() => modalMode.value === 'detalhes');

const toggleCampo = (campo) => {
  const index = camposAtivos.value.indexOf(campo);
  if (index === -1) {
    camposAtivos.value.push(campo);
  } else if (camposAtivos.value.length > 1) {
    camposAtivos.value.splice(index, 1);
  }
};

const limparFiltros = () => {
  camposAtivos.value = ["cliente", "procedimento"];
  filtroStatus.value = "todos";
  searchQuery.value = "";
};

const toggleMenu = (id) => {
  activeMenuId.value = activeMenuId.value === id ? null : id;
};

const fecharMenusGlobais = () => {
  activeMenuId.value = null;
};

const aplicarMascaraTelefone = (v) => {
  v = v.replace(/\D/g, '');
  if (v.length <= 11) {
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2');
    v = v.replace(/(\d)(\d{4})$/, '$1-$2');
  }
  return v;
};

const processarTelefone = (event) => {
  let num = event.target.value.replace(/\D/g, '').slice(0, 11);
  exibicaoTelefone.value = aplicarMascaraTelefone(num);
  form.value.telefone = exibicaoTelefone.value;
};

const formatarDataInput = (dataStr) => {
  if (!dataStr) return '';
  if (dataStr.includes('/')) {
    const [dia, mes, ano] = dataStr.split('/');
    return `${ano}-${mes}-${dia}`;
  }
  return dataStr;
};

const formatarDataVisualizacao = (dataStr) => {
  if (!dataStr) return '';
  if (dataStr.includes('-')) {
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  }
  return dataStr;
};

const gerarIniciais = (nome) => nome.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

const obterTimestamp = () => {
  const agora = new Date();
  return `${agora.toLocaleDateString("pt-BR")} ${agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} GMT-3`;
};

const getBadgeClass = (status) => {
  switch (status) {
    case 'agendado': return 'badge-agendado';
    case 'andamento': return 'badge-andamento';
    case 'concluido': return 'badge-concluido';
    case 'cancelado': return 'badge-cancelado';
    default: return 'badge-default';
  }
};

const formatStatus = (status) => {
  switch (status) {
    case 'agendado': return 'Agendado';
    case 'andamento': return 'Em Andamento';
    case 'concluido': return 'Concluído';
    case 'cancelado': return 'Cancelado';
    default: return status;
  }
};

const preencherFormulario = (atendimento = null) => {
  if (atendimento) {
    form.value = { ...atendimento, data: formatarDataInput(atendimento.data) };
    exibicaoTelefone.value = atendimento.telefone;
    atendimentoEdicaoId.value = atendimento.id;
  } else {
    form.value = { cliente: '', telefone: '', procedimento: '', profissional: '', data: '', hora: '', valor: '', status: 'agendado', observacao: '', criadoEm: '' };
    exibicaoTelefone.value = '';
    atendimentoEdicaoId.value = null;
  }
};

const abrirModalCriacao = () => {
  modalMode.value = "criar";
  preencherFormulario();
  isModalOpen.value = true;
};

const abrirModalEdicao = (atendimento) => {
  modalMode.value = "editar";
  preencherFormulario(atendimento);
  isModalOpen.value = true;
  fecharMenusGlobais();
};

const abrirModalDetalhes = (atendimento) => {
  modalMode.value = "detalhes";
  preencherFormulario(atendimento);
  isModalOpen.value = true;
  fecharMenusGlobais();
};

const fecharModal = () => {
  isModalOpen.value = false;
  atendimentoEdicaoId.value = null;
};

const dispararToast = (mensagem) => {
  toast.value.message = mensagem;
  toast.value.show = true;
  setTimeout(() => { toast.value.show = false; }, 3500);
};

const salvarAtendimento = () => {
  if (isDetalhes.value) return;
  
  const dadosSalvos = {
    ...form.value,
    data: formatarDataVisualizacao(form.value.data)
  };

  if (atendimentoEdicaoId.value) {
    const index = atendimentos.value.findIndex((a) => a.id === atendimentoEdicaoId.value);
    if (index !== -1) {
      atendimentos.value[index] = { ...dadosSalvos, id: atendimentoEdicaoId.value, iniciais: gerarIniciais(dadosSalvos.cliente) };
      dispararToast(`Atendimento de "${dadosSalvos.cliente}" atualizado!`);
    }
  } else {
    const novo = {
      ...dadosSalvos,
      id: Date.now(),
      iniciais: gerarIniciais(dadosSalvos.cliente),
      criadoEm: obterTimestamp(),
    };
    atendimentos.value.unshift(novo);
    dispararToast(`Atendimento para "${dadosSalvos.cliente}" agendado com sucesso!`);
  }
  fecharModal();
};

const alterarStatusAtendimento = (atendimento, novoStatus) => {
  const index = atendimentos.value.findIndex((a) => a.id === atendimento.id);
  if (index !== -1) {
    atendimentos.value[index].status = novoStatus;
    const mensagens = { agendado: 'reagendado', andamento: 'iniciado', concluido: 'finalizado', cancelado: 'cancelado' };
    dispararToast(`Atendimento de "${atendimento.cliente}" ${mensagens[novoStatus]}.`);
  }
  fecharMenusGlobais();
};

onMounted(() => {
  window.addEventListener('click', fecharMenusGlobais);
});

onUnmounted(() => {
  window.removeEventListener('click', fecharMenusGlobais);
});
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
}
.page-content {
  padding: 2rem;
  flex-grow: 1;
}
.action-panel {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.search-input-wrapper {
  position: relative;
  flex-grow: 1;
  max-width: 600px;
}
.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  opacity: 0.6;
  font-size: 1.1rem;
}
.search-input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 3rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  outline: none;
  font-size: 1rem;
  color: #1f2937;
  background-color: #f9fafb;
  transition: all 0.3s ease;
}
.search-input:focus {
  border-color: #1ca4a7;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.1);
}
.btn-novo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #1ca4a7;
  color: #ffffff;
  padding: 0.85rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}
.btn-novo:hover {
  background-color: #158a8d;
  transform: translateY(-2px);
}
.filters-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}
.filter-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.chip {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  color: #6b7280;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.chip:hover {
  border-color: #1ca4a7;
  color: #1ca4a7;
}
.chip.active {
  background-color: #1ca4a7;
  border-color: #1ca4a7;
  color: #ffffff;
}
.chip-status.active {
  background-color: #1f2937;
  border-color: #1f2937;
  color: #ffffff;
}
.divider {
  width: 1px;
  height: 24px;
  background-color: #e5e7eb;
}
.btn-limpar {
  background: none;
  border: none;
  color: #dc2626;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.stat-card {
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}
.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.atendimentos-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6b7280;
  opacity: 0.6;
  gap: 0.5rem;
  grid-column: 1 / -1;
}
.empty-state i {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.atendimento-card {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.atendimento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.12);
  border-color: #d1d5db;
}
.atendimento-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: transparent;
  transition: all 0.3s ease;
}
.atendimento-card:hover::before {
  background-color: #1CA4A7;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.header-datetime {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4B5563;
  font-weight: 600;
  font-size: 0.85rem;
}
.header-datetime i {
  color: #1CA4A7;
}
.time-badge {
  background-color: #F3F4F6;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.time-badge i {
  color: #6B7280;
  font-size: 0.75rem;
}
.client-info {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}
.client-avatar {
  width: 40px;
  height: 40px;
  background-color: #E0F2F1;
  color: #00796B;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}
.client-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.15rem 0;
}
.client-phone {
  font-size: 0.8rem;
  color: #6B7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
.service-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  background-color: #F9FAFB;
  padding: 0.75rem;
  border-radius: 8px;
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4B5563;
  font-size: 0.85rem;
}
.font-semibold {
  font-weight: 600;
  color: #1F2937;
}
.detail-row i {
  color: #9CA3AF;
  font-size: 0.9rem;
  width: 14px;
  text-align: center;
}
.card-divider {
  border: 0;
  border-top: 1px solid #E5E7EB;
  margin: 0 0 1rem 0;
}
.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.badge-agendado { background-color: #E0F2FE; color: #0369A1; }
.badge-andamento { background-color: #FEF3C7; color: #92400E; }
.badge-concluido { background-color: #DEF7EC; color: #03543F; }
.badge-cancelado { background-color: #FFE4E6; color: #BE123C; }

.footer-info {
  display: flex;
  flex-direction: column;
}
.text-right {
  align-items: flex-end;
}
.info-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: #6B7280;
  margin-bottom: 0.15rem;
}
.info-value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1F2937;
}

.menu-container {
  position: relative;
}
.btn-dots {
  background: none;
  border: none;
  color: #6B7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}
.btn-dots:hover {
  color: #1F2937;
  background-color: #F9FAFB;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  min-width: 160px;
  z-index: 10;
  transform-origin: top right;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  text-align: left;
  font-size: 0.85rem;
  font-weight: 500;
  color: #1F2937;
  cursor: pointer;
  transition: all 0.2s ease;
}
.dropdown-item:hover {
  background-color: #F9FAFB;
  color: #1CA4A7;
}
.dropdown-divider {
  height: 1px;
  background-color: #E5E7EB;
  margin: 0.25rem 0;
}

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
  width: 90%;
  max-width: 600px;
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
  max-height: 80vh;
  overflow-y: auto;
}
.form-row {
  display: flex;
  gap: 1rem;
}
.flex-1 { flex: 1; }
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
.form-group select,
.textarea-custom {
  padding: 0.75rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  outline: none;
  font-size: 0.95rem;
  color: #1F2937;
  transition: all 0.2s ease;
  background-color: #FFFFFF;
  font-family: inherit;
}
.form-group input:focus,
.form-group select:focus,
.textarea-custom:focus {
  border-color: #1CA4A7;
  box-shadow: 0 0 0 3px rgba(28, 164, 167, 0.1);
}
.form-group input:disabled,
.form-group select:disabled,
.textarea-custom:disabled,
.bg-gray {
  background-color: #F9FAFB;
  color: #9CA3AF;
  cursor: not-allowed;
  border-color: #E5E7EB;
}
.textarea-custom {
  resize: vertical;
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

.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #1f2937;
  color: #ffffff;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
  border-left: 4px solid #1ca4a7;
  z-index: 3000;
}
.list-enter-active,
.list-leave-active { transition: all 0.4s ease; }
.list-enter-from,
.list-leave-to { opacity: 0; transform: translateY(20px); }
.list-leave-active { position: absolute; }
.fade-enter-active,
.fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
.scale-enter-active,
.scale-leave-active { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.scale-enter-from,
.scale-leave-to { transform: scale(0.95); }
.toast-enter-active,
.toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from,
.toast-leave-to { opacity: 0; transform: translateY(20px); }

@media (max-width: 1280px) {
  .atendimentos-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1024px) {
  .atendimentos-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .page-content {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .atendimentos-grid {
    grid-template-columns: 1fr;
  }

  .top-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input-wrapper {
    max-width: 100%;
  }

  .btn-novo {
    justify-content: center;
  }

  .filters-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .divider {
    display: none;
  }

  .btn-limpar {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }

  .form-row {
    flex-direction: column;
  }
  
  .modal-form {
    padding: 1rem;
  }
}
</style>