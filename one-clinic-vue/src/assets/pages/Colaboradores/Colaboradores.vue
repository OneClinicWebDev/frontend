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
            <i class="pi pi-plus"></i> Novo Colaborador
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
        <StatCard :number="totalColaboradores" label="Total de Colaboradores" />
        <StatCard :number="colaboradoresAtivos" label="Equipe Ativa" />
        <StatCard :number="colaboradoresFerias" label="Em Férias" />
      </div>

      <TransitionGroup name="list" tag="div" class="collaborators-grid">
        <ColaboradorCard
          v-for="colaborador in colaboradoresFiltrados"
          :key="colaborador.id"
          :colaborador="colaborador"
          @detalhes="abrirModalDetalhes"
          @editar="abrirModalEdicao"
          @toggle-status="alternarStatus"
        />
      </TransitionGroup>

      <div v-if="colaboradoresFiltrados.length === 0" class="empty-state">
        <i class="pi pi-users empty-icon"></i>
        <p>Nenhum colaborador encontrado.</p>
      </div>
    </main>

    <ColaboradorModal
      :is-open="isModalOpen"
      :mode="modalMode"
      :colaborador-edicao="colaboradorSelecionado"
      @close="fecharModal"
      @save="salvarColaborador"
    />

    <Transition name="toast">
      <div v-if="toast.show" class="toast-notification">
        <i class="pi pi-check-circle"></i>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { store } from "@/store.js";
import StatCard from "../../layouts/Components/StatCard.vue";
import ColaboradorCard from "./components/ColaboradorCard.vue";
import ColaboradorModal from "./components/ColaboradorModal.vue";

const searchQuery = ref("");
const camposAtivos = ref(["nome"]);
const filtroStatus = ref("todos");
const isModalOpen = ref(false);
const modalMode = ref("criar");
const colaboradorSelecionado = ref(null);
const toast = ref({ show: false, message: "" });

const camposBusca = [
  { label: "Nome", value: "nome" },
  { label: "CPF", value: "cpf" },
  { label: "Função", value: "funcao" },
  { label: "Especialidade", value: "especialidade" },
];

const statusBusca = [
  { label: "Todos", value: "todos" },
  { label: "Ativos", value: "ativo" },
  { label: "Inativos", value: "inativo" },
  { label: "Férias", value: "ferias" },
];

const totalColaboradores = computed(() => store.colaboradores.length);
const colaboradoresAtivos = computed(
  () => store.colaboradores.filter((c) => c.status === "ativo").length
);
const colaboradoresFerias = computed(
  () => store.colaboradores.filter((c) => c.status === "ferias").length
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
    camposAtivos.value.length > 1 ||
    (camposAtivos.value.length === 1 && camposAtivos.value[0] !== "nome") ||
    filtroStatus.value !== "todos"
  );
});

const toggleCampo = (campo) => {
  const index = camposAtivos.value.indexOf(campo);
  if (index === -1) {
    camposAtivos.value.push(campo);
  } else {
    if (camposAtivos.value.length > 1) {
      camposAtivos.value.splice(index, 1);
    }
  }
};

const limparFiltros = () => {
  camposAtivos.value = ["nome"];
  filtroStatus.value = "todos";
  searchQuery.value = "";
};

const colaboradoresFiltrados = computed(() => {
  let resultado = store.colaboradores;
  if (filtroStatus.value !== "todos")
    resultado = resultado.filter((c) => c.status === filtroStatus.value);
  if (!searchQuery.value || camposAtivos.value.length === 0) return resultado;
  const queryLimpa = searchQuery.value.toLowerCase().replace(/\D/g, "");
  const queryNormal = searchQuery.value.toLowerCase();
  return resultado.filter((c) => {
    return camposAtivos.value.some((campo) => {
      if (campo === "cpf") {
        const valorLimpo = String(c[campo] || "").replace(/\D/g, "");
        return valorLimpo.includes(queryLimpa) || valorLimpo.includes(queryNormal);
      }
      return String(c[campo] || "").toLowerCase().includes(queryNormal);
    });
  });
});

const dispararToast = (mensagem) => {
  toast.value.message = mensagem;
  toast.value.show = true;
  setTimeout(() => {
    toast.value.show = false;
  }, 3500);
};

