<template>
  <div class="page-container">
    <main class="page-content">
      <div class="action-panel">
        <div class="top-row">
          <div class="search-input-wrapper">
            <i class="pi pi-search search-icon"></i>
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="placeholderBusca"
              class="search-input"
            />
          </div>
          <button class="btn-novo" :disabled="carregando" @click="abrirModalCriacao">
            <i class="pi pi-plus"></i>
            Novo Colaborador
          </button>
        </div>
        <div class="filters-row">
          <div class="filter-group">
            <span class="filter-label">
              <i class="pi pi-filter"></i>
              Buscar em:
            </span>
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
            <span class="filter-label">
              <i class="pi pi-check-circle"></i>
              Status:
            </span>
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
          <button v-if="temFiltroAtivo" class="btn-limpar" @click="limparFiltros">
            <i class="pi pi-filter-slash"></i>
            Limpar
          </button>
        </div>
      </div>
      <div class="stats-grid">
        <StatCard :number="colaboradores.length" label="Total de Colaboradores" />
        <StatCard :number="colaboradoresAtivos" label="Equipe Ativa" />
        <StatCard :number="colaboradoresInativos" label="Colaboradores Inativos" />
      </div>
      <div v-if="erroCarregamento" class="error-panel">
        <i class="pi pi-exclamation-circle"></i>
        <div>
          <strong>Não foi possível carregar os colaboradores</strong>
          <p>{{ erroCarregamento }}</p>
          <button class="btn-retry" @click="carregarColaboradores">
            Tentar novamente
          </button>
        </div>
      </div>
      <div v-else-if="carregando" class="loading-state">
        <i class="pi pi-spin pi-spinner"></i>
        <span>Carregando colaboradores...</span>
      </div>
      <TransitionGroup
        v-else
        name="list"
        tag="div"
        class="collaborators-grid"
      >
        <ColaboradorCard
          v-for="colaborador in colaboradoresFiltrados"
          :key="colaborador.id"
          :colaborador="colaborador"
          @detalhes="abrirModalDetalhes"
          @editar="abrirModalEdicao"
          @toggle-status="alternarStatus"
        />
      </TransitionGroup>
      <div
        v-if="!carregando && !erroCarregamento && colaboradoresFiltrados.length === 0"
        class="empty-state"
      >
        <i class="pi pi-users empty-icon"></i>
        <h3>Nenhum colaborador encontrado</h3>
        <p>
          {{ searchQuery || filtroStatus !== 'todos'
            ? 'Tente alterar os filtros da sua busca.'
            : 'Cadastre o primeiro colaborador desta clínica.' }}
        </p>
        <button
          v-if="!searchQuery && filtroStatus === 'todos'"
          class="btn-empty"
          @click="abrirModalCriacao"
        >
          <i class="pi pi-plus"></i>
          Cadastrar colaborador
        </button>
        <button v-else class="btn-empty btn-empty-secondary" @click="limparFiltros">
          Limpar filtros
        </button>
      </div>
    </main>
    <ColaboradorModal
      :is-open="isModalOpen"
      :mode="modalMode"
      :colaborador-edicao="colaboradorSelecionado"
      :tags-disponiveis="tagsDisponiveis"
      @close="fecharModal"
      @save="salvarColaborador"
    />
    <Transition name="toast">
      <div
        v-if="toast.show"
        :class="['toast-notification', toast.type]"
        role="status"
      >
        <i :class="toast.type === 'error'
          ? 'pi pi-exclamation-circle'
          : 'pi pi-check-circle'"></i>
        <span>{{ toast.message }}</span>
        <button class="toast-close" aria-label="Fechar notificação" @click="toast.show = false">
          <i class="pi pi-times"></i>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import api from "@/services/api.js";
import StatCard from "../../layouts/Components/StatCard.vue";
import ColaboradorCard from "./components/ColaboradorCard.vue";
import ColaboradorModal from "./components/ColaboradorModal.vue";

const ROLES = {
  ADMIN: 1,
  SECRETARIO: 2,
  PROFISSIONAL: 3,
};

const nomesFuncoes = {
  ADMIN: "Administrador",
  SECRETARIO: "Secretário(a)",
  PROFISSIONAL: "Profissional",
};

