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
      <section class="cards-section-container">
        <div class="cards-section-header">
          <h3><i class="pi pi-users"></i> Lista de Colaboradores</h3>
          <span class="results-count">
            {{ colaboradoresFiltrados.length }}
            {{
              colaboradoresFiltrados.length === 1
                ? "colaborador encontrado"
                : "colaboradores encontrados"
            }}
          </span>
        </div>
        <div class="cards-section-body">
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
              :pode-editar="podeEditar(colaborador)"
              :pode-alterar-status="podeAlterarStatus(colaborador)"
              @detalhes="abrirModalDetalhes"
              @editar="abrirModalEdicao"
              @toggle-status="alternarStatus"
              @gerar-codigo="gerarNovoCodigo"
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
        </div>
      </section>
    </main>
    <ColaboradorModal
      :is-open="isModalOpen"
      :mode="modalMode"
      :colaborador-edicao="colaboradorSelecionado"
      :tags-disponiveis="tagsDisponiveis"
      :salvando="salvando"
      :roles-permitidos="rolesPermitidos"
      :role-bloqueado="roleBloqueado"
      @close="fecharModal"
      @save="salvarColaborador"
    />
    <CodigoPrimeiroAcessoModal
      :is-open="codigoModal.aberto"
      :nome="codigoModal.nome"
      :codigo="codigoModal.codigo"
      :expira-em="codigoModal.expiraEm"
      @close="fecharCodigoModal"
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
import { useAuthStore } from "@/store/auth";
import StatCard from "../../layouts/Components/StatCard.vue";
import ColaboradorCard from "./components/ColaboradorCard.vue";
import ColaboradorModal from "./components/ColaboradorModal.vue";
import CodigoPrimeiroAcessoModal from "./components/CodigoPrimeiroAcessoModal.vue";
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
const authStore = useAuthStore();
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
const gerandoCodigo = ref(false);
const codigoModal = ref({ aberto: false, nome: "", codigo: "", expiraEm: "" });
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
const papelLogado = computed(() => String(authStore.role || "").toUpperCase());
const ehAdminLogado = computed(() => papelLogado.value === "ADMIN");
function ehProprio(colaborador) {
  return (
    Boolean(authStore.usuario?.id) &&
    String(colaborador?.usuarioId || "") === String(authStore.usuario.id)
  );
}
function podeEditar(colaborador) {
  return colaborador.roleNome !== "ADMIN" || ehProprio(colaborador);
}
function podeAlterarStatus(colaborador) {
  if (colaborador.roleNome === "ADMIN" && !ehProprio(colaborador)) return false;
  if (!ehAdminLogado.value && ehProprio(colaborador)) return false;
  return true;
}
const rolesPermitidos = computed(() => {
  if (ehAdminLogado.value || modalMode.value === "criar") {
    return [ROLES.ADMIN, ROLES.SECRETARIO, ROLES.PROFISSIONAL];
  }
  return [ROLES.SECRETARIO, ROLES.PROFISSIONAL];
});
const roleBloqueado = computed(
  () =>
    !ehAdminLogado.value &&
    modalMode.value === "editar" &&
    ehProprio(colaboradorSelecionado.value)
);
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
    usuarioId: item.usuario,
    nome,
    iniciais: iniciais || "CO",
    roleId,
    funcao: nomesFuncoes[roleChave] || roleChave || "Função não identificada",
    roleNome: roleChave,
    status: item.ativo ? "ativo" : "inativo",
    ativo: Boolean(item.ativo),
    pode_editar_agenda: Boolean(item.pode_editar_agenda),
    primeiroAcessoPendente: Boolean(item.primeiro_acesso_pendente),
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
function exibirCodigo(nome, primeiroAcesso) {
  codigoModal.value = {
    aberto: true,
    nome,
    codigo: primeiroAcesso.codigo,
    expiraEm: primeiroAcesso.expira_em || "",
  };
}
function fecharCodigoModal() {
  codigoModal.value = { aberto: false, nome: "", codigo: "", expiraEm: "" };
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
  let primeiroAcesso = null;
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
      const response = await api.post("/api/colaboradores/", payload);
      primeiroAcesso = response.data?.primeiro_acesso || null;
      dispararToast(
        primeiroAcesso
          ? `Colaborador "${dados.nome}" cadastrado com sucesso.`
          : `Colaborador "${dados.nome}" cadastrado. Este usuário já possui senha e entra com o CPF e a senha atuais.`
      );
    }
    fecharModal();
    await carregarColaboradores();
    if (primeiroAcesso?.codigo) {
      exibirCodigo(dados.nome, primeiroAcesso);
    }
  } catch (error) {
    dispararToast(obterMensagemErro(error), "error");
  } finally {
    salvando.value = false;
  }
}
async function gerarNovoCodigo(colaborador) {
  if (carregando.value || gerandoCodigo.value) return;
  const mensagem = `Gerar um novo código de primeiro acesso para ${colaborador.nome}? O código anterior deixará de funcionar.`;
  if (!window.confirm(mensagem)) return;
  gerandoCodigo.value = true;
  try {
    const response = await api.post(
      `/api/colaboradores/${colaborador.id}/novo-codigo-primeiro-acesso/`
    );
    const primeiroAcesso = response.data?.primeiro_acesso;
    if (!primeiroAcesso?.codigo) {
      dispararToast("A API não retornou o código de primeiro acesso.", "error");
      return;
    }
    exibirCodigo(colaborador.nome, primeiroAcesso);
  } catch (error) {
    dispararToast(obterMensagemErro(error), "error");
  } finally {
    gerandoCodigo.value = false;
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
  width: min(100%, 1600px);
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.action-panel {
  background: linear-gradient(135deg, #ffffff 0%, #fdfdfe 100%);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-sizing: border-box;
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
  flex: 1 1 340px;
  max-width: 480px;
  min-width: 0;
  width: 100%;
}
.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 16px;
  pointer-events: none;
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
  font-weight: 500;
  color: #0f172a;
  background-color: #f8fafc;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}
.search-input::placeholder {
  color: #94a3b8;
  font-weight: 400;
}
.search-input:hover {
  border-color: #94a3b8;
  background-color: #fff;
}
.search-input:focus {
  border-color: var(--cor-primaria, #1ca4a7);
  background-color: #fff;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.12);
}
.btn-novo,
.btn-empty {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: var(--cor-primaria, #1ca4a7);
  color: #fff;
  min-height: 48px;
  padding: 0 22px;
  border: 1px solid transparent;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.25);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  font-family: inherit;
}
.btn-novo:hover:not(:disabled),
.btn-empty:hover {
  background-color: #158a8d;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(28, 164, 167, 0.35);
}
.btn-novo:focus-visible,
.btn-empty:focus-visible {
  outline: 3px solid rgba(28, 164, 167, 0.35);
  outline-offset: 2px;
}
.btn-novo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.filters-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
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
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.filter-label i {
  color: var(--cor-primaria, #1ca4a7);
  font-size: 13px;
}
.chips-container {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #f1f5f9;
}
.chip {
  background-color: transparent;
  border: 1px solid transparent;
  color: #475569;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}
.chip:hover:not(.active) {
  color: #0f172a;
  background-color: rgba(255, 255, 255, 0.7);
}
.chip.active {
  color: var(--cor-primaria, #168f92);
  background-color: #fff;
  border-color: #cbd5e1;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
}
.chip-status.active {
  color: #1e293b;
}
.divider {
  width: 1px;
  height: 28px;
  background-color: #e2e8f0;
}
.btn-limpar {
  background: none;
  border: 1px solid transparent;
  color: #dc2626;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 14px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  transition: all 0.2s ease;
  font-family: inherit;
}
.btn-limpar:hover {
  background-color: #fef2f2;
  border-color: #fecaca;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}
.cards-section-container {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
  box-sizing: border-box;
}
.cards-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding-bottom: 16px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}
.cards-section-header h3 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
}
.cards-section-header h3 i {
  color: var(--cor-primaria, #1ca4a7);
}
.results-count {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 20px;
  white-space: nowrap;
}
.collaborators-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
  position: relative;
}
.loading-state {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
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
  padding: 40px 20px;
  color: #64748b;
  gap: 4px;
  text-align: center;
  background: #f8fafc;
  border-radius: 14px;
  border: 1px dashed #cbd5e1;
}
.empty-state h3,
.empty-state p {
  margin: 0;
}
.empty-state h3 {
  color: #0f172a;
  font-size: 15px;
  font-weight: 600;
}
.empty-state p {
  max-width: 440px;
  font-size: 12px;
  line-height: 1.6;
  color: #64748b;
}
.empty-icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: #e2e8f0;
  font-size: 24px;
  color: #64748b;
  margin-bottom: 12px;
}
.btn-empty {
  margin-top: 18px;
  min-height: 44px;
  font-size: 13px;
}
.btn-empty-secondary {
  color: #475569;
  background: #fff;
  border-color: #cbd5e1;
  box-shadow: none;
}
.btn-empty-secondary:hover:not(:disabled) {
  color: #0f172a;
  background: #f1f5f9;
  border-color: #94a3b8;
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
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
}
.error-panel > i {
  font-size: 22px;
  margin-top: 2px;
}
.error-panel strong {
  display: block;
  margin-bottom: 6px;
  font-size: 15px;
  font-weight: 600;
}
.error-panel p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
}
.btn-retry {
  margin-top: 14px;
  height: 40px;
  padding: 0 18px;
  border: 1px solid #fecaca;
  border-radius: 12px;
  color: #b91c1c;
  background: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-retry:hover {
  background: #fee2e2;
  transform: translateY(-1px);
}
.toast-notification {
  position: fixed;
  bottom: 24px;
  right: 24px;
  max-width: min(420px, calc(100vw - 32px));
  background: #fff;
  color: #065f46;
  padding: 15px 18px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.14);
  border: 1px solid #d1fae5;
  z-index: 3000;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
}
.toast-notification.error {
  background: #fff;
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
  border-radius: 8px;
  transition: all 0.2s ease;
}
.toast-close:hover {
  opacity: 1;
  background: #f1f5f9;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.35s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(12px);
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
@media (max-width: 1024px) {
  .filters-row {
    gap: 16px;
  }
}
@media (max-width: 992px) {
  .top-row {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input-wrapper {
    max-width: 100%;
    flex-basis: auto;
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
    padding: 18px;
  }
  .filters-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
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
@media (max-width: 640px) {
  .cards-section-container {
    padding: 16px;
  }
  .cards-section-header {
    align-items: flex-start;
    flex-direction: column;
  }
  .chips-container {
    width: 100%;
    box-sizing: border-box;
  }
  .chip {
    flex: 1;
    padding: 0 10px;
  }
}
</style>
