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
          <button class="btn-novo" @click="abrirModalCriacao" :disabled="carregando">
            <i class="pi pi-plus"></i> Novo Cliente
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
            <span class="filter-label"><i class="pi pi-check-circle"></i> Cadastro:</span>
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
          <span class="stat-number">{{ totalClientes }}</span>
          <span class="stat-label">Total de Clientes</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ clientesAtivos }}</span>
          <span class="stat-label">Clientes Ativos</span>
        </div>
        <div class="stat-card">
          <span class="stat-number">{{ clientesInativos }}</span>
          <span class="stat-label">Clientes Inativos</span>
        </div>
      </div>
      <section class="cards-section-container">
        <div class="cards-section-header">
          <h3><i class="pi pi-users"></i> Lista de Clientes</h3>
          <span class="results-count">
            {{ clientesFiltrados.length }}
            {{
              clientesFiltrados.length === 1
                ? "cliente encontrado"
                : "clientes encontrados"
            }}
          </span>
        </div>
        <div class="cards-section-body">
          <div v-if="carregando" class="empty-state">
            <i class="pi pi-spin pi-spinner empty-icon"></i>
            <p>Carregando clientes...</p>
          </div>
          <TransitionGroup v-else name="list" tag="div" class="clients-grid">
            <ClientCard
              v-for="cliente in clientesFiltrados"
              :key="cliente.id"
              :cliente="cliente"
              @detalhes="abrirModalDetalhes"
              @editar="abrirModalEdicao"
              @toggle-status="alternarStatus"
            />
          </TransitionGroup>
          <div v-if="!carregando && clientesFiltrados.length === 0" class="empty-state">
            <i class="pi pi-users empty-icon"></i>
            <p>Nenhum cliente encontrado com os filtros atuais.</p>
          </div>
        </div>
      </section>
    </main>
    <ClientModal
      :is-open="isModalOpen"
      :mode="modalMode"
      :cliente-edicao="clienteSelecionado"
      @close="fecharModal"
      @save="salvarCliente"
      @notify="receberNotificacaoModal"
    />
    <Transition name="toast">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <i
          :class="['pi', toast.type === 'error' ? 'pi-times-circle' : 'pi-check-circle']"
        ></i>
        <span>{{ toast.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/services/api";
import ClientCard from "./components/ClientCard.vue";
import ClientModal from "./components/ClientModal.vue";
const clientes = ref([]);
const carregando = ref(false);
const searchQuery = ref("");
const camposAtivos = ref(["nome"]);
const filtroStatus = ref("todos");
const isModalOpen = ref(false);
const modalMode = ref("criar");
const clienteSelecionado = ref(null);
const toast = ref({ show: false, message: "", type: "success" });
const camposBusca = [
  { label: "Nome", value: "nome" },
  { label: "CPF", value: "cpf" },
  { label: "Telefone", value: "telefone" },
];
const statusBusca = [
  { label: "Todos", value: "todos" },
  { label: "Ativos", value: "ATIVO" },
  { label: "Inativos", value: "INATIVO" },
];
const buscarClientes = async () => {
  carregando.value = true;
  try {
    const response = await api.get("/api/clientes/");
    clientes.value = response.data.results || response.data;
  } catch (error) {
    dispararToast("Erro ao carregar os clientes.", "error");
  } finally {
    carregando.value = false;
  }
};
onMounted(() => {
  buscarClientes();
});
const totalClientes = computed(() => clientes.value.length);
const clientesAtivos = computed(
  () => clientes.value.filter((c) => c.status_cadastro === "ATIVO").length
);
const clientesInativos = computed(
  () => clientes.value.filter((c) => c.status_cadastro === "INATIVO").length
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
const clientesFiltrados = computed(() => {
  let resultado = clientes.value;
  if (filtroStatus.value !== "todos") {
    resultado = resultado.filter((c) => c.status_cadastro === filtroStatus.value);
  }
  if (!searchQuery.value || camposAtivos.value.length === 0) {
    return resultado;
  }
  const queryLimpa = searchQuery.value.toLowerCase().replace(/\D/g, "");
  const queryNormal = searchQuery.value.toLowerCase();
  return resultado.filter((c) => {
    return camposAtivos.value.some((campo) => {
      if (campo === "cpf") {
        const valorLimpo = String(c.usuario_cpf || "").replace(/\D/g, "");
        return valorLimpo.includes(queryLimpa);
      }
      if (campo === "telefone") {
        const valorLimpo = String(c.telefone || "").replace(/\D/g, "");
        return valorLimpo.includes(queryLimpa);
      }
      if (campo === "nome") {
        const valor = String(c.usuario_nome || "").toLowerCase();
        return valor.includes(queryNormal);
      }
      return false;
    });
  });
});
const dispararToast = (mensagem, tipo = "success") => {
  toast.value = { show: true, message: mensagem, type: tipo };
  setTimeout(() => {
    toast.value.show = false;
  }, 3500);
};
const receberNotificacaoModal = (evento) => {
  dispararToast(evento.message, evento.type);
};
const abrirModalCriacao = () => {
  modalMode.value = "criar";
  clienteSelecionado.value = null;
  isModalOpen.value = true;
};
const abrirModalEdicao = (cliente) => {
  modalMode.value = "editar";
  clienteSelecionado.value = cliente;
  isModalOpen.value = true;
};
const abrirModalDetalhes = (cliente) => {
  modalMode.value = "detalhes";
  clienteSelecionado.value = cliente;
  isModalOpen.value = true;
};
const fecharModal = () => {
  isModalOpen.value = false;
  clienteSelecionado.value = null;
};
const salvarCliente = async (dadosForm) => {
  const payload = {
    nome_completo: dadosForm.nome,
    cpf: dadosForm.cpf.replace(/\D/g, ""),
    telefone: dadosForm.telefone.replace(/\D/g, ""),
    cep: dadosForm.cep.replace(/\D/g, ""),
    numero_endereco: dadosForm.numero,
    status_cadastro: dadosForm.status_cadastro,
  };
  try {
    if (dadosForm.id) {
      await api.patch(`/api/clientes/${dadosForm.id}/`, payload);
      dispararToast(`Cliente atualizado com sucesso!`);
    } else {
      await api.post("/api/clientes/", payload);
      dispararToast(`Cliente cadastrado com sucesso!`);
    }
    fecharModal();
    buscarClientes();
  } catch (error) {
    const erroAPI = error.response?.data;
    const msg = erroAPI
      ? Object.values(erroAPI).flat()[0]
      : "Erro ao processar solicitação.";
    dispararToast(msg, "error");
  }
};
const alternarStatus = async (cliente) => {
  const novoStatus = cliente.status_cadastro === "ATIVO" ? "INATIVO" : "ATIVO";
  try {
    await api.patch(`/api/clientes/${cliente.id}/`, { status_cadastro: novoStatus });
    dispararToast(`Status do cliente atualizado para ${novoStatus}.`);
    buscarClientes();
  } catch (error) {
    dispararToast("Erro ao alterar o status do cliente.", "error");
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
.page-container {
  min-height: 100vh;
  background: var(--cor-fundo, #f5f7fa);
  display: flex;
  flex-direction: column;
  font-family: "Inter", sans-serif;
}
.page-content {
  padding: 28px;
  flex-grow: 1;
  width: min(100%, 1600px);
  box-sizing: border-box;
  margin: 0 auto;
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
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}
.search-input-wrapper {
  position: relative;
  flex-grow: 1;
  max-width: 600px;
}
.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 15px;
}
.search-input {
  width: 100%;
  height: 48px;
  padding: 0 16px 0 44px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  outline: none;
  font-size: 14px;
  color: #0f172a;
  background: #f8fafc;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: inherit;
}
.search-input::placeholder {
  color: #94a3b8;
}
.search-input:hover {
  border-color: #94a3b8;
  background: #fff;
}
.search-input:focus {
  border-color: var(--cor-primaria, #1ca4a7);
  background: #fff;
  box-shadow: 0 0 0 4px rgba(28, 164, 167, 0.12);
}
.btn-novo {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--cor-primaria, #1ca4a7);
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
  box-shadow: 0 4px 12px rgba(28, 164, 167, 0.25);
}
.btn-novo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
.btn-novo:hover:not(:disabled) {
  background: #158a8d;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(28, 164, 167, 0.35);
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
  flex-wrap: wrap;
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
}
.filter-label i {
  color: var(--cor-primaria, #1ca4a7);
  font-size: 13px;
}
.chips-container {
  box-sizing: border-box;
  display: inline-flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 4px;
  padding: 4px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #f1f5f9;
}
.chip {
  box-sizing: border-box;
  min-height: 34px;
  padding: 0 14px;
  background: transparent;
  border: 1px solid transparent;
  color: #475569;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  font-family: inherit;
}
.chip:hover:not(.active) {
  color: #0f172a;
  background: rgba(255, 255, 255, 0.7);
}
.chip.active {
  color: var(--cor-primaria, #168f92);
  background: #ffffff;
  border-color: #cbd5e1;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
}
.chip-status.active {
  color: #1e293b;
}
.divider {
  width: 1px;
  height: 24px;
  background: #e2e8f0;
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
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  font-family: inherit;
}
.btn-limpar:hover {
  background: #fef2f2;
}
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.stat-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.02);
  transition: transform 0.3s ease, border-color 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--cor-primaria, #1ca4a7);
}
.stat-number {
  font-size: 1.8rem;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.2;
}
.stat-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
.clients-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #64748b;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  text-align: center;
  border-radius: 14px;
  gap: 8px;
  grid-column: 1/-1;
  font-size: 14px;
}
.empty-state p {
  margin: 0;
}
.empty-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: #e2e8f0;
  display: grid;
  place-items: center;
  font-size: 24px;
  color: #64748b;
  margin-bottom: 4px;
}
.empty-icon.pi-spinner {
  background: transparent;
  color: var(--cor-primaria, #1ca4a7);
}
.toast-notification {
  position: fixed;
  bottom: 28px;
  right: 28px;
  background: #fff;
  color: #334155;
  padding: 15px 18px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.14);
  border: 1px solid #d1fae5;
  max-width: min(420px, calc(100vw - 32px));
  font-size: 13px;
  font-weight: 600;
  z-index: 3000;
}
.toast-notification.error {
  border-color: #fecaca;
}
.toast-notification.error i {
  color: #dc2626;
}
.toast-notification i {
  color: #10b981;
  font-size: 18px;
}
.list-enter-active,
.list-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(16px);
}
.list-leave-active {
  position: absolute;
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.96);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(16px) scale(0.96);
}
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 992px) {
  .filters-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .divider {
    display: none;
  }
  .btn-limpar {
    margin-left: 0;
  }
}
@media (max-width: 760px) {
  .page-content {
    padding: 16px;
    gap: 16px;
  }
  .action-panel {
    padding: 18px;
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
  .btn-limpar {
    width: 100%;
    justify-content: center;
  }
}
@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .cards-section-container {
    padding: 16px;
  }
  .cards-section-header {
    align-items: flex-start;
    flex-direction: column;
  }
  .chips-container {
    width: 100%;
  }
  .chip {
    flex: 1;
    padding: 0 10px;
  }
}
</style>
