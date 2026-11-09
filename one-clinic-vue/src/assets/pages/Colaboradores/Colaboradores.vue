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
      <TransitionGroup v-else name="list" tag="div" class="collaborators-grid">
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
          {{
            searchQuery || filtroStatus !== "todos"
              ? "Tente alterar os filtros da sua busca."
              : "Cadastre o primeiro colaborador desta clínica."
          }}
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
      :salvando="salvando"
      @close="fecharModal"
      @save="salvarColaborador"
    />
    <Transition name="toast">
      <div v-if="toast.show" :class="['toast-notification', toast.type]" role="status">
        <i
          :class="
            toast.type === 'error' ? 'pi pi-exclamation-circle' : 'pi pi-check-circle'
          "
        ></i>
        <span>{{ toast.message }}</span>
        <button
          class="toast-close"
          aria-label="Fechar notificação"
          @click="toast.show = false"
        >
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
const salvando = ref(false);
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
  () => colaboradores.value.filter((c) => c.status === "ativo").length
);
const colaboradoresInativos = computed(
  () => colaboradores.value.filter((c) => c.status === "inativo").length
);
const tagsDisponiveis = computed(() => {
  const tags = new Set();
  colaboradores.value.forEach((c) => {
    if (Array.isArray(c.especialidades)) {
      c.especialidades.forEach((tag) => tags.add(tag));
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
    filtroStatus.value !== "todos"
);
const colaboradoresFiltrados = computed(() => {
  let resultado = colaboradores.value;
  if (filtroStatus.value !== "todos") {
    resultado = resultado.filter(
      (colaborador) => colaborador.status === filtroStatus.value
    );
  }
  const consulta = searchQuery.value.trim().toLocaleLowerCase("pt-BR");
  if (!consulta || camposAtivos.value.length === 0) {
    return resultado;
  }
  return resultado.filter((colaborador) => {
    const searchInNome =
      camposAtivos.value.includes("nome") &&
      String(colaborador.nome || "")
        .toLocaleLowerCase("pt-BR")
        .includes(consulta);
    const searchInTags =
      camposAtivos.value.includes("especialidades") &&
      Array.isArray(colaborador.especialidades) &&
      colaborador.especialidades.some((esp) =>
        esp.toLocaleLowerCase("pt-BR").includes(consulta)
      );
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
        .map((item) => (campo === "detail" ? item : `${campo}: ${item}`));
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
    roleNome || Object.keys(ROLES).find((chave) => ROLES[chave] === roleId) || "";
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
    especialidades: item.especialidades || [],
    criadoEm: item.created_at || "",
    atualizadoEm: item.updated_at || "",
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
function normalizarEspecialidades(lista) {
  const vistos = new Set();
  const resultado = [];
  (Array.isArray(lista) ? lista : []).forEach((item) => {
    const nome = String(item || "")
      .trim()
      .replace(/\s+/g, " ");
    const chave = nome.toLocaleLowerCase("pt-BR");
    if (nome && !vistos.has(chave)) {
      vistos.add(chave);
      resultado.push(nome);
    }
  });
  return resultado;
}
async function salvarColaborador(dados) {
  if (salvando.value) return;
  salvando.value = true;
  try {
    if (dados.id) {
      const payload = {
        role: Number(dados.roleId),
        pode_editar_agenda:
          Number(dados.roleId) === ROLES.PROFISSIONAL
            ? Boolean(dados.pode_editar_agenda)
            : false,
        especialidades:
          Number(dados.roleId) === ROLES.PROFISSIONAL
            ? normalizarEspecialidades(dados.especialidades)
            : [],
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
        especialidades:
          Number(dados.roleId) === ROLES.PROFISSIONAL
            ? normalizarEspecialidades(dados.especialidades)
            : [],
      };
      await api.post("/api/colaboradores/", payload);
      dispararToast(`Colaborador "${dados.nome}" cadastrado com sucesso.`);
    }
    fecharModal();
    await carregarColaboradores();
  } catch (error) {
    dispararToast(obterMensagemErro(error), "error");
  } finally {
    salvando.value = false;
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
    dispararToast(
      `Colaborador "${colaborador.nome}" ${
        acao === "reativar" ? "reativado" : "desativado"
      } com sucesso.`
    );
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
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
.page-container {
  min-height: 100vh;
  background-color: var(--cor-fundo, #f5f7fa);
  display: flex;
  flex-direction: column;
  font-family: "Inter", sans-serif;
}
.page-content {
  padding: 28px;
  flex-grow: 1;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.action-panel {
  background: linear-gradient(180deg, #fff 0%, #fcfdff 100%);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
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
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 15px;
}
.search-input {
  width: 100%;
  box-sizing: border-box;
  height: 48px;
  padding: 0 16px 0 46px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  outline: none;
  font-size: 14px;
  color: #334155;
  background-color: #f8fafc;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}
.search-input:focus {
  border-color: var(--cor-primaria, #1ca4a7);
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.12);
}
.btn-novo,
.btn-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--cor-primaria, #1ca4a7);
  color: #fff;
  height: 48px;
  padding: 0 24px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  font-family: inherit;
}
.btn-novo:hover,
.btn-empty:hover {
  background-color: #158a8d;
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -4px rgba(28, 164, 167, 0.3);
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
  gap: 24px;
}
.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.filter-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.chip {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}
.chip:hover {
  border-color: var(--cor-primaria, #1ca4a7);
  color: #0f766e;
  background-color: #f0fdfa;
}
.chip.active {
  background-color: var(--cor-primaria, #1ca4a7);
  border-color: var(--cor-primaria, #1ca4a7);
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
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 7px 14px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  transition: background-color 0.25s ease;
  font-family: inherit;
}
.btn-limpar:hover {
  background-color: #fef2f2;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
.collaborators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}
.loading-state {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748b;
  font-size: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}
.loading-state i {
  color: var(--cor-primaria, #1ca4a7);
  font-size: 20px;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 56px 24px;
  color: #64748b;
  gap: 10px;
  text-align: center;
  background: #f8fafc;
  border-radius: 14px;
  border: 2px dashed #cbd5e1;
}
.empty-state h3,
.empty-state p {
  margin: 0;
}
.empty-state h3 {
  color: #334155;
  font-size: 16px;
  font-weight: 600;
}
.empty-state p {
  max-width: 440px;
  font-size: 13px;
  line-height: 1.6;
}
.empty-icon {
  font-size: 44px;
  color: #cbd5e1;
  margin-bottom: 4px;
}
.btn-empty {
  margin-top: 10px;
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
  gap: 16px;
  padding: 24px;
  color: #b91c1c;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 16px;
}
.error-panel > i {
  font-size: 22px;
  margin-top: 2px;
}
.error-panel strong {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}
.error-panel p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}
.btn-retry {
  margin-top: 14px;
  height: 38px;
  padding: 0 16px;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #b91c1c;
  background: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.25s ease;
}
.btn-retry:hover {
  background: #fee2e2;
}
.toast-notification {
  position: fixed;
  bottom: 28px;
  right: 28px;
  max-width: min(480px, calc(100vw - 32px));
  background: #fff;
  color: #334155;
  padding: 14px 16px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.12);
  border: 1px solid #a7f3d0;
  z-index: 3000;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}
.toast-notification.error {
  background: #fef2f2;
  color: #b91c1c;
  border-color: #fecaca;
}
.toast-close {
  margin-left: auto;
  border: none;
  background: transparent;
  color: inherit;
  opacity: 0.6;
  cursor: pointer;
  padding: 4px;
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
    padding: 16px;
    gap: 16px;
  }
  .action-panel {
    padding: 16px;
  }
  .filters-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
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
    right: 16px;
    bottom: 16px;
  }
}
</style>
