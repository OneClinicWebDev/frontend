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
        <AtendimentoCard
          v-for="atendimento in atendimentosFiltrados"
          :key="atendimento.id"
          :atendimento="atendimento"
          @detalhes="abrirModalDetalhes"
          @editar="abrirModalEdicao"
          @alterar-status="alterarStatusAtendimento"
        />
      </TransitionGroup>

      <div v-if="atendimentosFiltrados.length === 0" class="empty-state">
        <i class="pi pi-calendar-times empty-icon"></i>
        <p>Nenhum atendimento encontrado com os filtros atuais.</p>
      </div>
    </main>

    <AtendimentoModal
      :is-open="isModalOpen"
      :mode="modalMode"
      :atendimento-edicao="atendimentoSelecionado"
      @close="fecharModal"
      @save="salvarAtendimento"
      @notify="handleNotify"
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
import { ref, computed } from "vue";
import AtendimentoCard from "./components/AtendimentoCard.vue";
import AtendimentoModal from "./components/AtendimentoModal.vue";

const searchQuery = ref("");
const camposAtivos = ref(["cliente", "procedimento"]);
const filtroStatus = ref("todos");
const toast = ref({ show: false, message: "", type: "success" });

const isModalOpen = ref(false);
const modalMode = ref("criar");
const atendimentoSelecionado = ref(null);

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

// O ideal é passar isso para a sua store.js de forma definitiva futuramente
const atendimentos = ref([
  {
    id: "1a",
    iniciais: "AS",
    cliente: "Ana Silva",
    telefone: "(11) 98765-4321",
    procedimento: "Limpeza de Pele",
    profissional: "Dra. Maria",
    data: new Date().toLocaleDateString("pt-BR"),
    hora: "09:00",
    status: "concluido",
    observacao: "Recomendado retorno em 30 dias.",
    valor: "150,00",
    criadoEm: "10/01/2026 14:22 GMT-3",
  },
  {
    id: "2b",
    iniciais: "CS",
    cliente: "Carla Santos",
    telefone: "(11) 97654-3210",
    procedimento: "Aplicação de Botox",
    profissional: "Dr. Paulo",
    data: new Date().toLocaleDateString("pt-BR"),
    hora: "10:30",
    status: "andamento",
    observacao: "Região frontal e periorbital.",
    valor: "850,00",
    criadoEm: "01/03/2026 09:15 GMT-3",
  },
]);

const hojeFormatoBR = new Date().toLocaleDateString("pt-BR");

const totalFiltrados = computed(() => atendimentosFiltrados.value.length);
const atendimentosHoje = computed(
  () =>
    atendimentos.value.filter((a) => a.data === hojeFormatoBR && a.status !== "cancelado")
      .length
);
const atendimentosAndamento = computed(
  () => atendimentos.value.filter((a) => a.status === "andamento").length
);

const placeholderBusca = computed(() => {
  const campos = camposBusca
    .filter((c) => camposAtivos.value.includes(c.value))
    .map((c) => c.label);
  return `Buscar por ${campos.join(", ")}...`;
});

const temFiltroAtivo = computed(() => {
  return (
    searchQuery.value.length > 0 ||
    camposAtivos.value.length !== 2 ||
    filtroStatus.value !== "todos"
  );
});

const atendimentosFiltrados = computed(() => {
  let resultado = atendimentos.value;
  if (filtroStatus.value !== "todos")
    resultado = resultado.filter((a) => a.status === filtroStatus.value);
  if (!searchQuery.value || camposAtivos.value.length === 0) return resultado;
  const queryNormal = searchQuery.value.toLowerCase();

  return resultado.filter((a) => {
    return camposAtivos.value.some((campo) =>
      String(a[campo]).toLowerCase().includes(queryNormal)
    );
  });
});

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

const dispararToast = (mensagem, tipo = "success") => {
  toast.value.message = mensagem;
  toast.value.type = tipo;
  toast.value.show = true;
  setTimeout(() => {
    toast.value.show = false;
  }, 3500);
};