const colaboradores = ref([]);
const carregando = ref(false);
const erroCarregamento = ref("");
const searchQuery = ref("");
const camposAtivos = ref(["nome", "especialidades"]);
const filtroStatus = ref("todos");
const isModalOpen = ref(false);
const modalMode = ref("criar");
const colaboradorSelecionado = ref(null);
const toast = ref({ show: false, message: "", type: "success" });
let toastTimeout;

const camposBusca = [
  { label: "Nome", value: "nome" },
  { label: "Especialidade", value: "especialidades" },
];

const statusBusca = [
  { label: "Todos", value: "todos" },
  { label: "Ativos", value: "ativo" },
  { label: "Inativos", value: "inativo" },
];

const colaboradoresAtivos = computed(
  () => colaboradores.value.filter((c) => c.status === "ativo").length,
);

const colaboradoresInativos = computed(
  () => colaboradores.value.filter((c) => c.status === "inativo").length,
);

const tagsDisponiveis = computed(() => {
  const tags = new Set();
  colaboradores.value.forEach(c => {
    if (Array.isArray(c.especialidades)) {
      c.especialidades.forEach(tag => tags.add(tag));
    }
  });
  return Array.from(tags).sort();
});

const placeholderBusca = computed(() => {
  const campos = camposBusca
    .filter((campo) => camposAtivos.value.includes(campo.value))
    .map((campo) => campo.label.toLowerCase());
  return campos.length
    ? `Buscar por ${campos.join(" ou ")}...`
    : "Selecione um campo para pesquisar...";
});

const temFiltroAtivo = computed(
  () =>
    searchQuery.value.length > 0 ||
    camposAtivos.value.length !== 2 ||
    filtroStatus.value !== "todos",
);

const colaboradoresFiltrados = computed(() => {
  let resultado = colaboradores.value;
  if (filtroStatus.value !== "todos") {
    resultado = resultado.filter((colaborador) => colaborador.status === filtroStatus.value);
  }
  const consulta = searchQuery.value.trim().toLocaleLowerCase("pt-BR");
  if (!consulta || camposAtivos.value.length === 0) {
    return resultado;
  }
  return resultado.filter((colaborador) => {
    const searchInNome = camposAtivos.value.includes("nome") &&
      String(colaborador.nome || "").toLocaleLowerCase("pt-BR").includes(consulta);
      
    const searchInTags = camposAtivos.value.includes("especialidades") &&
      Array.isArray(colaborador.especialidades) &&
      colaborador.especialidades.some(esp => esp.toLocaleLowerCase("pt-BR").includes(consulta));
      
    return searchInNome || searchInTags;
  });
});

function obterMensagemErro(error) {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data?.detail) return data.detail;
  if (data?.non_field_errors?.length) return data.non_field_errors.join(" ");
  if (data && typeof data === "object") {
    const mensagens = Object.entries(data).flatMap(([campo, valor]) => {
      const itens = Array.isArray(valor) ? valor : [valor];
      return itens
        .filter((item) => typeof item === "string")
        .map((item) => `${campo}: ${item}`);
    });
    if (mensagens.length) return mensagens.join(" ");
  }
  if (error?.response?.status === 401) {
    return "Sua sessão expirou. Entre novamente no sistema.";
  }
  if (error?.response?.status === 403) {
    return "Você não tem permissão para realizar esta operação.";
  }
  if (error?.response?.status === 409) {
    return "Existe um conflito com a agenda. Verifique os agendamentos antes de continuar.";
  }
  if (!error?.response) {
    return "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.";
  }
  return "Ocorreu um erro inesperado. Tente novamente.";
}

function normalizarColaborador(item) {
  const roleId = Number(item.role);
  const roleNome = String(item.role_nome || "").toUpperCase();
  const roleChave =
    roleNome ||
    Object.keys(ROLES).find((chave) => ROLES[chave] === roleId) ||
    "";
  const nome = item.usuario_nome || "Nome não informado";
  const iniciais = nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
  return {
    id: item.id,
    nome,
    iniciais: iniciais || "CO",
    roleId,
    funcao: nomesFuncoes[roleChave] || roleChave || "Função não identificada",
    roleNome: roleChave,
    status: item.ativo ? "ativo" : "inativo",
    ativo: Boolean(item.ativo),
    pode_editar_agenda: Boolean(item.pode_editar_agenda),
    especialidades: item.especialidades || []
  };
}

