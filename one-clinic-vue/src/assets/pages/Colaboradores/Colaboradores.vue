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
        <i class="pi pi-users"></i>
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
  { label: "Cargo", value: "cargo" },
  { label: "Departamento", value: "departamento" },
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
        const valorLimpo = String(c[campo]).replace(/\D/g, "");
        return valorLimpo.includes(queryLimpa) || valorLimpo.includes(queryNormal);
      }
      return String(c[campo]).toLowerCase().includes(queryNormal);
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
    const novoStatus =
      store.colaboradores[index].status === "ativo" ? "inativo" : "ativo";
    store.colaboradores[index].status = novoStatus;
    dispararToast(`Colaborador "${colaborador.nome}" alterado para ${novoStatus}.`);
  }
};
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
  color: #6b7280;
  opacity: 0.6;
  gap: 0.5rem;
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
</style>