const handleNotify = ({ message, type }) => dispararToast(message, type);

const gerarIniciais = (nome) =>
  nome
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const obterTimestamp = () => {
  const agora = new Date();
  return `${agora.toLocaleDateString("pt-BR")} ${agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })} GMT-3`;
};

const gerarUUID = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Date.now().toString(36);
};

const abrirModalCriacao = () => {
  modalMode.value = "criar";
  atendimentoSelecionado.value = null;
  isModalOpen.value = true;
};

const abrirModalEdicao = (atendimento) => {
  modalMode.value = "editar";
  atendimentoSelecionado.value = atendimento;
  isModalOpen.value = true;
};

const abrirModalDetalhes = (atendimento) => {
  modalMode.value = "detalhes";
  atendimentoSelecionado.value = atendimento;
  isModalOpen.value = true;
};

const fecharModal = () => {
  isModalOpen.value = false;
  atendimentoSelecionado.value = null;
};

const salvarAtendimento = (dadosAtendimento) => {
  if (dadosAtendimento.id) {
    const index = atendimentos.value.findIndex((a) => a.id === dadosAtendimento.id);
    if (index !== -1) {
      atendimentos.value[index] = {
        ...dadosAtendimento,
        iniciais: gerarIniciais(dadosAtendimento.cliente),
      };
      dispararToast(`Atendimento de "${dadosAtendimento.cliente}" atualizado!`);
    }
  } else {
    const novo = {
      ...dadosAtendimento,
      id: gerarUUID(),
      iniciais: gerarIniciais(dadosAtendimento.cliente),
      criadoEm: obterTimestamp(),
    };
    atendimentos.value.unshift(novo);
    dispararToast(`Atendimento para "${dadosAtendimento.cliente}" agendado com sucesso!`);
  }
};

const alterarStatusAtendimento = (atendimento, novoStatus) => {
  const index = atendimentos.value.findIndex((a) => a.id === atendimento.id);
  if (index !== -1) {
    atendimentos.value[index].status = novoStatus;
    const mensagens = {
      agendado: "reagendado",
      andamento: "iniciado",
      concluido: "finalizado",
      cancelado: "cancelado",
    };
    const tiposToast = { andamento: "info", concluido: "success", cancelado: "error" };
    dispararToast(
      `Atendimento de "${atendimento.cliente}" ${mensagens[novoStatus]}.`,
      tiposToast[novoStatus] || "success"
    );
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.page-container {
  min-height: 100vh;
  background-color: #f9fafb;
  display: flex;
  flex-direction: column;
  font-family: "Inter", sans-serif;
}
.page-content {
  padding: 2rem;
  flex-grow: 1;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
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
  font-family: inherit;
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
  font-family: inherit;
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
  user-select: none;
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
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
}
.btn-limpar:hover {
  background-color: #fef2f2;
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
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
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
.empty-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
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
  border-left: 4px solid;
  z-index: 3000;
}
.toast-notification.success {
  border-left-color: #1ca4a7;
}
.toast-notification.success i {
  color: #1ca4a7;
  font-size: 1.2rem;
}
.toast-notification.error {
  border-left-color: #ef4444;
}
.toast-notification.error i {
  color: #ef4444;
  font-size: 1.2rem;
}
.toast-notification.info {
  border-left-color: #3b82f6;
}
.toast-notification.info i {
  color: #3b82f6;
  font-size: 1.2rem;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}
.list-leave-active {
  position: absolute;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

@media (max-width: 992px) {
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
  }
}

@media (max-width: 768px) {
  .page-content {
    padding: 1rem;
  }
  .top-row {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input-wrapper {
    max-width: 100%;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .btn-novo {
    justify-content: center;
  }
  .btn-limpar {
    width: 100%;
    justify-content: center;
  }
}
</style>