async function carregarColaboradores() {
  carregando.value = true;
  erroCarregamento.value = "";
  try {
    const response = await api.get("/api/colaboradores/");
    const dados = response.data;
    const lista = Array.isArray(dados) ? dados : dados?.results;
    if (!Array.isArray(lista)) {
      throw new Error("A API retornou um formato de lista inesperado.");
    }
    colaboradores.value = lista.map(normalizarColaborador);
  } catch (error) {
    erroCarregamento.value = obterMensagemErro(error);
  } finally {
    carregando.value = false;
  }
}

function dispararToast(message, type = "success") {
  if (toastTimeout) clearTimeout(toastTimeout);
  toast.value = { show: true, message, type };
  toastTimeout = setTimeout(() => {
    toast.value.show = false;
  }, 4000);
}

function toggleCampo(campo) {
  const index = camposAtivos.value.indexOf(campo);
  if (index === -1) {
    camposAtivos.value.push(campo);
  } else if (camposAtivos.value.length > 1) {
    camposAtivos.value.splice(index, 1);
  }
}

function limparFiltros() {
  camposAtivos.value = ["nome", "especialidades"];
  filtroStatus.value = "todos";
  searchQuery.value = "";
}

function abrirModalCriacao() {
  modalMode.value = "criar";
  colaboradorSelecionado.value = null;
  isModalOpen.value = true;
}

function abrirModalEdicao(colaborador) {
  modalMode.value = "editar";
  colaboradorSelecionado.value = { ...colaborador };
  isModalOpen.value = true;
}

function abrirModalDetalhes(colaborador) {
  modalMode.value = "detalhes";
  colaboradorSelecionado.value = { ...colaborador };
  isModalOpen.value = true;
}

function fecharModal() {
  isModalOpen.value = false;
  colaboradorSelecionado.value = null;
}

async function salvarColaborador(dados) {
  try {
    if (dados.id) {
      const payload = {
        role: Number(dados.roleId),
        pode_editar_agenda:
          Number(dados.roleId) === ROLES.PROFISSIONAL
            ? Boolean(dados.pode_editar_agenda)
            : false,
        especialidades: Number(dados.roleId) === ROLES.PROFISSIONAL ? dados.especialidades : []
      };
      await api.patch(`/api/colaboradores/${dados.id}/`, payload);
      dispararToast(`Colaborador "${dados.nome}" atualizado com sucesso.`);
    } else {
      const payload = {
        nome_completo: dados.nome.trim(),
        cpf: String(dados.cpf || "").replace(/\D/g, ""),
        role: Number(dados.roleId),
        pode_editar_agenda:
          Number(dados.roleId) === ROLES.PROFISSIONAL
            ? Boolean(dados.pode_editar_agenda)
            : false,
        especialidades: Number(dados.roleId) === ROLES.PROFISSIONAL ? dados.especialidades : []
      };
      await api.post("/api/colaboradores/", payload);
      dispararToast(`Colaborador "${dados.nome}" cadastrado com sucesso.`);
    }
    fecharModal();
    await carregarColaboradores();
  } catch (error) {
    dispararToast(obterMensagemErro(error), "error");
  }
}

async function alternarStatus(colaborador) {
  if (carregando.value) return;
  const ativar = colaborador.status === "inativo";
  const acao = ativar ? "reativar" : "desativar";
  const mensagem = ativar
    ? `Deseja reativar o vínculo de ${colaborador.nome} nesta clínica?`
    : `Deseja desativar ${colaborador.nome}? O histórico será preservado.`;
  if (!window.confirm(mensagem)) return;
  try {
    if (ativar) {
      await api.patch(`/api/colaboradores/${colaborador.id}/`, {
        ativo: true,
      });
    } else {
      await api.delete(`/api/colaboradores/${colaborador.id}/`);
    }
    dispararToast(`Colaborador "${colaborador.nome}" ${acao === "reativar" ? "reativado" : "desativado"} com sucesso.`);
    await carregarColaboradores();
  } catch (error) {
    dispararToast(obterMensagemErro(error), "error");
  }
}

onMounted(carregarColaboradores);