const abrirModalCriacao = () => {
  modalMode.value = "criar";
  colaboradorSelecionado.value = null;
  isModalOpen.value = true;
};

const abrirModalEdicao = (colaborador) => {
  modalMode.value = "editar";
  colaboradorSelecionado.value = colaborador;
  isModalOpen.value = true;
};

const abrirModalDetalhes = (colaborador) => {
  modalMode.value = "detalhes";
  colaboradorSelecionado.value = colaborador;
  isModalOpen.value = true;
};

const fecharModal = () => {
  isModalOpen.value = false;
  colaboradorSelecionado.value = null;
};

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

const salvarColaborador = (dados) => {
  if (dados.id) {
    const index = store.colaboradores.findIndex((c) => c.id === dados.id);
    if (index !== -1) {
      store.colaboradores[index] = { ...dados, iniciais: gerarIniciais(dados.nome) };
      dispararToast(`Colaborador "${dados.nome}" atualizado!`);
    }
  } else {
    const novo = {
      ...dados,
      id: Date.now(),
      iniciais: gerarIniciais(dados.nome),
      criadoEm: obterTimestamp(),
    };
    store.colaboradores.unshift(novo);
    dispararToast(`Colaborador "${dados.nome}" cadastrado!`);
  }
};

const alternarStatus = (colaborador) => {
  const index = store.colaboradores.findIndex((c) => c.id === colaborador.id);
  if (index !== -1) {
    const novoStatus = store.colaboradores[index].status === "ativo" ? "inativo" : "ativo";
    store.colaboradores[index].status = novoStatus;
    if (novoStatus === "inativo") {
      store.colaboradores[index].demissao = new Date().toLocaleDateString("pt-BR");
    } else {
      store.colaboradores[index].demissao = "";
    }
    dispararToast(`Colaborador "${colaborador.nome}" alterado para ${novoStatus}.`);
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.page-container {
  min-height: 100vh;
  background-color: #F8FAFC;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', sans-serif;
}
.page-content {
  padding: 2rem;
  flex-grow: 1;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
}
.action-panel {
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #F1F5F9;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.search-input-wrapper {
  position: relative;
  flex-grow: 1;
  max-width: 600px;
  width: 100%;
}
.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94A3B8;
  font-size: 1.1rem;
}
.search-input {
  width: 100%;
  padding: 0.85rem 1rem 0.85rem 3rem;
  border: 1px solid #E2E8F0;
  border-radius: 12px;
  outline: none;
  font-size: 1rem;
  color: #334155;
  background-color: #F8FAFC;
  transition: all 0.3s ease;
  font-family: inherit;
}
.search-input:focus {
  border-color: #1CA4A7;
  background-color: #FFFFFF;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.1);
}
.btn-novo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #1CA4A7;
  color: #FFFFFF;
  padding: 0.85rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  font-family: inherit;
}
.btn-novo:hover {
  background-color: #158A8D;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.2);
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
  gap: 0.75rem;
}
.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748B;
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
  background-color: #F8FAFC;
  border: 1px solid #E2E8F0;
  color: #64748B;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.chip:hover {
  border-color: #1CA4A7;
  color: #1CA4A7;
  background-color: #F0FDFD;
}
.chip.active {
  background-color: #1CA4A7;
  border-color: #1CA4A7;
  color: #FFFFFF;
}
.chip-status.active {
  background-color: #334155;
  border-color: #334155;
  color: #FFFFFF;
}
.divider {
  width: 1px;
  height: 24px;
  background-color: #E2E8F0;
}
.btn-limpar {
  background: none;
  border: none;
  color: #EF4444;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
  transition: background-color 0.2s;
}
.btn-limpar:hover {
  background-color: #FEF2F2;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.collaborators-grid {
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
  color: #64748B;
  gap: 1rem;
  background: #FFFFFF;
  border-radius: 16px;
  border: 1px dashed #CBD5E1;
}
.empty-icon {
  font-size: 3rem;
  color: #CBD5E1;
}
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #334155;
  color: #FFFFFF;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
  border-left: 4px solid #1CA4A7;
  z-index: 3000;
  font-weight: 500;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.4s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

@media (max-width: 992px) {
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
}

@media (max-width: 768px) {
  .page-content {
    padding: 1rem;
  }
  .filters-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
  }
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }
  .divider {
    display: none;
  }
  .btn-limpar {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
}
</style>