onUnmounted(() => {
  if (toastTimeout) clearTimeout(toastTimeout);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.page-container {
  min-height: 100vh;
  background-color: #f8fafc;
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
  background-color: #fff;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 5%), 0 2px 4px -1px rgb(0 0 0 / 3%);
  border: 1px solid #f1f5f9;
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
  color: #94a3b8;
  font-size: 1.1rem;
}
.search-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.85rem 1rem 0.85rem 3rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  outline: none;
  font-size: 1rem;
  color: #334155;
  background-color: #f8fafc;
  transition: border-color 0.25s ease, background-color 0.25s ease, box-shadow 0.25s ease;
  font-family: inherit;
}
.search-input:focus {
  border-color: #1ca4a7;
  background-color: #fff;
  box-shadow: 0 0 0 4px rgb(28 164 167 / 10%);
}
.btn-novo,
.btn-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background-color: #1ca4a7;
  color: #fff;
  padding: 0.85rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
  white-space: nowrap;
  font-family: inherit;
}
.btn-novo:hover,
.btn-empty:hover {
  background-color: #158a8d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(28 164 167 / 20%);
}
.btn-novo:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  white-space: nowrap;
}
.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.chip {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
  font-family: inherit;
}
.chip:hover {
  border-color: #1ca4a7;
  color: #1ca4a7;
  background-color: #f0fdfd;
}
.chip.active {
  background-color: #1ca4a7;
  border-color: #1ca4a7;
  color: #fff;
}
.chip-status.active {
  background-color: #334155;
  border-color: #334155;
  color: #fff;
}
.divider {
  width: 1px;
  height: 24px;
  background-color: #e2e8f0;
}
.btn-limpar {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-left: auto;
  transition: background-color 0.2s ease;
  font-family: inherit;
}
.btn-limpar:hover {
  background-color: #fef2f2;
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
.loading-state {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  color: #64748b;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}
.loading-state i {
  color: #1ca4a7;
  font-size: 1.3rem;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #64748b;
  gap: 0.75rem;
  text-align: center;
  background: #fff;
  border-radius: 16px;
  border: 1px dashed #cbd5e1;
}
.empty-state h3,
.empty-state p {
  margin: 0;
}
.empty-state h3 {
  color: #334155;
  font-size: 1.05rem;
}
.empty-state p {
  max-width: 440px;
  font-size: 0.9rem;
  line-height: 1.6;
}
.empty-icon {
  font-size: 3rem;
  color: #cbd5e1;
  margin-bottom: 0.25rem;
}
.btn-empty {
  margin-top: 0.75rem;
}
.btn-empty-secondary {
  color: #475569;
  background: #f1f5f9;
}
.btn-empty-secondary:hover {
  color: #334155;
  background: #e2e8f0;
  box-shadow: none;
}
.error-panel {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  color: #991b1b;
  background: #fff7f7;
  border: 1px solid #fecaca;
  border-radius: 16px;
}
.error-panel > i {
  font-size: 1.5rem;
  margin-top: 0.1rem;
}
.error-panel strong {
  display: block;
  margin-bottom: 0.35rem;
}
.error-panel p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}
.btn-retry {
  margin-top: 0.9rem;
  padding: 0.6rem 0.9rem;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  color: #991b1b;
  background: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
}
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  max-width: min(480px, calc(100vw - 2rem));
  background: #334155;
  color: #fff;
  padding: 1rem 1.1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 25px -5px rgb(0 0 0 / 20%);
  border-left: 4px solid #1ca4a7;
  z-index: 3000;
  font-weight: 500;
  line-height: 1.5;
}
.toast-notification.error {
  background: #7f1d1d;
  border-left-color: #f87171;
}
.toast-close {
  margin-left: auto;
  border: none;
  background: transparent;
  color: inherit;
  opacity: 0.75;
  cursor: pointer;
  padding: 0.25rem;
}
.toast-close:hover {
  opacity: 1;
}
.list-enter-active,
.list-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
.list-leave-active {
  position: absolute;
}
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(14px) scale(0.98);
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
    width: 100%;
  }
}
@media (max-width: 768px) {
  .page-content {
    padding: 1rem;
  }
  .action-panel {
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
  .collaborators-grid {
    grid-template-columns: 1fr;
  }
  .toast-notification {
    right: 1rem;
    bottom: 1rem;
  }
}
</style>